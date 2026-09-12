import {
  INTERVAL_MAP,
  getOutcomeTier,
  calculateConsecutiveStep,
  getIntervalDays,
  generateDueReason,
  evaluateTaskRevision,
  calculateRevisionQueue,
  getLearnerLocalDateStr,
  getLearnerCalendarDaysDiff
} from "../services/revision-service/revisionScheduler.js";

function assert(condition, message) {
  if (!condition) {
    console.error("FAIL:", message);
    throw new Error(message);
  }
}

console.log("==================================================");
console.log("RUNNING REVISION SCHEDULER UNIT TESTS");
console.log("==================================================");

// 1. Explicit consecutive step semantics and tier change reset
console.log("Test 1: Step calculation & tier reset...");
const historyTierReset = [
  { outcome: "SOLVED_WITH_SOLUTION", confidence: "LOW", attemptedAt: new Date("2026-09-01T10:00:00Z") },
  { outcome: "SOLVED_WITH_SOLUTION", confidence: "LOW", attemptedAt: new Date("2026-09-02T10:00:00Z") },
  { outcome: "SOLVED_INDEPENDENT", confidence: "HIGH", attemptedAt: new Date("2026-09-04T10:00:00Z") },
  { outcome: "SOLVED_INDEPENDENT", confidence: "HIGH", attemptedAt: new Date("2026-09-11T10:00:00Z") }
];

// Sub-slice 1: 1st WITH_SOLUTION -> step 0 (1d)
const step1 = calculateConsecutiveStep([historyTierReset[0]], "WITH_SOLUTION");
assert(step1 === 0, `Expected step 0, got ${step1}`);
assert(getIntervalDays("WITH_SOLUTION", step1) === 1, "Expected 1d for WITH_SOLUTION step 0");

// Sub-slice 2: 2nd WITH_SOLUTION -> step 1 (2d)
const step2 = calculateConsecutiveStep(historyTierReset.slice(0, 2), "WITH_SOLUTION");
assert(step2 === 1, `Expected step 1, got ${step2}`);
assert(getIntervalDays("WITH_SOLUTION", step2) === 2, "Expected 2d for WITH_SOLUTION step 1");

// Sub-slice 3: 1st INDEPENDENT + HIGH -> tier changed, RESET to step 0 (7d)
const step3 = calculateConsecutiveStep(historyTierReset.slice(0, 3), "INDEPENDENT_HIGH");
assert(step3 === 0, `Expected tier reset to step 0, got ${step3}`);
assert(getIntervalDays("INDEPENDENT_HIGH", step3) === 7, "Expected 7d for INDEPENDENT_HIGH step 0");

// Sub-slice 4: 2nd INDEPENDENT + HIGH -> step 1 (14d)
const step4 = calculateConsecutiveStep(historyTierReset, "INDEPENDENT_HIGH");
assert(step4 === 1, `Expected step 1, got ${step4}`);
assert(getIntervalDays("INDEPENDENT_HIGH", step4) === 14, "Expected 14d for INDEPENDENT_HIGH step 1");

console.log("PASS: Step calculation and tier reset verified.");

// 2. Interval matrices
console.log("Test 2: Verifying all interval progressions...");
// INDEPENDENT_HIGH: 7d -> 14d -> 30d
assert(INTERVAL_MAP.INDEPENDENT_HIGH[0] === 7, "INDEPENDENT_HIGH 0");
assert(INTERVAL_MAP.INDEPENDENT_HIGH[1] === 14, "INDEPENDENT_HIGH 1");
assert(INTERVAL_MAP.INDEPENDENT_HIGH[2] === 30, "INDEPENDENT_HIGH 2");

// INDEPENDENT_LOW_MED: 3d -> 7d -> 14d -> 30d
assert(INTERVAL_MAP.INDEPENDENT_LOW_MED[0] === 3, "INDEPENDENT_LOW_MED 0");
assert(INTERVAL_MAP.INDEPENDENT_LOW_MED[1] === 7, "INDEPENDENT_LOW_MED 1");
assert(INTERVAL_MAP.INDEPENDENT_LOW_MED[2] === 14, "INDEPENDENT_LOW_MED 2");
assert(INTERVAL_MAP.INDEPENDENT_LOW_MED[3] === 30, "INDEPENDENT_LOW_MED 3");

// WITH_HINTS: 2d -> 5d -> 10d -> 21d
assert(INTERVAL_MAP.WITH_HINTS[0] === 2, "WITH_HINTS 0");
assert(INTERVAL_MAP.WITH_HINTS[1] === 5, "WITH_HINTS 1");
assert(INTERVAL_MAP.WITH_HINTS[2] === 10, "WITH_HINTS 2");
assert(INTERVAL_MAP.WITH_HINTS[3] === 21, "WITH_HINTS 3");

// WITH_SOLUTION: 1d -> 2d -> 5d -> 12d
assert(INTERVAL_MAP.WITH_SOLUTION[0] === 1, "WITH_SOLUTION 0");
assert(INTERVAL_MAP.WITH_SOLUTION[1] === 2, "WITH_SOLUTION 1");
assert(INTERVAL_MAP.WITH_SOLUTION[2] === 5, "WITH_SOLUTION 2");
assert(INTERVAL_MAP.WITH_SOLUTION[3] === 12, "WITH_SOLUTION 3");

// UNSOLVED progressive backoff: 1d -> 3d -> 7d -> 14d
assert(getIntervalDays("UNSOLVED", 0) === 1, "UNSOLVED step 0");
assert(getIntervalDays("UNSOLVED", 1) === 3, "UNSOLVED step 1");
assert(getIntervalDays("UNSOLVED", 2) === 7, "UNSOLVED step 2");
assert(getIntervalDays("UNSOLVED", 3) === 14, "UNSOLVED step 3 backoff to pattern review");
console.log("PASS: Interval progressions verified.");

// 3. Zero fabricated historical outcome data on Legacy Completion
console.log("Test 3: Legacy completion with no solveHistory...");
const legacyTask = { _id: "task_legacy_1", taskName: "Two Sum", taskId: 1 };
const legacyProg = {
  status: "done",
  completedAt: new Date("2026-08-20T10:00:00Z"),
  solveHistory: [] // empty
};
const evalLegacy = evaluateTaskRevision({
  task: legacyTask,
  userProgress: legacyProg,
  today: new Date("2026-09-08T10:00:00Z"),
  timezoneOffsetMinutes: -330 // IST
});

assert(evalLegacy.tier === "LEGACY_COMPLETION", `Expected tier LEGACY_COMPLETION, got ${evalLegacy.tier}`);
assert(evalLegacy.latestOutcome === "LEGACY_COMPLETION", `Must not fabricate outcome: got ${evalLegacy.latestOutcome}`);
assert(evalLegacy.latestConfidence === "UNKNOWN", `Must not fabricate confidence: got ${evalLegacy.latestConfidence}`);
assert(evalLegacy.reason === "Previously completed — retention check", `Reason must be honest: got "${evalLegacy.reason}"`);
assert(evalLegacy.isDue === true, "20 days past completedAt must be due");
console.log("PASS: Legacy completion preserves integrity without fabricating outcome or confidence.");

// 4. Timezone handling
console.log("Test 4: Timezone consistency...");
// Sep 8 2026 at 23:00 UTC is Sep 9 2026 at 04:30 in IST (-330 offset)
const testDateUtc = new Date("2026-09-08T23:30:00Z");
const localDateStrIst = getLearnerLocalDateStr(testDateUtc, -330);
assert(localDateStrIst === "2026-09-09", `Expected 2026-09-09 in IST, got ${localDateStrIst}`);

const localDateStrUtc = getLearnerLocalDateStr(testDateUtc, 0);
assert(localDateStrUtc === "2026-09-08", `Expected 2026-09-08 in UTC, got ${localDateStrUtc}`);

const diffDays = getLearnerCalendarDaysDiff(new Date("2026-09-09T10:00:00Z"), new Date("2026-09-07T10:00:00Z"), -330);
assert(diffDays === 2, `Expected 2 calendar days diff, got ${diffDays}`);
console.log("PASS: Timezone consistency verified.");

// 5. Recommended queue capping vs total due
console.log("Test 5: Recommended queue capping (5 items) vs remaining due count...");
const mockTasks = [];
const mockProg = [];
for (let i = 1; i <= 12; i++) {
  const t = { _id: `task_${i}`, taskName: `Problem ${i}`, taskId: i };
  mockTasks.push(t);
  mockProg.push({
    taskId: t._id,
    status: "done",
    solveHistory: [
      {
        outcome: "SOLVED_INDEPENDENT",
        confidence: "HIGH",
        attemptedAt: new Date("2026-08-01T10:00:00Z") // 38 days ago -> definitely due
      }
    ]
  });
}

const queueResult = calculateRevisionQueue({
  userProgressList: mockProg,
  childTasks: mockTasks,
  today: new Date("2026-09-08T10:00:00Z"),
  timezoneOffsetMinutes: -330
});

assert(queueResult.totalDueCount === 12, `Expected totalDueCount 12, got ${queueResult.totalDueCount}`);
assert(queueResult.recommendedCount === 5, `Expected recommendedCount 5, got ${queueResult.recommendedCount}`);
assert(queueResult.remainingDueCount === 7, `Expected remainingDueCount 7, got ${queueResult.remainingDueCount}`);
assert(queueResult.recommendedQueue.length === 5, `Expected 5 items in recommendedQueue`);
assert(queueResult.remainingDueList.length === 7, `Expected 7 items in remainingDueList`);
console.log("PASS: Queue capped at 5 with transparent remaining count.");

console.log("==================================================");
console.log("ALL REVISION SCHEDULER UNIT TESTS PASSED SUCCESSFULLY");
console.log("==================================================");

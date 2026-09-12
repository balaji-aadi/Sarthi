import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.config.js";
import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";
import { UserTaskProgress } from "../models/userTaskProgress.model.js";
import { DailyRevision } from "../models/dailyRevision.model.js";
import {
  calculateConsecutiveStep,
  getIntervalDays,
  evaluateTaskRevision,
  calculateRevisionQueue,
  getLearnerLocalDateStr
} from "../services/revision-service/revisionScheduler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    throw new Error(message);
  }
}

async function runTests() {
  console.log("==================================================");
  console.log("PHASE 3: SCHEDULER RECALCULATION & MULTI-USER ISOLATION TEST");
  console.log("==================================================");

  await connectDB();
  console.log("Connected to MongoDB for Phase 3 verification.");

  try {
    // -------------------------------------------------------------
    // TEST 1: Recalculation from new attempt
    // -------------------------------------------------------------
    console.log("\n[Test 1] Recalculation from new attempt: Sep 8 -> Sep 9 Solve Again");
    const taskMock = {
      _id: new mongoose.Types.ObjectId(),
      taskName: "Valid Anagram",
      taskId: 242,
      difficulty: "Easy"
    };

    // Attempt 1 on Sep 8: SOLVED_WITH_SOLUTION + LOW
    const sep8Date = new Date("2026-09-08T10:00:00Z");
    const progressAttempt1 = {
      status: "done",
      latestOutcome: "SOLVED_WITH_SOLUTION",
      latestConfidence: "LOW",
      solveHistory: [
        {
          outcome: "SOLVED_WITH_SOLUTION",
          confidence: "LOW",
          attemptedAt: sep8Date
        }
      ]
    };

    const evalAttempt1 = evaluateTaskRevision({
      task: taskMock,
      userProgress: progressAttempt1,
      today: sep8Date,
      timezoneOffsetMinutes: 0
    });

    assert(evalAttempt1.intervalDays === 1, `Sep 8 Attempt 1 interval must be 1d, got ${evalAttempt1.intervalDays}`);
    const expectedDue1 = new Date(sep8Date.getTime() + 1 * 86400000);
    assert(evalAttempt1.dueDate.toISOString() === expectedDue1.toISOString(), "Due date must be Sep 9");

    // Attempt 2 on Sep 9: Solve Again -> SOLVED_INDEPENDENT + HIGH
    const sep9Date = new Date("2026-09-09T10:00:00Z");
    const progressAttempt2 = {
      status: "done",
      latestOutcome: "SOLVED_INDEPENDENT",
      latestConfidence: "HIGH",
      solveHistory: [
        {
          outcome: "SOLVED_WITH_SOLUTION",
          confidence: "LOW",
          attemptedAt: sep8Date
        },
        {
          outcome: "SOLVED_INDEPENDENT",
          confidence: "HIGH",
          attemptedAt: sep9Date
        }
      ]
    };

    const evalAttempt2 = evaluateTaskRevision({
      task: taskMock,
      userProgress: progressAttempt2,
      today: sep9Date,
      timezoneOffsetMinutes: 0
    });

    // Schedule must recalculate from Sep 9 attempt: Sep 9 + 7d = Sep 16
    assert(evalAttempt2.step === 0, `Step under new tier must be reset to 0, got ${evalAttempt2.step}`);
    assert(evalAttempt2.intervalDays === 7, `Interval under INDEPENDENT_HIGH must be 7d, got ${evalAttempt2.intervalDays}`);
    const expectedDue2 = new Date(sep9Date.getTime() + 7 * 86400000);
    assert(evalAttempt2.dueDate.toISOString() === expectedDue2.toISOString(), `Due date must be Sep 16, got ${evalAttempt2.dueDate.toISOString()}`);
    console.log("PASS: Schedule successfully recalculated from new attempt anchor date.");

    // -------------------------------------------------------------
    // TEST 2: Consecutive step progression and tier reset
    // -------------------------------------------------------------
    console.log("\n[Test 2] Consecutive step semantics under current outcome tier");
    const tierHistory = [
      { outcome: "SOLVED_WITH_SOLUTION", confidence: "LOW" }, // step 0 (1d)
      { outcome: "SOLVED_WITH_SOLUTION", confidence: "LOW" }, // step 1 (2d)
      { outcome: "SOLVED_INDEPENDENT", confidence: "HIGH" },   // step 0 (7d) -> Reset!
      { outcome: "SOLVED_INDEPENDENT", confidence: "HIGH" }    // step 1 (14d)
    ];

    assert(calculateConsecutiveStep(tierHistory.slice(0, 1), "WITH_SOLUTION") === 0, "Step 0 for 1st with_solution");
    assert(getIntervalDays("WITH_SOLUTION", 0) === 1, "1d for with_solution step 0");

    assert(calculateConsecutiveStep(tierHistory.slice(0, 2), "WITH_SOLUTION") === 1, "Step 1 for 2nd with_solution");
    assert(getIntervalDays("WITH_SOLUTION", 1) === 2, "2d for with_solution step 1");

    assert(calculateConsecutiveStep(tierHistory.slice(0, 3), "INDEPENDENT_HIGH") === 0, "Step 0 for 1st independent_high (tier changed)");
    assert(getIntervalDays("INDEPENDENT_HIGH", 0) === 7, "7d for independent_high step 0");

    assert(calculateConsecutiveStep(tierHistory, "INDEPENDENT_HIGH") === 1, "Step 1 for 2nd independent_high");
    assert(getIntervalDays("INDEPENDENT_HIGH", 1) === 14, "14d for independent_high step 1");
    console.log("PASS: Consecutive step semantics and tier change reset verified.");

    // -------------------------------------------------------------
    // TEST 3: Zero fabricated data on legacy completion
    // -------------------------------------------------------------
    console.log("\n[Test 3] Zero fabricated outcome/confidence on legacy completion");
    const evalLegacy = evaluateTaskRevision({
      task: { _id: new mongoose.Types.ObjectId(), taskName: "Legacy Task", taskId: 999 },
      userProgress: { status: "done", completedAt: new Date("2026-08-15T00:00:00Z"), solveHistory: [] },
      today: new Date("2026-09-08T00:00:00Z"),
      timezoneOffsetMinutes: 0
    });

    assert(evalLegacy.latestOutcome === "LEGACY_COMPLETION", `Must not fabricate outcome: got ${evalLegacy.latestOutcome}`);
    assert(evalLegacy.latestConfidence === "UNKNOWN", `Must not fabricate confidence: got ${evalLegacy.latestConfidence}`);
    assert(evalLegacy.reason === "Previously completed — retention check", `Reason must match: got "${evalLegacy.reason}"`);
    console.log("PASS: Legacy completion preserves integrity with zero fabricated data.");

    // -------------------------------------------------------------
    // TEST 4: Multi-User Isolation in Revision
    // -------------------------------------------------------------
    console.log("\n[Test 4] Multi-User Isolation: User A vs User B revision queue");

    // Pick a sample DSA task from DB (READ-ONLY)
    const sampleTask = await Task.findOne({
      taskId: { $exists: true, $ne: null }
    }).select("_id taskName taskId difficulty leetcodeUrl patternRef parentTask projectName").lean();

    assert(sampleTask != null, "Sample task must exist in DB");
    console.log(`Using sample task for isolation test: "${sampleTask.taskName}" (ID: ${sampleTask.taskId})`);

    const userAId = new mongoose.Types.ObjectId("6993047f16e85ff3e4efd9a3"); // Admin
    const userBId = new mongoose.Types.ObjectId("67c3047f16e85ff3e4efd999"); // Test user

    // User A has solved this task independently on Sep 1 (interval 7d -> due Sep 8)
    const userAProg = {
      userId: userAId,
      taskId: sampleTask._id,
      status: "done",
      latestOutcome: "SOLVED_INDEPENDENT",
      latestConfidence: "HIGH",
      solveHistory: [
        {
          outcome: "SOLVED_INDEPENDENT",
          confidence: "HIGH",
          attemptedAt: new Date("2026-09-01T10:00:00Z")
        }
      ]
    };

    // User B has solved this task with solution on Sep 8 (interval 1d -> due Sep 9)
    const userBProg = {
      userId: userBId,
      taskId: sampleTask._id,
      status: "done",
      latestOutcome: "SOLVED_WITH_SOLUTION",
      latestConfidence: "LOW",
      solveHistory: [
        {
          outcome: "SOLVED_WITH_SOLUTION",
          confidence: "LOW",
          attemptedAt: new Date("2026-09-08T10:00:00Z")
        }
      ]
    };

    // Evaluate for Sep 8:
    const evalA_Sep8 = evaluateTaskRevision({
      task: sampleTask,
      userProgress: userAProg,
      today: new Date("2026-09-08T10:00:00Z"),
      timezoneOffsetMinutes: 0
    });

    const evalB_Sep8 = evaluateTaskRevision({
      task: sampleTask,
      userProgress: userBProg,
      today: new Date("2026-09-08T10:00:00Z"),
      timezoneOffsetMinutes: 0
    });

    // User A: 7 days after Sep 1 is Sep 8 -> IS DUE on Sep 8!
    assert(evalA_Sep8.isDue === true, "User A task must be due on Sep 8");
    assert(evalA_Sep8.intervalDays === 7, "User A interval must be 7d");
    assert(evalA_Sep8.latestOutcome === "SOLVED_INDEPENDENT", "User A outcome must be INDEPENDENT");

    // User B: 1 day after Sep 8 is Sep 9 -> NOT DUE on Sep 8!
    assert(evalB_Sep8.isDue === false, "User B task must NOT be due on Sep 8 (due on Sep 9)");
    assert(evalB_Sep8.intervalDays === 1, "User B interval must be 1d");
    assert(evalB_Sep8.latestOutcome === "SOLVED_WITH_SOLUTION", "User B outcome must be WITH_SOLUTION");

    console.log("PASS: Multi-user isolation in revision calculations verified.");
    console.log(`User A (Admin): Due=${evalA_Sep8.isDue}, Interval=${evalA_Sep8.intervalDays}d, Outcome=${evalA_Sep8.latestOutcome}`);
    console.log(`User B (Test):  Due=${evalB_Sep8.isDue}, Interval=${evalB_Sep8.intervalDays}d, Outcome=${evalB_Sep8.latestOutcome}`);

    // -------------------------------------------------------------
    // TEST 5: Database Counts Invariant Check
    // -------------------------------------------------------------
    console.log("\n[Test 5] Database invariants check");
    const dsaProjectIds = await Project.find({ key: { $in: ["DSA", "DSAP2", "DSAP3"] } }).distinct("_id");
    const totalDsaTaskCount = await Task.countDocuments({ projectName: { $in: dsaProjectIds } });
    const dsaChildrenCount = await Task.countDocuments({ projectName: { $in: dsaProjectIds }, parentTask: { $ne: null } });
    const dsaTopicsCount = await Task.countDocuments({ projectName: { $in: dsaProjectIds }, parentTask: null });
    
    console.log(`Current Total DSA Records: ${totalDsaTaskCount} (${dsaTopicsCount} Topics + ${dsaChildrenCount} Questions)`);
    assert(totalDsaTaskCount === 392, `Expected exactly 392 DSA records, found ${totalDsaTaskCount}`);
    assert(dsaChildrenCount === 336, `Expected exactly 336 DSA child questions, found ${dsaChildrenCount}`);
    assert(dsaTopicsCount === 56, `Expected exactly 56 DSA parent topics, found ${dsaTopicsCount}`);

    console.log("\n==================================================");
    console.log("ALL PHASE 3 VERIFICATION TESTS PASSED SUCCESSFULLY");
    console.log("==================================================");
  } finally {
    await mongoose.disconnect();
  }
}

runTests().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});

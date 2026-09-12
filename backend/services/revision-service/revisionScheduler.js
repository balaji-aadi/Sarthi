/**
 * revisionScheduler.js
 * 
 * Pure deterministic spaced revision scheduling engine for Sarthi Phase 3.
 * ZERO database dependencies, ZERO side-effects, ZERO AI/ML.
 * 
 * Answers: "What should I revisit today, and why?"
 */

// Interval progressions in days
export const INTERVAL_MAP = {
  INDEPENDENT_HIGH: [7, 14, 30],
  INDEPENDENT_LOW_MED: [3, 7, 14, 30],
  WITH_HINTS: [2, 5, 10, 21],
  WITH_SOLUTION: [1, 2, 5, 12],
  UNSOLVED: [1, 3, 7], // Step 3+ backs off to 14d with pattern review flag
  LEGACY_COMPLETION: [7, 14, 30] // Conservative initial spacing for legacy data with no solveHistory
};

// Priority tier for sorting due items (lower index = higher priority to review first)
const TIER_PRIORITY = {
  UNSOLVED: 0,
  WITH_SOLUTION: 1,
  WITH_HINTS: 2,
  LEGACY_COMPLETION: 3,
  INDEPENDENT_LOW_MED: 4,
  INDEPENDENT_HIGH: 5
};

const CONFIDENCE_PRIORITY = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  UNKNOWN: 3
};

/**
 * Converts a date and client timezone offset (in minutes, from Date.prototype.getTimezoneOffset)
 * into a local "YYYY-MM-DD" calendar date string.
 *
 * In browser JS: new Date().getTimezoneOffset() returns minutes UTC - Local.
 * e.g., IST (UTC+5:30) is -330.
 * localTime = date.getTime() - (timezoneOffsetMinutes * 60000)
 */
export function getLearnerLocalDateStr(date = new Date(), timezoneOffsetMinutes = 0) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const offsetMs = Number(timezoneOffsetMinutes || 0) * 60000;
  const localDate = new Date(d.getTime() - offsetMs);
  return localDate.toISOString().split("T")[0];
}

/**
 * Returns a timestamp representing the start of the learner's local day in UTC epoch milliseconds.
 */
export function getLearnerStartOfDayMs(date = new Date(), timezoneOffsetMinutes = 0) {
  const localDateStr = getLearnerLocalDateStr(date, timezoneOffsetMinutes);
  if (!localDateStr) return 0;
  const [y, m, d] = localDateStr.split("-").map(Number);
  const midnightUtc = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
  const offsetMs = Number(timezoneOffsetMinutes || 0) * 60000;
  return midnightUtc + offsetMs;
}

/**
 * Computes the calendar days difference between two dates in the learner's timezone: (d1 - d2).
 */
export function getLearnerCalendarDaysDiff(date1, date2, timezoneOffsetMinutes = 0) {
  const start1 = getLearnerStartOfDayMs(date1, timezoneOffsetMinutes);
  const start2 = getLearnerStartOfDayMs(date2, timezoneOffsetMinutes);
  return Math.round((start1 - start2) / 86400000);
}

/**
 * Maps solve attempt outcome and confidence to an outcome tier.
 */
export function getOutcomeTier(outcome, confidence) {
  if (!outcome) return "LEGACY_COMPLETION";

  switch (outcome) {
    case "SOLVED_INDEPENDENT":
      return confidence === "HIGH" ? "INDEPENDENT_HIGH" : "INDEPENDENT_LOW_MED";
    case "SOLVED_WITH_HINTS":
      return "WITH_HINTS";
    case "SOLVED_WITH_SOLUTION":
      return "WITH_SOLUTION";
    case "UNSOLVED":
      return "UNSOLVED";
    default:
      return "LEGACY_COMPLETION";
  }
}

/**
 * Computes the consecutive step count under the CURRENT outcome tier.
 * Consecutive step:
 * Step 0 = 1st attempt in this tier
 * Step 1 = 2nd consecutive attempt in this tier
 * ...
 * If tier changes, step resets to 0.
 */
export function calculateConsecutiveStep(solveHistory = [], latestTier) {
  if (!Array.isArray(solveHistory) || solveHistory.length <= 1) {
    return 0;
  }

  // Count backwards from index N - 2
  let step = 0;
  for (let i = solveHistory.length - 2; i >= 0; i--) {
    const prevAttempt = solveHistory[i];
    const prevTier = getOutcomeTier(prevAttempt?.outcome, prevAttempt?.confidence);
    if (prevTier === latestTier) {
      step++;
    } else {
      break; // Tier changed, reset/stop counting
    }
  }

  return step;
}

/**
 * Determines interval in days based on tier and consecutive step.
 */
export function getIntervalDays(tier, step = 0) {
  const sequence = INTERVAL_MAP[tier] || INTERVAL_MAP.LEGACY_COMPLETION;

  if (tier === "UNSOLVED") {
    if (step >= sequence.length) {
      return 14; // Progressive backoff to pattern review, not daily spam
    }
    return sequence[step];
  }

  if (step >= sequence.length) {
    return sequence[sequence.length - 1]; // Cap at last interval (e.g. 30d, 21d, 12d)
  }

  return sequence[step];
}

/**
 * Generates an honest, deterministic explanation for why an item is due.
 * Never claims "Mastered" or fabricates false independent outcomes.
 */
export function generateDueReason({ tier, outcome, confidence, step, intervalDays }) {
  switch (tier) {
    case "WITH_SOLUTION":
      return step === 0
        ? "Solved with solution previously (1d recall check)"
        : `Solved with solution previously (${intervalDays}d reinforcement check)`;

    case "WITH_HINTS":
      return confidence === "LOW"
        ? `Solved with hints + low confidence (${intervalDays}d consolidation)`
        : `Assisted solve retention check (${intervalDays}d spacing)`;

    case "INDEPENDENT_HIGH":
      return `Independent solve due for retention check (${intervalDays}d spacing)`;

    case "INDEPENDENT_LOW_MED":
      return `Independent solve with moderate confidence (${intervalDays}d verification)`;

    case "UNSOLVED":
      return step >= 2
        ? `Repeatedly unsolved (${intervalDays}d backoff) — recommended for pattern review`
        : `Previous unsolved attempt — progressive retry (${intervalDays}d spacing)`;

    case "LEGACY_COMPLETION":
    default:
      return "Previously completed — retention check";
  }
}

/**
 * Evaluates a single task's revision state for a learner.
 * Returns scheduling details: dueDate, intervalDays, isDue, overdueDays, reason, etc.
 */
export function evaluateTaskRevision({
  task,
  userProgress,
  today = new Date(),
  timezoneOffsetMinutes = 0
}) {
  const solveHistory = Array.isArray(userProgress?.solveHistory) ? userProgress.solveHistory : [];
  const hasHistory = solveHistory.length > 0;
  const latestAttempt = hasHistory ? solveHistory[solveHistory.length - 1] : null;

  // Outcome & confidence: strictly from actual latest attempt, never fabricated
  const latestOutcome = latestAttempt?.outcome || (userProgress?.latestOutcome || null);
  const latestConfidence = latestAttempt?.confidence || (userProgress?.latestConfidence || null);
  const tier = hasHistory
    ? getOutcomeTier(latestOutcome, latestConfidence)
    : "LEGACY_COMPLETION";

  // Anchor date: Recalculate strictly from the latest attempt timestamp!
  // If no solveHistory, anchor on completedAt or updatedAt
  const anchorDate = latestAttempt?.attemptedAt
    ? new Date(latestAttempt.attemptedAt)
    : (userProgress?.completedAt ? new Date(userProgress.completedAt) : (userProgress?.updatedAt ? new Date(userProgress.updatedAt) : new Date(task.createdAt || today)));

  const step = hasHistory ? calculateConsecutiveStep(solveHistory, tier) : 0;
  const intervalDays = getIntervalDays(tier, step);

  // Due Date: Anchor date + intervalDays
  const dueDate = new Date(anchorDate.getTime() + (intervalDays * 86400000));

  // Determine if due today in learner local timezone
  // An item is due if its learner local calendar date <= today's learner local calendar date
  const todayLocalDateStr = getLearnerLocalDateStr(today, timezoneOffsetMinutes);
  const dueLocalDateStr = getLearnerLocalDateStr(dueDate, timezoneOffsetMinutes);

  const daysDifference = getLearnerCalendarDaysDiff(today, dueDate, timezoneOffsetMinutes);
  const isDue = daysDifference >= 0;
  const isOverdue = daysDifference > 0;
  const overdueDays = Math.max(0, daysDifference);

  const reason = generateDueReason({
    tier,
    outcome: latestOutcome,
    confidence: latestConfidence,
    step,
    intervalDays
  });

  return {
    taskId: (task._id || task.id).toString(),
    taskName: task.taskName,
    taskIdNumber: task.taskId,
    difficulty: task.difficulty || null,
    topic: task.parentTask?.taskName || task.projectName?.name || "DSA",
    patternRef: task.patternRef || null,
    leetcodeUrl: task.leetcodeUrl || null,
    anchorDate,
    anchorLocalDateStr: getLearnerLocalDateStr(anchorDate, timezoneOffsetMinutes),
    dueDate,
    dueLocalDateStr,
    intervalDays,
    step,
    tier,
    latestOutcome: hasHistory ? latestOutcome : "LEGACY_COMPLETION",
    latestConfidence: hasHistory ? latestConfidence : "UNKNOWN",
    latestAttemptNotes: latestAttempt?.notes || "",
    isDue,
    isOverdue,
    overdueDays,
    reason,
    tierPriority: TIER_PRIORITY[tier] ?? 3,
    confidencePriority: CONFIDENCE_PRIORITY[latestConfidence] ?? 3
  };
}

/**
 * Pure calculation engine to generate the daily revision queue.
 * 
 * @param {Object} params
 * @param {Array} params.userProgressList - Array of UserTaskProgress POJOs for the user
 * @param {Array} params.childTasks - Array of Task POJOs eligible for revision
 * @param {Date} params.today - Current reference date
 * @param {number} params.timezoneOffsetMinutes - Browser timezone offset in minutes
 * @param {Array<string>} params.dailyCompletedTaskIds - Task IDs already revised today by user
 * @returns {Object} Structured revision queue with recommended items and summary metrics
 */
export function calculateRevisionQueue({
  userProgressList = [],
  childTasks = [],
  today = new Date(),
  timezoneOffsetMinutes = 0,
  dailyCompletedTaskIds = []
}) {
  const completedTaskSet = new Set(dailyCompletedTaskIds.map(String));
  const progressMap = new Map();
  userProgressList.forEach(p => {
    const tid = (p.taskId?._id || p.taskId || "").toString();
    if (tid) progressMap.set(tid, p);
  });

  let totalCompletedProblems = 0;
  const allEvaluations = [];
  const completedTodayList = [];

  childTasks.forEach(task => {
    const tid = (task._id || task.id).toString();
    const userProg = progressMap.get(tid);

    const isTaskCompleted = userProg && (userProg.status === "done" || userProg.completedAt != null);
    const hasHistory = userProg && Array.isArray(userProg.solveHistory) && userProg.solveHistory.length > 0;

    // A problem qualifies for revision if it was completed or has solveHistory
    if (isTaskCompleted || hasHistory) {
      totalCompletedProblems++;

      const evaluation = evaluateTaskRevision({
        task,
        userProgress: userProg,
        today,
        timezoneOffsetMinutes
      });

      if (completedTaskSet.has(tid)) {
        completedTodayList.push({
          ...evaluation,
          isCompletedToday: true
        });
      } else {
        allEvaluations.push(evaluation);
      }
    }
  });

  // Separate due items vs upcoming items
  const dueItems = allEvaluations.filter(item => item.isDue);
  const upcomingItems = allEvaluations.filter(item => !item.isDue);

  // Deterministic sorting of due items:
  // 1. Most overdue days descending (urgency)
  // 2. Tier priority (UNSOLVED > WITH_SOLUTION > WITH_HINTS > LEGACY > INDEPENDENT)
  // 3. Confidence priority (LOW > MEDIUM > HIGH > UNKNOWN)
  // 4. Task ID tie-breaker
  dueItems.sort((a, b) => {
    if (b.overdueDays !== a.overdueDays) {
      return b.overdueDays - a.overdueDays;
    }
    if (a.tierPriority !== b.tierPriority) {
      return a.tierPriority - b.tierPriority;
    }
    if (a.confidencePriority !== b.confidencePriority) {
      return a.confidencePriority - b.confidencePriority;
    }
    return (a.taskIdNumber || 0) - (b.taskIdNumber || 0);
  });

  // Sort upcoming items by next due date ascending
  upcomingItems.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  // Cap recommended queue at 3 to 5 items
  const RECOMMENDED_CAP = 5;
  const recommendedQueue = dueItems.slice(0, RECOMMENDED_CAP);
  const remainingDueList = dueItems.slice(RECOMMENDED_CAP);

  const totalDueCount = dueItems.length;
  const recommendedCount = recommendedQueue.length;
  const remainingDueCount = remainingDueList.length;
  const completedTodayCount = completedTodayList.length;

  const overdueCount = dueItems.filter(item => item.overdueDays > 0).length;
  const dueTodayExactCount = dueItems.filter(item => item.overdueDays === 0).length;

  const weekAgoMs = today.getTime() - (7 * 86400000);
  const revisedThisWeekCount = userProgressList.filter(p => 
    Array.isArray(p.solveHistory) && p.solveHistory.some(s => s.attemptedAt && new Date(s.attemptedAt).getTime() >= weekAgoMs)
  ).length;

  // Determine conservative learner status code
  let status = "REVISION_DUE";
  if (totalCompletedProblems === 0) {
    status = "NO_COMPLETED_PROBLEMS";
  } else if (totalDueCount === 0 && completedTodayCount === 0) {
    status = "ALL_CAUGHT_UP";
  } else if (totalDueCount === 0 && completedTodayCount > 0) {
    status = "ALL_DUE_COMPLETED";
  } else if (recommendedCount === 0 && remainingDueCount === 0 && completedTodayCount > 0) {
    status = "ALL_DUE_COMPLETED";
  } else if (completedTodayCount >= RECOMMENDED_CAP && totalDueCount > 0) {
    status = "RECOMMENDED_COMPLETED_MORE_DUE";
  }

  return {
    status,
    totalCompletedProblems,
    totalDueCount,
    recommendedCount,
    remainingDueCount,
    completedTodayCount,
    overdueCount,
    dueTodayExactCount,
    revisedThisWeekCount,
    recommendedQueue,
    remainingDueList,
    completedTodayList,
    upcomingPreview: upcomingItems.slice(0, 5),
    todayLocalDateStr: getLearnerLocalDateStr(today, timezoneOffsetMinutes)
  };
}

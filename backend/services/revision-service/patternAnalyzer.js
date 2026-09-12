/**
 * patternAnalyzer.js
 * 
 * Pure deterministic pattern alert & weakness detection engine for Sarthi Phase 4.
 * ZERO database dependencies, ZERO side-effects, ZERO AI/ML.
 * 
 * Answers: "Which algorithmic patterns show systemic conceptual weaknesses across multiple problems, and why?"
 */

/**
 * Normalizes an attempt outcome & confidence to a diagnostic severity rank.
 * Lower rank = more severe weakness.
 */
export const OUTCOME_SEVERITY = {
  UNSOLVED: 1,
  SOLVED_WITH_SOLUTION: 2,
  SOLVED_WITH_HINTS_LOW: 3,
  SOLVED_WITH_HINTS_MED_HIGH: 4,
  SOLVED_INDEPENDENT_LOW: 5,
  SOLVED_INDEPENDENT_MED_HIGH: 6,
  LEGACY_NEUTRAL: 99
};

/**
 * Classifies a single task's latest attempt for pattern diagnostics.
 * Strictly evaluates the LATEST attempt in solveHistory.
 * If no solveHistory exists, returns status: 'LEGACY_NEUTRAL'.
 */
export function classifyTaskLatestAttempt(userProgress, today = new Date()) {
  const solveHistory = Array.isArray(userProgress?.solveHistory) ? userProgress.solveHistory : [];
  if (solveHistory.length === 0) {
    return {
      hasHistory: false,
      status: 'LEGACY_NEUTRAL',
      isWeak: false,
      isHealthy: false,
      severityRank: OUTCOME_SEVERITY.LEGACY_NEUTRAL,
      latestAttempt: null,
      daysSinceAttempt: null
    };
  }

  // Ground Truth: Evaluate ONLY the latest attempt
  const latestAttempt = solveHistory[solveHistory.length - 1];
  const outcome = latestAttempt.outcome;
  const confidence = latestAttempt.confidence;
  const attemptDate = new Date(latestAttempt.attemptedAt || userProgress.updatedAt || today);
  const now = new Date(today);
  const daysSinceAttempt = Math.max(0, Math.floor((now.getTime() - attemptDate.getTime()) / 86400000));

  let status = 'HEALTHY';
  let isWeak = false;
  let isHealthy = false;
  let severityRank = OUTCOME_SEVERITY.SOLVED_INDEPENDENT_MED_HIGH;

  switch (outcome) {
    case 'UNSOLVED':
      status = 'UNSOLVED';
      isWeak = true;
      severityRank = OUTCOME_SEVERITY.UNSOLVED;
      break;

    case 'SOLVED_WITH_SOLUTION':
      status = 'SOLVED_WITH_SOLUTION';
      isWeak = true;
      severityRank = OUTCOME_SEVERITY.SOLVED_WITH_SOLUTION;
      break;

    case 'SOLVED_WITH_HINTS':
      if (confidence === 'LOW') {
        status = 'SOLVED_WITH_HINTS_LOW';
        isWeak = true;
        severityRank = OUTCOME_SEVERITY.SOLVED_WITH_HINTS_LOW;
      } else {
        status = 'SOLVED_WITH_HINTS_MED_HIGH';
        isWeak = true;
        severityRank = OUTCOME_SEVERITY.SOLVED_WITH_HINTS_MED_HIGH;
      }
      break;

    case 'SOLVED_INDEPENDENT':
      if (confidence === 'LOW') {
        status = 'SOLVED_INDEPENDENT_LOW';
        isWeak = true; // Low confidence independent solve is flagged as fragile
        severityRank = OUTCOME_SEVERITY.SOLVED_INDEPENDENT_LOW;
      } else {
        status = 'SOLVED_INDEPENDENT';
        isHealthy = true;
        severityRank = OUTCOME_SEVERITY.SOLVED_INDEPENDENT_MED_HIGH;
      }
      break;

    default:
      status = 'LEGACY_NEUTRAL';
      severityRank = OUTCOME_SEVERITY.LEGACY_NEUTRAL;
  }

  return {
    hasHistory: true,
    outcome,
    confidence,
    status,
    isWeak,
    isHealthy,
    severityRank,
    attemptDate,
    daysSinceAttempt,
    latestAttempt
  };
}

/**
 * Extracts a task's numeric task number for deterministic tie-breaking.
 * e.g. "DSA-15" -> 15. Fallbacks to 999999.
 */
function extractTaskNumber(taskIdNumber) {
  if (!taskIdNumber) return 999999;
  const match = String(taskIdNumber).match(/\d+/);
  return match ? parseInt(match[0], 10) : 999999;
}

/**
 * Ranks problems in a pattern to deterministically select the "weakest problem".
 * 
 * Hierarchy:
 * 1. Severity Rank ascending (1 = UNSOLVED, 2 = WITH_SOLUTION, etc.)
 * 2. Confidence ascending (LOW = 1, MEDIUM = 2, HIGH = 3)
 * 3. Recency of weakness attempt descending (freshest attempt first)
 * 4. Task ID number ascending (DSA-1 before DSA-10)
 */
export function rankWeakestProblem(evaluatedProblems) {
  if (!Array.isArray(evaluatedProblems) || evaluatedProblems.length === 0) {
    return null;
  }

  const confidenceScore = { LOW: 1, MEDIUM: 2, HIGH: 3, UNKNOWN: 4 };

  const sorted = [...evaluatedProblems].sort((a, b) => {
    // 1. Severity Rank (lower is weaker)
    if (a.diagnostic.severityRank !== b.diagnostic.severityRank) {
      return a.diagnostic.severityRank - b.diagnostic.severityRank;
    }

    // 2. Confidence (lower is weaker)
    const confA = confidenceScore[a.diagnostic.confidence] || 4;
    const confB = confidenceScore[b.diagnostic.confidence] || 4;
    if (confA !== confB) {
      return confA - confB;
    }

    // 3. Recency of attempt (fresher attempt = lower daysSinceAttempt = higher priority)
    const daysA = a.diagnostic.daysSinceAttempt ?? 99999;
    const daysB = b.diagnostic.daysSinceAttempt ?? 99999;
    if (daysA !== daysB) {
      return daysA - daysB;
    }

    // 4. Task ID number ascending
    const numA = extractTaskNumber(a.taskIdNumber);
    const numB = extractTaskNumber(b.taskIdNumber);
    return numA - numB;
  });

  return sorted[0];
}

/**
 * Formulates a purely factual evidence explanation without speculating on unproven algorithmic bugs.
 */
export function generateFactualEvidence({
  evaluatedCount,
  weakCount,
  unsolvedCount,
  solutionCount,
  hintsCount,
  independentCount,
  patternName
}) {
  const parts = [];

  if (unsolvedCount > 0) {
    parts.push(`${unsolvedCount} ${unsolvedCount === 1 ? 'problem currently unsolved' : 'problems currently unsolved'}`);
  }
  if (solutionCount > 0) {
    parts.push(`${solutionCount} required a solution`);
  }
  if (hintsCount > 0) {
    parts.push(`${hintsCount} solved with hints`);
  }

  const breakdownStr = parts.join(', ');

  if (unsolvedCount >= 2) {
    return `${unsolvedCount} of ${evaluatedCount} evaluated problems in ${patternName} are currently unsolved (${independentCount} solved independently).`;
  }

  if (solutionCount >= 2 && independentCount === 0) {
    return `${solutionCount} of ${evaluatedCount} evaluated problems required full solutions to solve (0 solved independently).`;
  }

  return `${weakCount} of ${evaluatedCount} recent problems in ${patternName} required assistance or were unsolved (${breakdownStr}; ${independentCount} solved independently).`;
}

/**
 * Pure calculation function to evaluate pattern weaknesses across all DSA curriculum tasks for a user.
 * 
 * @param {Object} params
 * @param {Array} params.userProgressList - Array of UserTaskProgress records for the learner
 * @param {Array} params.childTasks - Array of Task objects (curriculum child tasks)
 * @param {Date} [params.today=new Date()] - Reference date
 * @param {number} [params.maxRecencyDays=90] - Cutoff window in days for acute pattern alerts
 * @returns {Object} { activeAlerts: Array, patternsSummary: Object }
 */
export function analyzePatternWeaknesses({
  userProgressList = [],
  childTasks = [],
  today = new Date(),
  maxRecencyDays = 90
}) {
  // Create quick lookup by taskId
  const progressByTaskId = new Map();
  userProgressList.forEach((p) => {
    const tId = (p.taskId?._id || p.taskId || '').toString();
    if (tId) progressByTaskId.set(tId, p);
  });

  // Group child tasks by pattern
  const patternGroups = new Map();

  childTasks.forEach((task) => {
    const taskIdStr = (task._id || task.id || '').toString();
    const userProgress = progressByTaskId.get(taskIdStr) || null;

    // Pattern identity resolution: patternRef takes precedence, fallback to parentTask
    const patternId = (
      task.patternRef?._id || task.patternRef ||
      task.parentTask?._id || task.parentTask ||
      'UNMAPPED'
    ).toString();

    const patternName = (
      task.patternRef?.name ||
      task.parentTask?.taskName ||
      'Other Patterns'
    ).trim();

    const patternSlug = (
      task.patternRef?.slug ||
      patternName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    );

    if (!patternGroups.has(patternId)) {
      patternGroups.set(patternId, {
        patternId,
        patternName,
        patternSlug,
        allTasks: []
      });
    }

    const diagnostic = classifyTaskLatestAttempt(userProgress, today);

    patternGroups.get(patternId).allTasks.push({
      taskId: taskIdStr,
      taskIdNumber: task.taskId,
      taskName: task.taskName,
      difficulty: task.difficulty || null,
      leetcodeUrl: task.leetcodeUrl || null,
      diagnostic
    });
  });

  const activeAlerts = [];
  let healthyPatternsCount = 0;
  let insufficientDataCount = 0;
  let expiredRecencyCount = 0;

  for (const group of patternGroups.values()) {
    // Filter to evaluated problems (problems that have actual solveHistory)
    const evaluatedProblems = group.allTasks.filter((t) => t.diagnostic.hasHistory);
    const evaluatedCount = evaluatedProblems.length;

    // RULE 1: Minimum Threshold Gate (At least 3 evaluated problems required)
    if (evaluatedCount < 3) {
      insufficientDataCount++;
      continue;
    }

    // Identify weak vs healthy problems based strictly on their latest attempt
    const weakProblems = evaluatedProblems.filter((t) => t.diagnostic.isWeak);
    const healthyProblems = evaluatedProblems.filter((t) => t.diagnostic.isHealthy);

    // If no weak problems exist at all, pattern is healthy
    if (weakProblems.length === 0) {
      healthyPatternsCount++;
      continue;
    }

    // RULE 2: 90-Day Recency Invalidation Gate
    // If ALL weak problems in this pattern have their latest attempt older than maxRecencyDays,
    // Phase 4 produces NO active alert (Phase 3 Spaced Revision handles retention independently).
    const recentWeakProblems = weakProblems.filter(
      (t) => t.diagnostic.daysSinceAttempt !== null && t.diagnostic.daysSinceAttempt <= maxRecencyDays
    );

    if (recentWeakProblems.length === 0) {
      expiredRecencyCount++;
      continue;
    }

    // Count distributions
    const unsolvedProblems = evaluatedProblems.filter((t) => t.diagnostic.status === 'UNSOLVED');
    const solutionProblems = evaluatedProblems.filter((t) => t.diagnostic.status === 'SOLVED_WITH_SOLUTION');
    const hintsProblems = evaluatedProblems.filter(
      (t) => t.diagnostic.status === 'SOLVED_WITH_HINTS_LOW' || t.diagnostic.status === 'SOLVED_WITH_HINTS_MED_HIGH'
    );
    const independentProblems = evaluatedProblems.filter(
      (t) => t.diagnostic.status === 'SOLVED_INDEPENDENT'
    );

    const unsolvedCount = unsolvedProblems.length;
    const solutionCount = solutionProblems.length;
    const hintsCount = hintsProblems.length;
    const independentCount = independentProblems.length;
    const weakCount = weakProblems.length;
    const healthyCount = healthyProblems.length;

    // RULE 3: Severity Classification
    let severity = null;

    // Critical Alert Conditions:
    // A: >= 2 distinct problems currently UNSOLVED
    // B: >= 2 distinct problems currently SOLVED_WITH_SOLUTION AND 0 healthy problems
    // C: >= 3 distinct problems currently in {UNSOLVED, SOLVED_WITH_SOLUTION}
    if (
      unsolvedCount >= 2 ||
      (solutionCount >= 2 && healthyCount === 0) ||
      (unsolvedCount + solutionCount >= 3)
    ) {
      severity = 'CRITICAL';
    }
    // Moderate Warning Conditions:
    // A: >= 50% of evaluated problems have weak latest outcomes
    // B: >= 2 problems solved with LOW confidence and 0 problems with HIGH confidence
    else {
      const lowConfidenceCount = evaluatedProblems.filter((t) => t.diagnostic.confidence === 'LOW').length;
      const highConfidenceCount = evaluatedProblems.filter((t) => t.diagnostic.confidence === 'HIGH').length;

      if ((weakCount / evaluatedCount) >= 0.5 || (lowConfidenceCount >= 2 && highConfidenceCount === 0)) {
        severity = 'MODERATE';
      }
    }

    if (!severity) {
      healthyPatternsCount++;
      continue;
    }

    // Select the weakest problem deterministically
    const weakestProblem = rankWeakestProblem(weakProblems);

    // Formulate factual evidence string
    const factualEvidence = generateFactualEvidence({
      evaluatedCount,
      weakCount,
      unsolvedCount,
      solutionCount,
      hintsCount,
      independentCount,
      patternName: group.patternName
    });

    activeAlerts.push({
      patternId: group.patternId,
      patternName: group.patternName,
      patternSlug: group.patternSlug,
      severity, // 'CRITICAL' | 'MODERATE'
      factualEvidence,
      evaluatedCount,
      weakCount,
      unsolvedCount,
      solutionCount,
      hintsCount,
      healthyCount,
      independentCount,
      weakestProblem: weakestProblem
        ? {
            taskId: weakestProblem.taskId,
            taskIdNumber: weakestProblem.taskIdNumber,
            taskName: weakestProblem.taskName,
            difficulty: weakestProblem.difficulty,
            leetcodeUrl: weakestProblem.leetcodeUrl,
            status: weakestProblem.diagnostic.status,
            outcome: weakestProblem.diagnostic.outcome,
            confidence: weakestProblem.diagnostic.confidence,
            daysSinceAttempt: weakestProblem.diagnostic.daysSinceAttempt
          }
        : null,
      evaluatedProblemsList: evaluatedProblems.map((p) => ({
        taskId: p.taskId,
        taskIdNumber: p.taskIdNumber,
        taskName: p.taskName,
        status: p.diagnostic.status,
        outcome: p.diagnostic.outcome,
        confidence: p.diagnostic.confidence,
        isWeak: p.diagnostic.isWeak,
        daysSinceAttempt: p.diagnostic.daysSinceAttempt
      }))
    });
  }

  // Sort alerts: CRITICAL before MODERATE, then weakCount descending, then patternName alphabetical
  activeAlerts.sort((a, b) => {
    if (a.severity !== b.severity) {
      return a.severity === 'CRITICAL' ? -1 : 1;
    }
    if (b.weakCount !== a.weakCount) {
      return b.weakCount - a.weakCount;
    }
    return a.patternName.localeCompare(b.patternName);
  });

  return {
    activeAlerts,
    patternsSummary: {
      totalPatternsTracked: patternGroups.size,
      activeAlertsCount: activeAlerts.length,
      criticalCount: activeAlerts.filter((a) => a.severity === 'CRITICAL').length,
      moderateCount: activeAlerts.filter((a) => a.severity === 'MODERATE').length,
      healthyCount: healthyPatternsCount,
      insufficientDataCount,
      expiredRecencyCount
    }
  };
}

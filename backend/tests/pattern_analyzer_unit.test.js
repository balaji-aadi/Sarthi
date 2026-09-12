/**
 * pattern_analyzer_unit.test.js
 * 
 * Comprehensive Unit Test Suite for Sarthi Phase 4:
 * Deterministic Pattern Alert & Weakness Detection Engine.
 * 
 * Verifies:
 * 1. Minimum 3 evaluated problems threshold (Eligibility Gate)
 * 2. Strict latest-attempt semantics
 * 3. Regression: Historical weak attempt must not remain active after recovery (120d ago -> 5d ago)
 * 4. 90-day recency invalidation (all weak > 90d -> no active alert)
 * 5. Critical and Moderate severity distributions
 * 6. Deterministic weakest problem ranking with all 4 tie-breakers
 * 7. Legacy neutrality (no solveHistory -> zero contribution)
 * 8. Resolution transition to healthy
 * 9. Multi-user independent isolation
 */

import assert from 'assert';
import {
  classifyTaskLatestAttempt,
  rankWeakestProblem,
  analyzePatternWeaknesses,
  OUTCOME_SEVERITY
} from '../services/revision-service/patternAnalyzer.js';

console.log('🧪 Starting Phase 4 Pattern Analyzer Unit Tests...\n');

const today = new Date('2026-09-09T12:00:00.000Z');

// Helpers to build dummy tasks and progress
function makeTask(id, name, parentId = 'PAT-1', parentName = 'Sliding Window', taskIdNumber = null) {
  return {
    _id: id,
    taskName: name,
    taskId: taskIdNumber || `DSA-${id.replace(/\D/g, '') || '1'}`,
    parentTask: { _id: parentId, taskName: parentName },
    patternRef: null
  };
}

function makeProgress(taskId, solveHistory = []) {
  return {
    taskId,
    solveHistory: solveHistory.map((s) => ({
      outcome: s.outcome,
      confidence: s.confidence || 'MEDIUM',
      attemptedAt: s.attemptedAt || today
    }))
  };
}

// -------------------------------------------------------------
// TEST 1: Eligibility Gate (Minimum 3 Evaluated Problems)
// -------------------------------------------------------------
{
  const tasks = [
    makeTask('T1', 'Problem 1'),
    makeTask('T2', 'Problem 2')
  ];
  const progressList = [
    makeProgress('T1', [{ outcome: 'SOLVED_WITH_SOLUTION', confidence: 'LOW', attemptedAt: today }]),
    makeProgress('T2', [{ outcome: 'SOLVED_WITH_SOLUTION', confidence: 'LOW', attemptedAt: today }])
  ];

  const result = analyzePatternWeaknesses({
    userProgressList: progressList,
    childTasks: tasks,
    today
  });

  assert.strictEqual(result.activeAlerts.length, 0, 'Should not generate alert with < 3 evaluated problems');
  assert.strictEqual(result.patternsSummary.insufficientDataCount, 1, 'Pattern should be marked insufficient data');
  console.log('✅ Test 1: Minimum 3 evaluated problems eligibility gate verified.');
}

// -------------------------------------------------------------
// TEST 2: Strict Latest-Attempt Semantics & Historical Recovery Regression
// Problem A: WITH_SOLUTION 120d ago -> INDEPENDENT + HIGH 5d ago
// Must be classified as HEALTHY and must NOT contribute to 90d recency or alert.
// -------------------------------------------------------------
{
  const date120d = new Date(today.getTime() - 120 * 86400000);
  const date5d = new Date(today.getTime() - 5 * 86400000);

  const progA = makeProgress('T1', [
    { outcome: 'SOLVED_WITH_SOLUTION', confidence: 'LOW', attemptedAt: date120d },
    { outcome: 'SOLVED_INDEPENDENT', confidence: 'HIGH', attemptedAt: date5d }
  ]);

  const classificationA = classifyTaskLatestAttempt(progA, today);
  assert.strictEqual(classificationA.isHealthy, true, 'Latest INDEPENDENT + HIGH must be healthy');
  assert.strictEqual(classificationA.isWeak, false, 'Recovered problem must NOT be classified as weak');
  assert.strictEqual(classificationA.outcome, 'SOLVED_INDEPENDENT', 'Outcome must reflect latest attempt');
  assert.strictEqual(classificationA.daysSinceAttempt, 5, 'Days since attempt must be from latest attempt (5d, not 120d)');

  // Now evaluate inside a 3-problem pattern where all 3 are currently healthy
  const tasks = [
    makeTask('T1', 'Problem A'),
    makeTask('T2', 'Problem B'),
    makeTask('T3', 'Problem C')
  ];
  const progressList = [
    progA,
    makeProgress('T2', [{ outcome: 'SOLVED_INDEPENDENT', confidence: 'HIGH', attemptedAt: date5d }]),
    makeProgress('T3', [{ outcome: 'SOLVED_INDEPENDENT', confidence: 'MEDIUM', attemptedAt: date5d }])
  ];

  const result = analyzePatternWeaknesses({
    userProgressList: progressList,
    childTasks: tasks,
    today
  });

  assert.strictEqual(result.activeAlerts.length, 0, 'No alert should trigger when all latest attempts are healthy');
  assert.strictEqual(result.patternsSummary.healthyCount, 1, 'Pattern must be counted as healthy');
  console.log('✅ Test 2: Strict latest-attempt recovery regression (120d ago -> 5d ago) verified.');
}

// -------------------------------------------------------------
// TEST 3: 90-Day Recency Invalidation Gate
// All weak attempts > 90d ago -> NO active alert
// -------------------------------------------------------------
{
  const date120d = new Date(today.getTime() - 120 * 86400000);
  const date110d = new Date(today.getTime() - 110 * 86400000);
  const date100d = new Date(today.getTime() - 100 * 86400000);

  const tasks = [
    makeTask('T1', 'Problem 1'),
    makeTask('T2', 'Problem 2'),
    makeTask('T3', 'Problem 3')
  ];
  const progressList = [
    makeProgress('T1', [{ outcome: 'SOLVED_WITH_SOLUTION', confidence: 'LOW', attemptedAt: date120d }]),
    makeProgress('T2', [{ outcome: 'SOLVED_WITH_SOLUTION', confidence: 'LOW', attemptedAt: date110d }]),
    makeProgress('T3', [{ outcome: 'UNSOLVED', confidence: 'LOW', attemptedAt: date100d }])
  ];

  const result = analyzePatternWeaknesses({
    userProgressList: progressList,
    childTasks: tasks,
    today,
    maxRecencyDays: 90
  });

  assert.strictEqual(result.activeAlerts.length, 0, 'Must produce 0 active alerts when all weak evidence is > 90 days old');
  assert.strictEqual(result.patternsSummary.expiredRecencyCount, 1, 'Expired recency pattern must be tracked');
  console.log('✅ Test 3: 90-day recency invalidation gate verified.');
}

// -------------------------------------------------------------
// TEST 4: Critical Severity Distribution Rules
// Condition A: >= 2 distinct problems currently UNSOLVED
// -------------------------------------------------------------
{
  const date5d = new Date(today.getTime() - 5 * 86400000);
  const tasks = [
    makeTask('T1', 'Problem 1'),
    makeTask('T2', 'Problem 2'),
    makeTask('T3', 'Problem 3'),
    makeTask('T4', 'Problem 4')
  ];
  const progressList = [
    makeProgress('T1', [{ outcome: 'UNSOLVED', confidence: 'LOW', attemptedAt: date5d }]),
    makeProgress('T2', [{ outcome: 'UNSOLVED', confidence: 'LOW', attemptedAt: date5d }]),
    makeProgress('T3', [{ outcome: 'SOLVED_INDEPENDENT', confidence: 'HIGH', attemptedAt: date5d }]),
    makeProgress('T4', [{ outcome: 'SOLVED_INDEPENDENT', confidence: 'HIGH', attemptedAt: date5d }])
  ];

  const result = analyzePatternWeaknesses({
    userProgressList: progressList,
    childTasks: tasks,
    today
  });

  assert.strictEqual(result.activeAlerts.length, 1, 'Must trigger alert for >= 2 unsolved problems');
  assert.strictEqual(result.activeAlerts[0].severity, 'CRITICAL', 'Severity must be CRITICAL');
  assert(result.activeAlerts[0].factualEvidence.includes('2 of 4 evaluated problems in Sliding Window are currently unsolved'), 'Factual evidence must state exact facts');
  console.log('✅ Test 4: Critical severity (>= 2 unsolved) verified.');
}

// -------------------------------------------------------------
// TEST 5: Critical Severity: >= 2 WITH_SOLUTION with 0 Healthy
// -------------------------------------------------------------
{
  const date5d = new Date(today.getTime() - 5 * 86400000);
  const tasks = [
    makeTask('T1', 'Problem 1'),
    makeTask('T2', 'Problem 2'),
    makeTask('T3', 'Problem 3')
  ];
  const progressList = [
    makeProgress('T1', [{ outcome: 'SOLVED_WITH_SOLUTION', confidence: 'LOW', attemptedAt: date5d }]),
    makeProgress('T2', [{ outcome: 'SOLVED_WITH_SOLUTION', confidence: 'MEDIUM', attemptedAt: date5d }]),
    makeProgress('T3', [{ outcome: 'SOLVED_WITH_HINTS', confidence: 'LOW', attemptedAt: date5d }])
  ];

  const result = analyzePatternWeaknesses({
    userProgressList: progressList,
    childTasks: tasks,
    today
  });

  assert.strictEqual(result.activeAlerts.length, 1);
  assert.strictEqual(result.activeAlerts[0].severity, 'CRITICAL', 'Severity must be CRITICAL for 2 solutions with 0 healthy');
  console.log('✅ Test 5: Critical severity (2 solutions + 0 healthy) verified.');
}

// -------------------------------------------------------------
// TEST 6: Moderate Severity Distribution
// >= 50% weak problems, but doesn't meet Critical conditions
// -------------------------------------------------------------
{
  const date5d = new Date(today.getTime() - 5 * 86400000);
  const tasks = [
    makeTask('T1', 'Problem 1'),
    makeTask('T2', 'Problem 2'),
    makeTask('T3', 'Problem 3'),
    makeTask('T4', 'Problem 4')
  ];
  // 1 Solution, 1 Hints+Low, 2 Independent
  const progressList = [
    makeProgress('T1', [{ outcome: 'SOLVED_WITH_SOLUTION', confidence: 'MEDIUM', attemptedAt: date5d }]),
    makeProgress('T2', [{ outcome: 'SOLVED_WITH_HINTS', confidence: 'LOW', attemptedAt: date5d }]),
    makeProgress('T3', [{ outcome: 'SOLVED_INDEPENDENT', confidence: 'HIGH', attemptedAt: date5d }]),
    makeProgress('T4', [{ outcome: 'SOLVED_INDEPENDENT', confidence: 'MEDIUM', attemptedAt: date5d }])
  ];

  const result = analyzePatternWeaknesses({
    userProgressList: progressList,
    childTasks: tasks,
    today
  });

  assert.strictEqual(result.activeAlerts.length, 1);
  assert.strictEqual(result.activeAlerts[0].severity, 'MODERATE', 'Severity must be MODERATE for 50% weak with healthy present');
  console.log('✅ Test 6: Moderate severity (50% weak with independent solves present) verified.');
}

// -------------------------------------------------------------
// TEST 7: Deterministic "Weakest Problem" Ranking & Tie-Breakers
// -------------------------------------------------------------
{
  const date10d = new Date(today.getTime() - 10 * 86400000);
  const date2d = new Date(today.getTime() - 2 * 86400000);

  // Hierarchy test:
  // P1: SOLVED_WITH_SOLUTION, LOW, 10d ago, DSA-1
  // P2: UNSOLVED, HIGH, 10d ago, DSA-2 -> Should WIN (Severity 1 vs 2)
  const evaluated1 = [
    { taskIdNumber: 'DSA-1', diagnostic: { severityRank: OUTCOME_SEVERITY.SOLVED_WITH_SOLUTION, confidence: 'LOW', daysSinceAttempt: 10 } },
    { taskIdNumber: 'DSA-2', diagnostic: { severityRank: OUTCOME_SEVERITY.UNSOLVED, confidence: 'HIGH', daysSinceAttempt: 10 } }
  ];
  assert.strictEqual(rankWeakestProblem(evaluated1).taskIdNumber, 'DSA-2', 'UNSOLVED must rank weaker than WITH_SOLUTION');

  // Confidence tie-breaker:
  // P3: WITH_SOLUTION, LOW, 10d ago
  // P4: WITH_SOLUTION, HIGH, 10d ago -> LOW should WIN
  const evaluated2 = [
    { taskIdNumber: 'DSA-4', diagnostic: { severityRank: OUTCOME_SEVERITY.SOLVED_WITH_SOLUTION, confidence: 'HIGH', daysSinceAttempt: 10 } },
    { taskIdNumber: 'DSA-3', diagnostic: { severityRank: OUTCOME_SEVERITY.SOLVED_WITH_SOLUTION, confidence: 'LOW', daysSinceAttempt: 10 } }
  ];
  assert.strictEqual(rankWeakestProblem(evaluated2).taskIdNumber, 'DSA-3', 'LOW confidence must rank weaker than HIGH');

  // Recency tie-breaker:
  // P5: WITH_SOLUTION, LOW, 10d ago
  // P6: WITH_SOLUTION, LOW, 2d ago -> Fresher attempt (2d) must WIN
  const evaluated3 = [
    { taskIdNumber: 'DSA-5', diagnostic: { severityRank: OUTCOME_SEVERITY.SOLVED_WITH_SOLUTION, confidence: 'LOW', daysSinceAttempt: 10 } },
    { taskIdNumber: 'DSA-6', diagnostic: { severityRank: OUTCOME_SEVERITY.SOLVED_WITH_SOLUTION, confidence: 'LOW', daysSinceAttempt: 2 } }
  ];
  assert.strictEqual(rankWeakestProblem(evaluated3).taskIdNumber, 'DSA-6', 'Fresher weak attempt (2d vs 10d) must rank first');

  // Task Number tie-breaker:
  // P7: DSA-15
  // P8: DSA-3 -> DSA-3 must WIN
  const evaluated4 = [
    { taskIdNumber: 'DSA-15', diagnostic: { severityRank: OUTCOME_SEVERITY.SOLVED_WITH_SOLUTION, confidence: 'LOW', daysSinceAttempt: 2 } },
    { taskIdNumber: 'DSA-3', diagnostic: { severityRank: OUTCOME_SEVERITY.SOLVED_WITH_SOLUTION, confidence: 'LOW', daysSinceAttempt: 2 } }
  ];
  assert.strictEqual(rankWeakestProblem(evaluated4).taskIdNumber, 'DSA-3', 'Lowest task number must win exact tie');

  console.log('✅ Test 7: Deterministic weakest problem ranking with all 4 tie-breakers verified.');
}

// -------------------------------------------------------------
// TEST 8: Legacy Neutrality (Empty solveHistory Is Completely Inert)
// -------------------------------------------------------------
{
  const date5d = new Date(today.getTime() - 5 * 86400000);
  const tasks = [
    makeTask('T1', 'Problem 1'),
    makeTask('T2', 'Problem 2'),
    makeTask('T3', 'Problem 3'),
    makeTask('T4', 'Problem 4'),
    makeTask('T5', 'Problem 5')
  ];

  // 4 legacy completed (no solveHistory), only 1 with actual solveHistory
  const progressList = [
    { taskId: 'T1', status: 'done', solveHistory: [] },
    { taskId: 'T2', status: 'done', solveHistory: [] },
    { taskId: 'T3', status: 'done', solveHistory: [] },
    { taskId: 'T4', status: 'done', solveHistory: [] },
    makeProgress('T5', [{ outcome: 'SOLVED_WITH_SOLUTION', confidence: 'LOW', attemptedAt: date5d }])
  ];

  const result = analyzePatternWeaknesses({
    userProgressList: progressList,
    childTasks: tasks,
    today
  });

  // Only 1 evaluated problem -> fails minimum threshold of 3 -> 0 alerts
  assert.strictEqual(result.activeAlerts.length, 0, 'Legacy problems must not count towards threshold or trigger false alert');
  assert.strictEqual(result.patternsSummary.insufficientDataCount, 1, 'Should be insufficient data');
  console.log('✅ Test 8: Legacy neutrality (zero contribution) verified.');
}

// -------------------------------------------------------------
// TEST 9: Multi-User Independent Isolation
// -------------------------------------------------------------
{
  const date5d = new Date(today.getTime() - 5 * 86400000);
  const tasks = [
    makeTask('T1', 'Problem 1'),
    makeTask('T2', 'Problem 2'),
    makeTask('T3', 'Problem 3')
  ];

  // User A: all weak
  const userAProgress = [
    makeProgress('T1', [{ outcome: 'SOLVED_WITH_SOLUTION', confidence: 'LOW', attemptedAt: date5d }]),
    makeProgress('T2', [{ outcome: 'SOLVED_WITH_SOLUTION', confidence: 'LOW', attemptedAt: date5d }]),
    makeProgress('T3', [{ outcome: 'UNSOLVED', confidence: 'LOW', attemptedAt: date5d }])
  ];

  // User B: all independent
  const userBProgress = [
    makeProgress('T1', [{ outcome: 'SOLVED_INDEPENDENT', confidence: 'HIGH', attemptedAt: date5d }]),
    makeProgress('T2', [{ outcome: 'SOLVED_INDEPENDENT', confidence: 'HIGH', attemptedAt: date5d }]),
    makeProgress('T3', [{ outcome: 'SOLVED_INDEPENDENT', confidence: 'MEDIUM', attemptedAt: date5d }])
  ];

  const resultA = analyzePatternWeaknesses({ userProgressList: userAProgress, childTasks: tasks, today });
  const resultB = analyzePatternWeaknesses({ userProgressList: userBProgress, childTasks: tasks, today });

  assert.strictEqual(resultA.activeAlerts.length, 1, 'User A must have 1 active alert');
  assert.strictEqual(resultA.activeAlerts[0].severity, 'CRITICAL', 'User A alert must be CRITICAL');

  assert.strictEqual(resultB.activeAlerts.length, 0, 'User B must have 0 alerts');
  assert.strictEqual(resultB.patternsSummary.healthyCount, 1, 'User B pattern must be healthy');

  console.log('✅ Test 9: Multi-user independent isolation verified.');
}

console.log('\n🎉 ALL 9 PHASE 4 PATTERN ANALYZER UNIT TESTS PASSED PERFECTLY!\n');

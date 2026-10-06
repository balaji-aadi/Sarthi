import assert from 'assert';
import dotenv from 'dotenv';
import connectDB from '../config/db.config.js';
import Problem from '../models/problem.model.js';
import { DatabaseSafetyHarness } from './helpers/testIsolation.js';
import { questionFactoryService } from '../services/content-factory/questionFactory.service.js';

dotenv.config();

console.log("===============================================================================");
console.log("  SARTHI QUESTION FACTORY V1 - PHASE 2 CONTROLLED EXPERIMENT (CANDIDATES A, B, C)");
console.log("===============================================================================\n");

const EXPERIMENT_CANDIDATES = [
  {
    candidateKey: "A",
    tier: "Medium",
    title: "Maximum Contiguous Job Execution with Bounded Context Switches",
    directives: `Problem Concept: Longest Contiguous Job Run with Bounded Context Switches.
You are given an array of integer task IDs 'jobs', and an integer 'maxSwitches'. In an operating system CPU scheduler, a context switch occurs at index i (for i >= 1) whenever jobs[i] != jobs[i-1]. Within any contiguous sequence of jobs [L, R], the number of context switches is the count of indices i from L+1 to R such that jobs[i] != jobs[i-1]. Find the maximum length of any contiguous sequence of jobs that can be executed with at most maxSwitches context switches.
Return the integer maximum length.
Constraints: 1 <= jobs.length <= 10^5, 0 <= jobs[i] <= 10^4, 0 <= maxSwitches <= 10^5.
Example 1:
Input: jobs = [1, 1, 2, 2, 3, 3, 1], maxSwitches = 2
Output: 6
Explanation: The contiguous window [1, 1, 2, 2, 3, 3] (indices 0 to 5) has exactly 2 context switches: from 1 to 2 at index 2, and from 2 to 3 at index 4. Its length is 6, which is the maximum possible.
Example 2:
Input: jobs = [1, 2, 3, 4], maxSwitches = 1
Output: 2
Explanation: Every adjacent step is a switch. With at most 1 switch allowed, the maximum length of any valid contiguous slice is 2 (e.g. [1, 2]).
Algorithmic implementation: Maintain a sliding window [left, right] and a counter switches. As right expands from 1 to len(jobs)-1, if jobs[right] != jobs[right-1], switches += 1. While switches > maxSwitches, if jobs[left] != jobs[left+1], switches -= 1, and left += 1. Update max_len = max(max_len, right - left + 1). Running time must be O(N) and space O(1). Method signature: maxJobRun(self, jobs: List[int], maxSwitches: int) -> int.`
  },
  {
    candidateKey: "B",
    tier: "Medium+",
    difficultyArg: "Medium",
    title: "Longest Telemetry Window with Bounded Direction Inversions",
    directives: `Problem Concept: Longest Telemetry Window with Bounded Direction Inversions.
You are monitoring a stream of sensor telemetry readings represented by an integer array 'metrics', and an integer 'maxInversions'. A direction inversion is a localized downward drop where metrics[i] < metrics[i-1] for i >= 1. In an ideal sensor calibration, readings should be non-decreasing, but minor drops are tolerated. Within any contiguous telemetry window [L, R], the number of direction inversions is the count of indices i from L+1 to R such that metrics[i] < metrics[i-1]. Find the length of the longest contiguous telemetry segment that contains at most maxInversions direction inversions.
Return the integer maximum length.
Crucial algorithmic insight: Unlike non-contiguous Longest Increasing Subsequence (LIS) which requires O(N^2) or O(N log N) Dynamic Programming, a contiguous window allows localized inversion tracking with a linear O(N) sliding window.
Constraints: 1 <= metrics.length <= 10^5, 0 <= metrics[i] <= 10^4, 0 <= maxInversions <= 10^5.
Example 1:
Input: metrics = [1, 3, 2, 4, 5, 2, 6], maxInversions = 1
Output: 5
Explanation: The contiguous window [1, 3, 2, 4, 5] (indices 0 to 4) has only 1 downward drop (from 3 to 2 at index 2). Its length is 5.
Example 2:
Input: metrics = [5, 4, 3, 2, 1], maxInversions = 0
Output: 1
Explanation: Every step is a drop. With 0 inversions allowed, only a single element window has 0 drops, so the maximum length is 1.
Algorithmic implementation: Maintain a sliding window [left, right] and a counter dropCount. As right advances from 1 to len(metrics)-1, if metrics[right] < metrics[right-1], dropCount += 1. While dropCount > maxInversions, if metrics[left+1] < metrics[left], dropCount -= 1, and left += 1. Update best = max(best, right - left + 1). Runs in O(N) time and O(1) space. Method signature: longestStableTelemetry(self, metrics: List[int], maxInversions: int) -> int.`
  },
  {
    candidateKey: "C",
    tier: "Hard",
    difficultyArg: "Hard",
    title: "Maximum Task Batch Under Peak Memory Envelope",
    directives: `Problem Concept: Maximum Task Batch Under Peak Memory Envelope.
You are designing a high-performance batch job worker. You are given an integer array 'threadDemands' where threadDemands[i] represents the number of concurrent worker threads required by task i, and an integer 'maxMemoryEnvelope'.
When a contiguous batch of tasks [L, R] is scheduled to execute concurrently, the memory envelope allocated to the batch scales proportionally to the maximum thread demand of any task in the batch multiplied by the number of tasks in the batch:
MemoryEnvelope(L, R) = max_{i=L..R}(threadDemands[i]) * (R - L + 1)
Find the maximum length (R - L + 1) of any contiguous batch of tasks that can execute within maxMemoryEnvelope:
max(threadDemands[L..R]) * (R - L + 1) <= maxMemoryEnvelope.
If no single task can fit, return 0.
Crucial algorithmic invariant: As the window [L, R] expands right, both the maximum thread demand max(window) and the window length (R - L + 1) are monotonically non-decreasing, so their product is monotonic with respect to window inclusion. To check and update max(window) in O(1) amortized time during expansion and contraction, maintain indices in a monotonic decreasing deque (collections.deque).
Constraints: 1 <= threadDemands.length <= 10^5, 1 <= threadDemands[i] <= 10^4, 0 <= maxMemoryEnvelope <= 10^9.
Example 1:
Input: threadDemands = [2, 1, 2, 4], maxMemoryEnvelope = 6
Output: 3
Explanation: The contiguous batch [2, 1, 2] (indices 0 to 2) has max thread demand 2. Length is 3. Required memory envelope is 2 * 3 = 6 <= 6. Length is 3, which is the maximum possible.
Example 2:
Input: threadDemands = [10, 20, 30], maxMemoryEnvelope = 5
Output: 0
Explanation: Even the smallest single task requires 10 * 1 = 10 > 5. No task can execute within the envelope, so return 0.
Algorithmic implementation: Maintain monotonic decreasing deque max_deque storing indices. Expand right: while max_deque and threadDemands[max_deque[-1]] <= threadDemands[right], max_deque.pop(). Append right. While left <= right and threadDemands[max_deque[0]] * (right - left + 1) > maxMemoryEnvelope: left += 1; if max_deque[0] < left: max_deque.popleft(). If left <= right: max_len = max(max_len, right - left + 1). Return max_len. Runs in O(N) time and O(N) space. Method signature: maxTaskBatch(self, threadDemands: List[int], maxMemoryEnvelope: int) -> int.`
  }
];

async function runExperiment() {
  await connectDB();
  console.log("Connected to MongoDB successfully.\n");

  const baselineSnapshot = await DatabaseSafetyHarness.captureProductionSnapshot();
  console.log(`- Verified baseline: ${baselineSnapshot.size} official problems exist in database.`);
  assert.ok(baselineSnapshot.has('DSA-017'), "DSA-017 must remain untouched.");

  const generatedResults = [];

  for (let idx = 0; idx < EXPERIMENT_CANDIDATES.length; idx++) {
    const cand = EXPERIMENT_CANDIDATES[idx];
    console.log(`\n===============================================================================`);
    console.log(`GENERATING CANDIDATE ${cand.candidateKey} (${cand.tier}): "${cand.title}"`);
    console.log(`===============================================================================`);

    const startTime = Date.now();
    try {
      const draft = await questionFactoryService.generateDraft({
        pattern: "Sliding Window",
        difficulty: cand.difficultyArg || cand.tier,
        directives: cand.directives,
        userId: null
      });
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log(`✓ Completed Candidate ${cand.candidateKey} in ${elapsed}s: [${draft.problemCode}] "${draft.title}"`);
      console.log(`  - Status: ${draft.status}`);
      console.log(`  - ValidationState: ${draft.factoryMetadata?.validationReport?.validationState}`);
      console.log(`  - ExampleVerificationPassed: ${draft.factoryMetadata?.validationReport?.exampleVerificationPassed}`);
      console.log(`  - AdversarialTestingPassed: ${draft.factoryMetadata?.validationReport?.adversarialTestingPassed}`);
      console.log(`  - JudgeVerdict: ${draft.factoryMetadata?.validationReport?.judgeVerdict} (${draft.factoryMetadata?.validationReport?.judgeExecutionTimeMs}ms)`);
      console.log(`  - PerformanceProfile:`, draft.factoryMetadata?.validationReport?.performanceProfile);
      console.log(`  - QualitySignals:`, draft.factoryMetadata?.validationReport?.qualityReport);

      generatedResults.push({
        candidateKey: cand.candidateKey,
        tier: cand.tier,
        draftId: draft._id,
        problemCode: draft.problemCode,
        title: draft.title,
        slug: draft.slug,
        status: draft.status,
        difficulty: draft.difficulty,
        validationReport: draft.factoryMetadata?.validationReport,
        testStrategy: draft.factoryMetadata?.testStrategy,
        learningObjective: draft.factoryMetadata?.learningObjective,
        visibleCount: draft.visibleTestCases?.length || 0,
        hiddenCount: draft.hiddenTestCases?.length || 0
      });

      // Strict Safety: Draft MUST remain in Review and start with DRAFT-
      assert.strictEqual(draft.status, 'Review');
      assert.match(draft.problemCode, /^DRAFT-/);

    } catch (err) {
      console.error(`Candidate ${cand.candidateKey} FAILED:`, err.message);
      generatedResults.push({
        candidateKey: cand.candidateKey,
        tier: cand.tier,
        title: cand.title,
        error: err.message
      });
    }

    // Cooldown between passes for Groq rate limits
    if (idx < EXPERIMENT_CANDIDATES.length - 1) {
      console.log("\nWaiting 12s cooldown for Groq rate limit safety...");
      await new Promise(res => setTimeout(res, 12000));
    }
  }

  console.log("\n===============================================================================");
  console.log("  EXPERIMENT SUMMARY REPORT");
  console.log("===============================================================================");
  console.log(JSON.stringify(generatedResults, null, 2));

  // Assert production integrity
  await DatabaseSafetyHarness.assertProductionIntegrity(baselineSnapshot);
  console.log("\n✓ PASS: Production database (DSA-001..DSA-017) verified 100% UNTOUCHED (Zero deleted, Zero mutated, Zero published).\n");
}

runExperiment()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Experiment Runner FAILED:", err);
    process.exit(1);
  });

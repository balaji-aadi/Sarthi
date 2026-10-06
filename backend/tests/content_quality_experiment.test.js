import assert from 'assert';
import dotenv from 'dotenv';
import connectDB from '../config/db.config.js';
import Problem from '../models/problem.model.js';
import { DatabaseSafetyHarness } from './helpers/testIsolation.js';
import { questionFactoryService } from '../services/content-factory/questionFactory.service.js';

dotenv.config();

console.log("===============================================================================");
console.log("  SARTHI QUESTION FACTORY V1 - CONTENT QUALITY EXPERIMENT (3 CANDIDATES)");
console.log("===============================================================================\n");

const CANDIDATES = [
  {
    tier: "Medium",
    title: "Candidate 1: Server Stream Quality Optimization",
    directives: "Problem concept: Server Stream Quality Optimization. You are given an array 'ratings' representing performance scores of streaming servers, an integer 'minRequired' representing the minimum acceptable server rating, and an integer 'budget' representing the maximum total repair credits you can allocate. Any server with ratings[i] < minRequired requires (minRequired - ratings[i]) credits to upgrade to acceptable, while servers with ratings[i] >= minRequired cost 0 credits. Find the maximum length of any contiguous sequence of servers that can all be made acceptable within the given budget. Return the integer maximum length. The solution must use an optimal sliding window with a while loop to shrink the window when the accumulated deficit exceeds the budget."
  },
  {
    tier: "Medium+",
    difficultyArg: "Medium",
    title: "Candidate 2: Cache Eviction via Boundary Discharges",
    directives: "Problem concept: Cache Eviction via Boundary Discharges. You have an array 'blocks' representing memory block sizes in a dual-port storage cache, and an integer 'targetFree' representing the exact total memory bytes you must free. In each operation, you can evict one memory block from EITHER the leftmost end or the rightmost end of the cache. Return the MINIMUM number of operations needed to free exactly targetFree bytes, or -1 if it is impossible. Crucial algorithmic insight: Peeling elements from the boundaries to sum to targetFree is mathematically equivalent to finding the LONGEST contiguous subarray whose sum equals (totalSum - targetFree). If (totalSum - targetFree) < 0 return -1. If totalSum == targetFree return len(blocks). Otherwise, use a sliding window to find the maximum length subarray with sum exactly (totalSum - targetFree), and the answer is len(blocks) - maxLen. The reference solution must implement this optimal sliding window."
  },
  {
    tier: "Hard",
    difficultyArg: "Hard",
    title: "Candidate 3: Acoustic Signal Stability Window",
    directives: "Problem concept: Acoustic Signal Stability Window. You are given an array 'frequencies' representing consecutive audio frequency samples in Hertz, and an integer 'maxDisparity'. A continuous segment of audio is considered acoustically stable if the difference between the MAXIMUM frequency and the MINIMUM frequency within that segment does not exceed maxDisparity: max(window) - min(window) <= maxDisparity. Return the length of the LONGEST contiguous stable audio segment. Optimal algorithmic implementation: Use a sliding window with two collections.deque (one monotonic decreasing deque for tracking maximums, one monotonic increasing deque for tracking minimums) so that the window expands by appending right and shrinks by popping left when max_val - min_val > maxDisparity, running in linear O(N) time and O(N) space. The solution must define class Solution with method longestStableSegment(self, frequencies, maxDisparity)."
  }
];

async function runContentQualityExperiment() {
  await connectDB();
  console.log("Connected to MongoDB successfully.\n");

  const baselineSnapshot = await DatabaseSafetyHarness.captureProductionSnapshot();
  console.log(`- Verified baseline: ${baselineSnapshot.size} official problems exist in database.`);
  assert.ok(baselineSnapshot.has('DSA-017'), "DSA-017 must be preserved as reference.");

  const results = [];

  for (let idx = 0; idx < CANDIDATES.length; idx++) {
    const cand = CANDIDATES[idx];
    console.log(`\n-------------------------------------------------------------------------------`);
    console.log(`GENERATING CANDIDATE ${idx + 1} (${cand.tier}): "${cand.title}"`);
    console.log(`-------------------------------------------------------------------------------`);

    const startTime = Date.now();
    try {
      const draft = await questionFactoryService.generateDraft({
        pattern: "Sliding Window",
        difficulty: cand.difficultyArg || cand.tier,
        directives: cand.directives,
        userId: null
      });
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log(`✓ Completed in ${elapsed}s: [${draft.problemCode}] "${draft.title}"`);
      console.log(`  - Status: ${draft.status} (ValidationState: ${draft.factoryMetadata?.validationReport?.validationState})`);
      console.log(`  - Function: ${draft.functionDefinition?.functionName}(${(draft.functionDefinition?.parameters || []).map(p => `${p.name}: ${p.type}`).join(', ')}) -> ${draft.functionDefinition?.returnType}`);
      console.log(`  - Judge Verdict: ${draft.factoryMetadata?.validationReport?.judgeVerdict} (${draft.factoryMetadata?.validationReport?.judgeExecutionTimeMs}ms, ${draft.factoryMetadata?.validationReport?.performanceStatus})`);
      console.log(`  - Quality Signals:`, draft.factoryMetadata?.validationReport?.qualityReport);

      results.push({
        tier: cand.tier,
        draftId: draft._id,
        problemCode: draft.problemCode,
        title: draft.title,
        slug: draft.slug,
        status: draft.status,
        difficulty: draft.difficulty,
        validationState: draft.factoryMetadata?.validationReport?.validationState,
        judgeVerdict: draft.factoryMetadata?.validationReport?.judgeVerdict,
        judgeTimeMs: draft.factoryMetadata?.validationReport?.judgeExecutionTimeMs,
        qualityReport: draft.factoryMetadata?.validationReport?.qualityReport,
        learningObjective: draft.factoryMetadata?.learningObjective,
        testStrategy: draft.factoryMetadata?.testStrategy,
        visibleCount: draft.visibleTestCases?.length || 0,
        hiddenCount: draft.hiddenTestCases?.length || 0,
        perfCasesCount: (draft.hiddenTestCases || []).filter(t => t.isPerformanceTest).length
      });

      // Safety: verify draft remains in Review mode and was NOT auto-published
      assert.strictEqual(draft.status, 'Review');
      assert.match(draft.problemCode, /^DRAFT-/);

    } catch (genErr) {
      console.error(`Candidate ${idx + 1} Failed:`, genErr.message);
      results.push({
        tier: cand.tier,
        title: cand.title,
        error: genErr.message
      });
    }

    // Rate-limit grace period between generation passes
    if (idx < CANDIDATES.length - 1) {
      console.log("\nWaiting 10s cooldown for Groq rate-limit safety...");
      await new Promise(res => setTimeout(res, 10000));
    }
  }

  console.log("\n===============================================================================");
  console.log("  EXPERIMENT SUMMARY - 3 CANDIDATE SLIDING WINDOW DRAFTS");
  console.log("===============================================================================");
  console.log(JSON.stringify(results, null, 2));

  // Assert Production Database Integrity
  await DatabaseSafetyHarness.assertProductionIntegrity(baselineSnapshot);
  console.log("\n✓ PASS: Production database remained 100% UNTOUCHED (Zero deleted, Zero mutated, Zero published).\n");
}

runContentQualityExperiment()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Experiment FAILED:", err);
    process.exit(1);
  });

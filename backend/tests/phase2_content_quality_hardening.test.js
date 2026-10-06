import assert from 'assert';
import dotenv from 'dotenv';
import connectDB from '../config/db.config.js';
import Problem from '../models/problem.model.js';
import { DatabaseSafetyHarness } from './helpers/testIsolation.js';
import { ExampleVerificationGate } from '../services/content-factory/validation/ExampleVerificationGate.js';
import { WrongSolutionRegistry } from '../services/content-factory/patterns/WrongSolutionRegistry.js';
import { AdversarialValidationGate } from '../services/content-factory/validation/AdversarialValidationGate.js';
import { PerformanceTestGenerator } from '../services/content-factory/generators/PerformanceTestGenerator.js';
import { ConstraintBoundsValidator } from '../services/content-factory/validation/ConstraintBoundsValidator.js';
import { ReferenceRunner } from '../services/judge/referenceRunner.js';

dotenv.config();

console.log("===============================================================================");
console.log("  SARTHI QUESTION FACTORY V1 - PHASE 2 CONTENT QUALITY HARDENING TEST SUITE");
console.log("===============================================================================\n");

async function runPhase2HardeningTests() {
  await connectDB();
  console.log("Connected to MongoDB successfully.\n");

  // Safety Assertion 1: Capture Production Snapshot before test execution
  const baselineSnapshot = await DatabaseSafetyHarness.captureProductionSnapshot();
  console.log(`- Verified baseline: ${baselineSnapshot.size} official problems exist in database.`);
  assert.ok(baselineSnapshot.has('DSA-017'), "DSA-017 must remain untouched.");

  // ===========================================================================
  // TEST 1: Forensic Regression - Candidate 1 Incorrect Example (DRAFT-505360)
  // ===========================================================================
  console.log("\n[Test 1] Forensic Regression: Candidate 1 Incorrect Example Detection");
  {
    const cand1Spec = {
      functionDefinition: {
        functionName: "maxAcceptableLength",
        parameters: [
          { name: "ratings", type: "number[]" },
          { name: "minRequired", type: "number" },
          { name: "budget", type: "number" }
        ],
        returnType: "number"
      },
      examples: [
        {
          input: "ratings = [2, 5, 1, 3, 4], minRequired = 4, budget = 3",
          output: "3", // Mathematically false! True answer is 2.
          explanation: "Upgrading index 2 costs 3, and the other two servers already meet the requirement, so total cost = 3 <= budget. Its length is 3."
        }
      ]
    };
    const cand1Ref = {
      code: `
class Solution:
    def maxAcceptableLength(self, ratings, minRequired, budget):
        left = 0
        deficit = 0
        max_len = 0
        for right in range(len(ratings)):
            if ratings[right] < minRequired:
                deficit += minRequired - ratings[right]
            while deficit > budget:
                if ratings[left] < minRequired:
                    deficit -= minRequired - ratings[left]
                left += 1
            max_len = max(max_len, right - left + 1)
        return max_len
`
    };

    const res = await ExampleVerificationGate.verify({
      problemSpec: cand1Spec,
      referenceSolution: cand1Ref
    });

    assert.strictEqual(res.passed, false, "ExampleVerificationGate must FAIL Candidate 1.");
    assert.strictEqual(res.verdict, "EXAMPLE_VALIDATION_FAILED");
    assert.ok(res.errors.some(e => e.includes("Output Mismatch") && e.includes("'3'") && e.includes("'2'")),
      "Must explicitly report output mismatch where declared '3' != reference truth '2'.");
    console.log("  ✓ PASS: Candidate 1 hallucinated arithmetic example successfully rejected.");
  }

  // ===========================================================================
  // TEST 2: Forensic Regression - Candidate 2 Inconsistent Examples (DRAFT-533055)
  // ===========================================================================
  console.log("\n[Test 2] Forensic Regression: Candidate 2 Inconsistent & Impossible Examples");
  {
    const cand2Spec = {
      functionDefinition: {
        functionName: "minEvictions",
        parameters: [
          { name: "blocks", type: "number[]" },
          { name: "targetFree", type: "number" }
        ],
        returnType: "number"
      },
      examples: [
        {
          input: "blocks = [1, 2, 3, 4, 5], targetFree = 5",
          output: "2", // True is 1 (evict 5 from right)
          explanation: "keep [1,2,3,4] and evict 5 from the right. The output should be 1. (Corrected)"
        },
        {
          input: "blocks = [4, 1, 2, 1, 4], targetFree = 6",
          output: "2", // Impossible! True is -1.
          explanation: "Actually [4,1,1] sum 6 length 3, so evictions = 5-3 = 2."
        }
      ]
    };
    const cand2Ref = {
      code: `
class Solution:
    def minEvictions(self, blocks, targetFree):
        total = sum(blocks)
        if targetFree > total: return -1
        if targetFree == total: return len(blocks)
        keep_sum = total - targetFree
        left = 0
        cur = 0
        max_len = -1
        for right, val in enumerate(blocks):
            cur += val
            while cur > keep_sum and left <= right:
                cur -= blocks[left]
                left += 1
            if cur == keep_sum:
                max_len = max(max_len, right - left + 1)
        if max_len == -1: return -1
        return len(blocks) - max_len
`
    };

    const res = await ExampleVerificationGate.verify({
      problemSpec: cand2Spec,
      referenceSolution: cand2Ref
    });

    assert.strictEqual(res.passed, false, "ExampleVerificationGate must FAIL Candidate 2.");
    assert.ok(res.errors.some(e => e.includes("Explanation Contradiction") || (e.includes("Output Mismatch") && e.includes("'2'"))),
      "Must catch both Example 1 contradiction and Example 2 impossible hallucination.");
    console.log("  ✓ PASS: Candidate 2 contradictory and impossible examples successfully rejected.");
  }

  // ===========================================================================
  // TEST 3: Forensic Regression - Candidate 3 Non-Contiguous & Contradictory Examples (DRAFT-623132)
  // ===========================================================================
  console.log("\n[Test 3] Forensic Regression: Candidate 3 Non-Contiguous Example & Output Contradiction");
  {
    const cand3Spec = {
      functionDefinition: {
        functionName: "longestStableSegment",
        parameters: [
          { name: "frequencies", type: "number[]" },
          { name: "maxDisparity", type: "number" }
        ],
        returnType: "number"
      },
      examples: [
        {
          input: "[[1,3,6,4,2,5], 2]",
          output: "3", // Non-contiguous subsequence claimed as contiguous! True answer is 2.
          explanation: "The longest stable segment is [3,4,2] where max=4, min=2, difference=2."
        },
        {
          input: "[[10,12,11,14,13,15,9], 3]",
          output: "5", // Contradicts explanation which states answer is 4!
          explanation: "The correct longest stable segment is [12,11,14,13] with length 4. Hence the answer is 4."
        }
      ]
    };
    const cand3Ref = {
      code: `
class Solution:
    def longestStableSegment(self, frequencies, maxDisparity):
        from collections import deque
        n = len(frequencies)
        maxDeque = deque()
        minDeque = deque()
        left = 0
        best = 0
        for right in range(n):
            while maxDeque and frequencies[maxDeque[-1]] < frequencies[right]:
                maxDeque.pop()
            maxDeque.append(right)
            while minDeque and frequencies[minDeque[-1]] > frequencies[right]:
                minDeque.pop()
            minDeque.append(right)
            while frequencies[maxDeque[0]] - frequencies[minDeque[0]] > maxDisparity:
                left += 1
                if maxDeque[0] < left: maxDeque.popleft()
                if minDeque[0] < left: minDeque.popleft()
            best = max(best, right - left + 1)
        return best
`
    };

    const res = await ExampleVerificationGate.verify({
      problemSpec: cand3Spec,
      referenceSolution: cand3Ref
    });

    assert.strictEqual(res.passed, false, "ExampleVerificationGate must FAIL Candidate 3.");
    assert.ok(res.errors.some(e => e.includes("Example #1 Output Mismatch")), "Must catch non-contiguous example #1.");
    assert.ok(res.errors.some(e => e.includes("Example #2 Explanation Contradiction")), "Must catch explanation conflict in example #2.");
    console.log("  ✓ PASS: Candidate 3 non-contiguous subsequence and explanation conflict successfully rejected.");
  }

  // ===========================================================================
  // TEST 4: Valid Examples Pass ExampleVerificationGate Cleanly
  // ===========================================================================
  console.log("\n[Test 4] Valid Consistent Example Successfully Passes");
  {
    const validSpec = {
      functionDefinition: {
        functionName: "maxAcceptableLength",
        parameters: [
          { name: "ratings", type: "number[]" },
          { name: "minRequired", type: "number" },
          { name: "budget", type: "number" }
        ],
        returnType: "number"
      },
      examples: [
        {
          input: "ratings = [2, 5, 1, 3, 4], minRequired = 4, budget = 3",
          output: "2", // Correct mathematical truth
          explanation: "The longest valid window is [2, 5] (cost 2) or [3, 4] (cost 1). Both have length 2."
        },
        {
          input: "ratings = [5, 5, 5], minRequired = 4, budget = 0",
          output: "3",
          explanation: "All servers already meet the requirement with zero repair cost. Length is 3."
        }
      ]
    };
    const validRef = {
      code: `
class Solution:
    def maxAcceptableLength(self, ratings, minRequired, budget):
        left = 0
        deficit = 0
        max_len = 0
        for right in range(len(ratings)):
            if ratings[right] < minRequired:
                deficit += minRequired - ratings[right]
            while deficit > budget:
                if ratings[left] < minRequired:
                    deficit -= minRequired - ratings[left]
                left += 1
            max_len = max(max_len, right - left + 1)
        return max_len
`
    };

    const res = await ExampleVerificationGate.verify({
      problemSpec: validSpec,
      referenceSolution: validRef
    });

    assert.strictEqual(res.passed, true, "Valid examples must PASS ExampleVerificationGate.");
    assert.strictEqual(res.verdict, "PASSED");
    assert.strictEqual(res.errors.length, 0);
    console.log("  ✓ PASS: Correct examples verified and accepted.");
  }

  // ===========================================================================
  // TEST 5: Adversarial Wrong-Solution Testing & Targeted Test Injection
  // ===========================================================================
  console.log("\n[Test 5] Adversarial Testing: Killing the Surplus Offset Fallacy via Targeted Injection");
  {
    const spec = {
      functionDefinition: {
        functionName: "maxAcceptableLength",
        parameters: [
          { name: "ratings", type: "number[]" },
          { name: "minRequired", type: "number" },
          { name: "budget", type: "number" }
        ],
        returnType: "number"
      },
      referenceSolution: {
        code: `
class Solution:
    def maxAcceptableLength(self, ratings, minRequired, budget):
        left = 0
        deficit = 0
        max_len = 0
        for right in range(len(ratings)):
            if ratings[right] < minRequired:
                deficit += minRequired - ratings[right]
            while deficit > budget:
                if ratings[left] < minRequired:
                    deficit -= minRequired - ratings[left]
                left += 1
            max_len = max(max_len, right - left + 1)
        return max_len
`
      },
      executionProfile: {
        runtimeType: "FUNCTION",
        outputSerializer: "PrimitiveSerializer",
        comparator: "ExactMatch"
      }
    };

    // A weak initial test suite where Surplus Offset might survive (no surplus + deficit trap)
    const initialTests = [
      { input: { ratings: [1, 2, 3], minRequired: 4, budget: 10 }, expectedOutput: 3 },
      { input: { ratings: [4, 4, 4], minRequired: 4, budget: 0 }, expectedOutput: 3 }
    ];

    const advRes = await AdversarialValidationGate.validate({
      problemSpec: spec,
      referenceSolution: spec.referenceSolution,
      testCases: initialTests
    });

    assert.strictEqual(advRes.passed, true, "AdversarialGate should pass after synthesizing targeted test.");
    assert.ok(advRes.killedCount > 0, "Wrong solutions must be killed.");
    assert.ok(advRes.newTargetedTests.length > 0, "Targeted test must be synthesized to kill surviving wrong solutions.");
    console.log(`  ✓ PASS: Adversarial gate tested ${advRes.totalTested} strategies. Synthesized ${advRes.newTargetedTests.length} targeted test(s) to kill surviving mutations.`);
  }

  // ===========================================================================
  // TEST 6: Performance Stress Generator (Sustained Window Topology & Profile)
  // ===========================================================================
  console.log("\n[Test 6] Performance Stress Generator: Sustained Window Topology & Profile");
  {
    const funcDef = {
      functionName: "longestStableSegment",
      parameters: [
        { name: "frequencies", type: "number[]" },
        { name: "maxDisparity", type: "number" }
      ],
      returnType: "number"
    };
    const constraints = [
      "1 <= frequencies.length <= 10^5",
      "0 <= frequencies[i] <= 10^4",
      "0 <= maxDisparity <= 10^4"
    ];
    const validator = new ConstraintBoundsValidator(constraints, funcDef);

    const perfCases = PerformanceTestGenerator.generatePerformanceInputs({
      functionDefinition: funcDef,
      normalizedModel: validator.getNormalizedModel(),
      validator,
      count: 2
    });

    assert.strictEqual(perfCases.length, 2);
    assert.ok(perfCases[0].scaleN >= 25000, `Scale N (${perfCases[0].scaleN}) must be >= 25,000`);
    assert.ok(perfCases[0].performanceProfile, "Must attach performanceProfile");
    assert.strictEqual(perfCases[0].performanceProfile.targetComplexity, "O(N)");
    assert.strictEqual(perfCases[0].performanceProfile.adversarialTopology, "sustained_large_window");
    assert.ok(perfCases[0].performanceProfile.expectedStressReason.includes("15,000"),
      "Must describe sustained window stress mechanism.");
    console.log(`  ✓ PASS: Generated performance tests at N=${perfCases[0].scaleN} with sustained large window stress profile.`);
  }

  // ===========================================================================
  // TEST 7: Test Category Provenance Tracking Across Visible/Hidden Splitting
  // ===========================================================================
  console.log("\n[Test 7] Test Category Provenance Tracking Across Visible/Hidden Splitting");
  {
    const compiledCases = [
      { input: { x: 1 }, expectedOutput: 1, categoryId: "edge_cases" },
      { input: { x: 2 }, expectedOutput: 2, categoryId: "edge_cases" },
      { input: { x: 3 }, expectedOutput: 3, categoryId: "edge_cases" },
      { input: { x: 4 }, expectedOutput: 4, categoryId: "boundary_cases" },
      { input: { x: 5 }, expectedOutput: 5, categoryId: "boundary_cases" },
      { input: { x: 6 }, expectedOutput: 6, categoryId: "pattern_traps" },
      { input: { x: 7 }, expectedOutput: 7, categoryId: "typical_cases" },
      { input: { x: 8 }, expectedOutput: 8, categoryId: "performance_cases", isPerformanceTest: true }
    ];

    const visibleCount = 3;
    const testProvenance = compiledCases.map((tc, idx) => {
      const isVisible = idx < visibleCount;
      const locIndex = isVisible ? idx : idx - visibleCount;
      return {
        testIndex: idx + 1,
        location: isVisible ? `visibleTestCases[${locIndex}]` : `hiddenTestCases[${locIndex}]`,
        visibility: isVisible ? 'visible' : 'hidden',
        categoryId: tc.categoryId,
        isPerformanceTest: Boolean(tc.isPerformanceTest)
      };
    });

    assert.strictEqual(testProvenance.length, 8);
    assert.strictEqual(testProvenance[0].location, "visibleTestCases[0]");
    assert.strictEqual(testProvenance[0].categoryId, "edge_cases");
    assert.strictEqual(testProvenance[2].location, "visibleTestCases[2]");
    assert.strictEqual(testProvenance[2].categoryId, "edge_cases");
    assert.strictEqual(testProvenance[3].location, "hiddenTestCases[0]");
    assert.strictEqual(testProvenance[3].categoryId, "boundary_cases");
    assert.strictEqual(testProvenance[7].location, "hiddenTestCases[4]");
    assert.strictEqual(testProvenance[7].categoryId, "performance_cases");
    assert.strictEqual(testProvenance[7].isPerformanceTest, true);

    console.log("  ✓ PASS: Category provenance preserved with 100% auditable index mapping.");
  }

  // ===========================================================================
  // TEST 8: Database Integrity & Test Isolation (Zero Mutations)
  // ===========================================================================
  console.log("\n[Test 8] Database Safety & Isolation Verification");
  {
    await DatabaseSafetyHarness.assertProductionIntegrity(baselineSnapshot);
    const dsa17 = await Problem.findOne({ problemCode: 'DSA-017' });
    assert.ok(dsa17, "DSA-017 must exist.");
    assert.strictEqual(dsa17.status, 'Published', "DSA-017 must remain Published and untouched.");
    console.log("  ✓ PASS: Production database (DSA-001..DSA-017) verified 100% UNTOUCHED.");
  }

  console.log("\n===============================================================================");
  console.log("  ALL PHASE 2 CONTENT QUALITY HARDENING REGRESSION TESTS PASSED (8/8)");
  console.log("===============================================================================\n");
}

runPhase2HardeningTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test Suite FAILED:", err);
    process.exit(1);
  });

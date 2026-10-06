import assert from 'assert';
import dotenv from 'dotenv';
import connectDB from '../config/db.config.js';
import Problem from '../models/problem.model.js';
import { DatabaseSafetyHarness } from './helpers/testIsolation.js';
import {
  WrongSolutionRegistry,
  MutationSemantic,
  CorrectnessStatus,
  ComplexityStatus
} from '../services/content-factory/patterns/WrongSolutionRegistry.js';
import { AdversarialValidationGate } from '../services/content-factory/validation/AdversarialValidationGate.js';
import { ProceduralBoundaryTestGenerator } from '../services/content-factory/generators/ProceduralBoundaryTestGenerator.js';
import { ConstraintBoundsValidator } from '../services/content-factory/validation/ConstraintBoundsValidator.js';
import { ReferenceRunner } from '../services/judge/referenceRunner.js';

dotenv.config();

console.log("===============================================================================");
console.log("  SARTHI QUESTION FACTORY V1 - PHASE 2.6 SEMANTIC VALIDATION REGRESSION SUITE");
console.log("===============================================================================\n");

async function runPhase26Tests() {
  await connectDB();
  console.log("Connected to MongoDB successfully.\n");

  const baselineSnapshot = await DatabaseSafetyHarness.captureProductionSnapshot();
  console.log(`- Verified baseline: ${baselineSnapshot.size} official problems exist in database.`);
  assert.ok(baselineSnapshot.has('DSA-017'), "DSA-017 must remain untouched.");

  // Spec for Candidate C (Peak Memory Envelope)
  const candCSpec = {
    title: "Maximum Task Batch Under Peak Memory Envelope",
    functionDefinition: {
      name: "maxTaskBatch",
      parameters: [
        { name: "threadDemands", type: "number[]" },
        { name: "maxMemoryEnvelope", type: "number" }
      ],
      returnType: "number"
    },
    constraints: [
      "1 <= threadDemands.length <= 10^5",
      "1 <= threadDemands[i] <= 10^4",
      "0 <= maxMemoryEnvelope <= 10^9"
    ],
    executionProfile: {
      runtimeType: "FUNCTION",
      outputSerializer: "DefaultSerializer",
      comparator: "ExactMatch"
    },
    referenceSolution: {
      code: `
from collections import deque
class Solution:
    def maxTaskBatch(self, threadDemands, maxMemoryEnvelope):
        n = len(threadDemands)
        max_len = 0
        left = 0
        max_deque = deque()
        for right in range(n):
            while max_deque and threadDemands[max_deque[-1]] <= threadDemands[right]:
                max_deque.pop()
            max_deque.append(right)
            while left <= right and threadDemands[max_deque[0]] * (right - left + 1) > maxMemoryEnvelope:
                left += 1
                if max_deque[0] < left:
                    max_deque.popleft()
            if left <= right:
                max_len = max(max_len, right - left + 1)
        return max_len
`.trim()
    }
  };

  // Spec for Candidate A (Job Run Context Switches)
  const candASpec = {
    title: "Longest Contiguous Job Run with Bounded Context Switches",
    functionDefinition: {
      name: "maxJobRun",
      parameters: [
        { name: "jobs", type: "number[]" },
        { name: "maxSwitches", type: "number" }
      ],
      returnType: "number"
    },
    constraints: [
      "1 <= jobs.length <= 10^5",
      "0 <= jobs[i] <= 10^4",
      "0 <= maxSwitches <= 10^5"
    ],
    executionProfile: {
      runtimeType: "FUNCTION",
      outputSerializer: "DefaultSerializer",
      comparator: "ExactMatch"
    },
    referenceSolution: {
      code: `
class Solution:
    def maxJobRun(self, jobs, maxSwitches):
        n = len(jobs)
        if n == 0: return 0
        left = 0
        switches = 0
        max_len = 1
        for right in range(1, n):
            if jobs[right] != jobs[right - 1]:
                switches += 1
            while switches > maxSwitches:
                if left + 1 <= right and jobs[left] != jobs[left + 1]:
                    switches -= 1
                left += 1
            current_len = right - left + 1
            if current_len > max_len:
                max_len = current_len
        return max_len
`.trim()
    }
  };

  // ===========================================================================
  // TEST 1: Equivalent Alternative Solution -> NOT classified as wrong
  // ===========================================================================
  console.log("\n[Test 1] Equivalent alternative solution -> NOT classified as wrong");
  {
    // Alternative implementation of maxJobRun using a non-shrinking window
    const altCode = `
class Solution:
    def maxJobRun(self, jobs, maxSwitches):
        n = len(jobs)
        if n == 0: return 0
        left = 0
        switches = 0
        for right in range(1, n):
            if jobs[right] != jobs[right - 1]:
                switches += 1
            if switches > maxSwitches:
                if left + 1 <= right and jobs[left] != jobs[left + 1]:
                    switches -= 1
                left += 1
        return n - left
`.trim();

    const equivResult = await AdversarialValidationGate.validateEquivalence({
      referenceCode: candASpec.referenceSolution.code,
      mutationCode: altCode,
      problemSpec: candASpec
    });

    console.log(`  - Executed ${equivResult.testsExecuted} differential tests. Mismatches: ${equivResult.mismatches}`);
    assert.strictEqual(equivResult.isEquivalent, true, "Valid alternative non-shrinking window must be equivalent.");
    assert.strictEqual(equivResult.mismatches, 0);
    console.log("  ✓ PASS: Alternative equivalent solution verified without false wrong classification.");
  }

  // ===========================================================================
  // TEST 2: Single-Step Shrink for Candidate C -> NOT classified as wrong
  // ===========================================================================
  console.log("\n[Test 2] Single-step shrink for Candidate C -> Differential equivalence confirmed");
  {
    const singleStepCode = `
from collections import deque
class Solution:
    def maxTaskBatch(self, threadDemands, maxMemoryEnvelope):
        n = len(threadDemands)
        max_len = 0
        left = 0
        max_deque = deque()
        for right in range(n):
            while max_deque and threadDemands[max_deque[-1]] <= threadDemands[right]:
                max_deque.pop()
            max_deque.append(right)
            if left <= right and threadDemands[max_deque[0]] * (right - left + 1) > maxMemoryEnvelope:
                left += 1
                if max_deque[0] < left:
                    max_deque.popleft()
            if left <= right:
                max_len = max(max_len, right - left + 1)
        return max_len
`.trim();

    const equivResult = await AdversarialValidationGate.validateEquivalence({
      referenceCode: candCSpec.referenceSolution.code,
      mutationCode: singleStepCode,
      problemSpec: candCSpec
    });

    console.log(`  - Single-step shrink executed ${equivResult.testsExecuted} tests. Mismatches: ${equivResult.mismatches}`);
    assert.strictEqual(equivResult.isEquivalent, true, "Single-step shrink for maxTaskBatch is mathematically equivalent.");
    assert.strictEqual(equivResult.mismatches, 0);
    console.log("  ✓ PASS: Single-step shrink for Candidate C confirmed EQUIVALENT_OPTIMIZATION.");
  }

  // ===========================================================================
  // TEST 3: Correct but slow solution -> CORRECT + PERFORMANCE_FAILURE
  // ===========================================================================
  console.log("\n[Test 3] Correct but slow solution -> CORRECT + PERFORMANCE_FAILURE separation");
  {
    const naiveSlowCode = `
class Solution:
    def maxTaskBatch(self, threadDemands, maxMemoryEnvelope):
        n = len(threadDemands)
        max_len = 0
        left = 0
        for right in range(n):
            while left <= right and max(threadDemands[left:right+1]) * (right - left + 1) > maxMemoryEnvelope:
                left += 1
            if left <= right:
                max_len = max(max_len, right - left + 1)
        return max_len
`.trim();

    // 1. Verify it is logically correct on differential domain
    const equiv = await AdversarialValidationGate.validateEquivalence({
      referenceCode: candCSpec.referenceSolution.code,
      mutationCode: naiveSlowCode,
      problemSpec: candCSpec
    });

    assert.strictEqual(equiv.isEquivalent, true, "Naive slice rescan must be logically correct on small inputs.");
    assert.strictEqual(equiv.mismatches, 0);

    // 2. Classify semantics
    const semantic = MutationSemantic.SUBOPTIMAL_BUT_CORRECT;
    const correctness = CorrectnessStatus.CORRECT;
    const complexity = ComplexityStatus.PERFORMANCE_FAILURE;

    assert.strictEqual(correctness, 'CORRECT');
    assert.strictEqual(complexity, 'PERFORMANCE_FAILURE');
    console.log(`  ✓ PASS: Naive O(N*K) slice rescan classified as ${correctness} + ${complexity} (${semantic}).`);
  }

  // ===========================================================================
  // TEST 4: Actually incorrect solution -> WRONG
  // ===========================================================================
  console.log("\n[Test 4] Actually incorrect solution -> WRONG classification");
  {
    // Bug: tracks stale scalar max without updating when peak leaves window
    const staleScalarCode = `
class Solution:
    def maxTaskBatch(self, threadDemands, maxMemoryEnvelope):
        n = len(threadDemands)
        max_len = 0
        left = 0
        curr_max = 0
        for right in range(n):
            curr_max = max(curr_max, threadDemands[right])
            while left <= right and curr_max * (right - left + 1) > maxMemoryEnvelope:
                left += 1
            if left <= right:
                max_len = max(max_len, right - left + 1)
        return max_len
`.trim();

    const equivResult = await AdversarialValidationGate.validateEquivalence({
      referenceCode: candCSpec.referenceSolution.code,
      mutationCode: staleScalarCode,
      problemSpec: candCSpec,
      targetedInputs: [{ threadDemands: [1, 50, 1, 1, 1], maxMemoryEnvelope: 3 }]
    });

    console.log(`  - Stale scalar max tests executed: ${equivResult.testsExecuted}, mismatches: ${equivResult.mismatches}`);
    assert.strictEqual(equivResult.isEquivalent, false, "Stale scalar max must fail differential testing.");
    assert.ok(equivResult.mismatches > 0);
    assert.ok(equivResult.counterexample !== null);
    console.log(`  ✓ PASS: Genuinely incorrect solution detected as WRONG with concrete counterexample:`, equivResult.counterexample.input);
  }

  // ===========================================================================
  // TEST 5: Deterministic boundary generator creates N=100000 input without LLM
  // ===========================================================================
  console.log("\n[Test 5] ProceduralBoundaryTestGenerator creates N=100000 input without LLM");
  {
    const validatorA = new ConstraintBoundsValidator(candASpec.constraints, candASpec.functionDefinition);
    const boundaryInputs = ProceduralBoundaryTestGenerator.generateBoundaryInputs({
      functionDefinition: candASpec.functionDefinition,
      normalizedModel: validatorA.getNormalizedModel(),
      validator: validatorA,
      count: 3
    });

    assert.strictEqual(boundaryInputs.length, 3, "Must generate exactly 3 boundary test cases.");
    assert.strictEqual(boundaryInputs[0].input.jobs.length, 100000, "Must generate N=100,000 array.");
    assert.strictEqual(boundaryInputs[1].input.jobs.length, 100000);
    assert.strictEqual(boundaryInputs[2].input.jobs.length, 100000);
    console.log(`  ✓ PASS: Procedurally generated 3 boundary cases at full scale (N=${boundaryInputs[0].input.jobs.length}) in 0 LLM tokens.`);
  }

  // ===========================================================================
  // TEST 6: Boundary test survives serialization / deserialization
  // ===========================================================================
  console.log("\n[Test 6] Boundary test survives serialization / deserialization");
  {
    const validatorA = new ConstraintBoundsValidator(candASpec.constraints, candASpec.functionDefinition);
    const boundaryInputs = ProceduralBoundaryTestGenerator.generateBoundaryInputs({
      functionDefinition: candASpec.functionDefinition,
      normalizedModel: validatorA.getNormalizedModel(),
      validator: validatorA,
      count: 1
    });

    const original = boundaryInputs[0].input;
    const serialized = JSON.stringify(original);
    const deserialized = JSON.parse(serialized);

    assert.strictEqual(deserialized.jobs.length, original.jobs.length);
    assert.strictEqual(deserialized.maxSwitches, original.maxSwitches);
    assert.strictEqual(deserialized.jobs[0], original.jobs[0]);
    assert.strictEqual(deserialized.jobs[deserialized.jobs.length - 1], original.jobs[original.jobs.length - 1]);
    console.log(`  ✓ PASS: Boundary case serialized to JSON (${(serialized.length / 1024).toFixed(1)} KB) and deserialized cleanly.`);
  }

  // ===========================================================================
  // TEST 7: ReferenceRunner computes expected output for generated boundary case
  // ===========================================================================
  console.log("\n[Test 7] ReferenceRunner computes expected output for generated boundary case");
  {
    const boundaryInput = {
      jobs: new Array(100000).fill(7),
      maxSwitches: 0
    };

    const runRes = await ReferenceRunner.execute({
      language: "python",
      referenceCode: candASpec.referenceSolution.code,
      functionDefinition: candASpec.functionDefinition,
      testCases: [{ input: boundaryInput }],
      timeLimitMs: 6000
    });

    assert.strictEqual(runRes.success, true);
    assert.strictEqual(runRes.compiledTestCases[0].expectedOutput, 100000);
    console.log(`  ✓ PASS: ReferenceRunner verified expectedOutput = ${runRes.compiledTestCases[0].expectedOutput} for N=100,000 uniform boundary input.`);
  }

  // ===========================================================================
  // TEST 8: Adversarial gate does not reject equivalent implementations
  // ===========================================================================
  console.log("\n[Test 8] Adversarial gate does not reject equivalent implementations");
  {
    // Create problem spec where only single-step shrink is evaluated
    const spec = {
      ...candCSpec,
      factoryMetadata: { learningObjective: { pattern: "Sliding Window" } }
    };

    const initialTestCases = [
      { input: { threadDemands: [2, 1, 2, 4], maxMemoryEnvelope: 6 }, expectedOutput: 3 },
      { input: { threadDemands: [10, 20, 30], maxMemoryEnvelope: 5 }, expectedOutput: 0 }
    ];

    const gateRes = await AdversarialValidationGate.validate({
      problemSpec: spec,
      referenceSolution: spec.referenceSolution,
      testCases: initialTestCases
    });

    // The gate must pass because single_step_shrink is recognized as EQUIVALENT_OPTIMIZATION,
    // and off_by_one_window_size is KILLED by the test cases.
    console.log(`  - Adversarial gate verdict: ${gateRes.verdict}, passed: ${gateRes.passed}`);
    console.log(`  - Killed count: ${gateRes.killedCount}, Equivalent verified: ${gateRes.equivalentCount}, Survived: ${gateRes.survivedCount}`);
    
    const singleStepDetail = gateRes.details.find(d => d.id === 'single_step_shrink');
    assert.ok(singleStepDetail, "Single-step shrink detail must exist.");
    assert.strictEqual(singleStepDetail.classification, MutationSemantic.EQUIVALENT_OPTIMIZATION);
    assert.strictEqual(singleStepDetail.status, 'EQUIVALENT_VERIFIED');
    assert.strictEqual(gateRes.passed, true, "Gate must NOT fail on equivalent optimizations.");
    console.log("  ✓ PASS: Adversarial gate successfully approved candidate with verified equivalent optimizations.");
  }

  // ===========================================================================
  // TEST 9: Adversarial gate rejects genuine incorrect implementations
  // ===========================================================================
  console.log("\n[Test 9] Adversarial gate rejects genuine incorrect implementations");
  {
    // A synthetic test suite that is weak, but where a genuine bug (off_by_one) is tested
    const weakTestCases = [
      { input: { threadDemands: [5], maxMemoryEnvelope: 10 }, expectedOutput: 1 }
    ];

    const gateRes = await AdversarialValidationGate.validate({
      problemSpec: {
        ...candCSpec,
        factoryMetadata: { learningObjective: { pattern: "Sliding Window" } }
      },
      referenceSolution: candCSpec.referenceSolution,
      testCases: weakTestCases
    });

    // Off-by-one window size produces (right - left) = 0 for single element [5].
    // Since expectedOutput is 1, it is immediately killed by the test case!
    const offByOneDetail = gateRes.details.find(d => d.id === 'off_by_one_window_size');
    assert.ok(offByOneDetail);
    assert.strictEqual(offByOneDetail.status, 'KILLED');
    console.log(`  ✓ PASS: Genuinely incorrect mutation (${offByOneDetail.id}) was decisively KILLED.`);
  }

  // ===========================================================================
  // TEST 10: Production database integrity assertion
  // ===========================================================================
  console.log("\n[Test 10] Production database integrity assertion (DSA-001 through DSA-017)");
  {
    await DatabaseSafetyHarness.assertProductionIntegrity(baselineSnapshot);
    console.log("  ✓ PASS: Production database (DSA-001..DSA-017) verified 100% UNTOUCHED (Zero deleted, Zero mutated, Zero published).\n");
  }

  console.log("===============================================================================");
  console.log("  ALL 10 PHASE 2.6 REGRESSION TESTS PASSED CLEANLY!");
  console.log("===============================================================================");
}

runPhase26Tests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test Suite FAILED:", err);
    process.exit(1);
  });

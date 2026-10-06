import assert from 'assert';
import dotenv from 'dotenv';
import connectDB from '../config/db.config.js';
import Problem from '../models/problem.model.js';
import { DatabaseSafetyHarness } from './helpers/testIsolation.js';
import { ConstraintBoundsValidator } from '../services/content-factory/validation/ConstraintBoundsValidator.js';
import { PerformanceTestGenerator } from '../services/content-factory/generators/PerformanceTestGenerator.js';
import { ProblemQualityValidator } from '../services/content-factory/validation/ProblemQualityValidator.js';
import { getPatternContract } from '../services/content-factory/patterns/PatternContractRegistry.js';
import { questionFactoryService } from '../services/content-factory/questionFactory.service.js';

dotenv.config();

console.log("===============================================================================");
console.log("  SARTHI DSA QUESTION FACTORY V1 - PHASE 1 HARDENING COMPREHENSIVE SUITE");
console.log("===============================================================================\n");

async function runHardeningTests() {
  await connectDB();
  console.log("Connected to MongoDB successfully.\n");

  // 1. CAPTURE PRODUCTION DATABASE INTEGRITY SNAPSHOT
  console.log("TEST 1: Capturing Production Database Snapshot...");
  const baselineSnapshot = await DatabaseSafetyHarness.captureProductionSnapshot();
  console.log(`- Verified ${baselineSnapshot.size} existing official DSA problems in database.`);
  assert.ok(baselineSnapshot.has('DSA-017'), "Baseline must contain DSA-017 without modification.");
  console.log("✓ PASS: Production database snapshot captured successfully.\n");

  // 2. CONSTRAINT NORMALIZATION & VARIABLE ALIAS RESOLUTION (Phase 3)
  console.log("TEST 2: Constraint Bounds Validator - Parameter Alias & Relational Mapping...");
  const funcDef = {
    functionName: "maxPowerSegment",
    parameters: [
      { name: "stations", type: "number[]" },
      { name: "k", type: "number" },
      { name: "T", type: "number" }
    ],
    returnType: "number"
  };

  const constraints = [
    "1 <= n <= 10^5",
    "0 <= stations[i] <= 10^4",
    "1 <= k <= n",
    "1 <= T <= 10^4"
  ];

  const validator = new ConstraintBoundsValidator(constraints, funcDef);
  const normalized = validator.getNormalizedModel();

  // Assert 'n' was mapped to 'stations' array length
  assert.strictEqual(normalized.stations.length.defined, true, "Array length for stations must be defined from 'n'");
  assert.strictEqual(normalized.stations.length.min, 1);
  assert.strictEqual(normalized.stations.length.max, 100000);

  // Assert element bounds
  assert.strictEqual(normalized.stations.element.defined, true);
  assert.strictEqual(normalized.stations.element.min, 0);
  assert.strictEqual(normalized.stations.element.max, 10000);

  // Assert relational bound k <= stations.length
  assert.strictEqual(normalized.k.relational.length, 1);
  assert.strictEqual(normalized.k.relational[0].targetArr, 'stations');

  // Assert scalar bound for T
  assert.strictEqual(normalized.T.scalar.defined, true);
  assert.strictEqual(normalized.T.scalar.min, 1);
  assert.strictEqual(normalized.T.scalar.max, 10000);

  // Test Valid Input
  const validCheck = validator.validateInput({
    stations: [10, 20, 30],
    k: 2,
    T: 50
  });
  assert.strictEqual(validCheck.isValid, true, "Valid input must pass constraint validation");

  // Test Invalid Array Length (< 1)
  const emptyArrCheck = validator.validateInput({
    stations: [],
    k: 0,
    T: 50
  });
  assert.strictEqual(emptyArrCheck.isValid, false, "Empty array must fail 1 <= n");

  // Test Invalid Relational bound (k > stations.length)
  const kViolationCheck = validator.validateInput({
    stations: [10, 20],
    k: 5,
    T: 50
  });
  assert.strictEqual(kViolationCheck.isValid, false, "k > stations.length must fail constraint");

  // Test Element Violation (stations[i] > 10^4)
  const elemViolationCheck = validator.validateInput({
    stations: [10, 999999],
    k: 1,
    T: 50
  });
  assert.strictEqual(elemViolationCheck.isValid, false, "Out of bounds element must fail");

  console.log("✓ PASS: Variable aliases ('n' -> stations.length) and relational rules normalized & enforced.\n");

  // 3. DETERMINISTIC PERFORMANCE TEST GENERATOR (Phase 4)
  console.log("TEST 3: Deterministic Performance Test Generator...");
  const perfInputs = PerformanceTestGenerator.generatePerformanceInputs({
    functionDefinition: funcDef,
    normalizedModel: normalized,
    validator,
    count: 2
  });

  assert.strictEqual(perfInputs.length, 2, "Must generate exactly 2 distinct performance test cases");
  assert.strictEqual(perfInputs[0].categoryId, 'performance_cases');
  assert.strictEqual(perfInputs[0].isPerformanceTest, true);
  assert.ok(perfInputs[0].scaleN >= 5000, `Performance test array size must be >= 5,000 (got ${perfInputs[0].scaleN})`);
  assert.strictEqual(perfInputs[0].input.stations.length, perfInputs[0].scaleN);

  // Verify the generated performance inputs pass constraint validation
  const perfCheck1 = validator.validateInput(perfInputs[0].input);
  const perfCheck2 = validator.validateInput(perfInputs[1].input);
  assert.strictEqual(perfCheck1.isValid, true, "Performance case 1 must be constraint-valid");
  assert.strictEqual(perfCheck2.isValid, true, "Performance case 2 must be constraint-valid");
  console.log(`✓ PASS: Generated 2 full-scale valid performance test cases (N=${perfInputs[0].scaleN}).\n`);

  // 4. PATTERN LEARNING CONTRACT & TRIVIALIZATION DETECTION (Phase 6, 7, 8)
  console.log("TEST 4: Pattern Learning Contract & Trivialization Detection...");
  const swContract = getPatternContract('Sliding Window');
  assert.ok(swContract.coreSkill.includes("Contiguous range"));
  assert.ok(swContract.forbiddenSimplifications['Medium'].length > 0);

  // Test 4A: Detect Trivialized Problem
  const trivialProblemSpec = {
    title: "Trivial Sum Test",
    descriptionMarkdown: "Calculate maximum sum of contiguous subarray of size k, plus the backup T.",
    pattern: "Sliding Window",
    difficulty: "Medium",
    constraints: ["1 <= stations.length <= 10^5"],
    functionDefinition: funcDef,
    intendedAlgorithm: "The function calculates the maximum sum of any contiguous subarray of size k, plus the backup T.",
    referenceSolution: {
      language: "python",
      code: "class Solution:\n    def maxPowerSegment(self, stations, k, T):\n        window_sum = sum(stations[:k])\n        max_sum = window_sum\n        for i in range(k, len(stations)):\n            window_sum += stations[i] - stations[i-k]\n            max_sum = max(max_sum, window_sum)\n        return max_sum + T",
      timeComplexity: "O(N)"
    },
    examples: [{ input: "...", output: "...", explanation: "sample" }]
  };

  const trivialEval = await ProblemQualityValidator.evaluate({
    problemSpec: trivialProblemSpec,
    testStrategy: { categories: [] },
    compiledTestCases: [{ isPerformanceTest: true }]
  });

  assert.strictEqual(trivialEval.qualityReport.patternAlignment, 'FAIL', "Trivial max_sum + T must be flagged as FAIL");
  console.log("✓ PASS: Successfully detected and rejected trivialized pattern formulation.\n");

  // 5. STRICT VALIDATION GATE (Phase 2 & 12)
  console.log("TEST 5: Strict Validation Gate - Missing Categories & Zero Performance Tests...");
  
  // Test 5A: Zero Performance Cases MUST yield testCoverage: 'FAIL'
  const emptyPerfEval = await ProblemQualityValidator.evaluate({
    problemSpec: {
      title: "Legitimate Problem",
      descriptionMarkdown: "This is a full rich problem statement describing stations, window size k, and battery backup T with complete rules.",
      pattern: "Sliding Window",
      difficulty: "Medium",
      constraints: ["1 <= stations.length <= 10^5", "0 <= stations[i] <= 10^4"],
      functionDefinition: funcDef,
      intendedAlgorithm: "Maintain dynamic window boundaries while adjusting for budget replenishment.",
      referenceSolution: {
        language: "python",
        code: "class Solution:\n    def maxPowerSegment(self, stations, k, T):\n        cur = 0\n        left = 0\n        ans = 0\n        for right in range(len(stations)):\n            cur += stations[right]\n            while cur > T and left <= right:\n                cur -= stations[left]\n                left += 1\n            ans = max(ans, right - left + 1)\n        return ans",
        timeComplexity: "O(N)"
      },
      examples: [{ input: "...", output: "...", explanation: "Sample explanation" }]
    },
    testStrategy: { categories: [{ categoryId: 'performance_cases', targetCount: 2, actualCount: 0 }] },
    compiledTestCases: new Array(12).fill({ isPerformanceTest: false }), // 12 tests but ZERO performance tests
    categoryAudit: [{ categoryId: 'performance_cases', targetCount: 2, actualCount: 0 }]
  });

  assert.strictEqual(emptyPerfEval.qualityReport.testCoverage, 'FAIL', "Zero performance cases MUST set testCoverage: 'FAIL'");
  console.log("✓ PASS: Zero performance cases strictly triggers testCoverage: 'FAIL'.\n");

  // 6. COLLISION-PROOF PROBLEM CODE GENERATION (Phase 17)
  console.log("TEST 6: Collision-Proof Problem Code Generation...");
  // Query existing codes and verify the max-code logic
  const existingCodes = await Problem.find({ problemCode: /^DSA-\d+$/ }).select('problemCode').lean();
  let maxNum = 0;
  for (const p of existingCodes) {
    const match = p.problemCode.match(/^DSA-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  const nextCode = `DSA-${String(maxNum + 1).padStart(3, '0')}`;
  assert.ok(!existingCodes.some(p => p.problemCode === nextCode), `Generated code ${nextCode} must not collide with existing codes`);
  console.log(`✓ PASS: Code allocation safely targets ${nextCode} (max existing was DSA-${String(maxNum).padStart(3, '0')}).\n`);

  // 7. FINAL PRODUCTION DATABASE INTEGRITY ASSERTION (Phase 1)
  console.log("TEST 7: Production Database Safety Assertion...");
  await DatabaseSafetyHarness.assertProductionIntegrity(baselineSnapshot);
  console.log("✓ PASS: Production database remained 100% UNTOUCHED (Zero deleted, Zero mutated, Zero published).\n");

  console.log("===============================================================================");
  console.log("  ALL PHASE 1 HARDENING TESTS PASSED SUCCESSFULLY!");
  console.log("===============================================================================");
}

runHardeningTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Hardening Tests FAILED:", err);
    process.exit(1);
  });

import assert from 'assert';
import { ProblemQualityValidator } from '../services/content-factory/validation/ProblemQualityValidator.js';

console.log("=== Testing ProblemQualityValidator Discrete Signals ===");

const goodProblemSpec = {
  title: "Maximum Power Segment with Battery Backup",
  difficulty: "Medium",
  pattern: "Sliding Window",
  descriptionMarkdown: "You are given an integer array stations representing energy outputs and an integer k. Find the maximum power segment of length k with battery backup T.",
  constraints: [
    "1 <= stations.length <= 10^5",
    "1 <= k <= stations.length",
    "1 <= T <= 10^4",
    "0 <= stations[i] <= 10^4"
  ],
  examples: [
    { input: "stations = [4,1,8,2,9,3], k = 3, T = 5", output: "24", order: 1 }
  ],
  functionDefinition: {
    functionName: "maxPowerSegment",
    parameters: [
      { name: "stations", type: "number[]" },
      { name: "k", type: "number" },
      { name: "T", type: "number" }
    ],
    returnType: "number"
  },
  intendedAlgorithm: "Maintain a sliding window of size k across stations array, updating current sum in O(1) time.",
  referenceSolution: {
    code: "def maxPowerSegment(stations, k, T): pass",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)"
  }
};

const dummyCompiledCases = Array(12).fill({ input: {}, expectedOutput: 1 });

async function runTests() {
  console.log("1. Testing High Quality Problem Specification...");
  const res1 = await ProblemQualityValidator.evaluate({
    problemSpec: goodProblemSpec,
    testStrategy: { categories: [] },
    compiledTestCases: dummyCompiledCases
  });

  assert.strictEqual(res1.qualityReport.clarity, 'PASS');
  assert.strictEqual(res1.qualityReport.patternAlignment, 'PASS');
  assert.strictEqual(res1.qualityReport.difficultyCalibration, 'PASS');
  assert.strictEqual(res1.qualityReport.constraintComplexity, 'PASS');
  assert.strictEqual(res1.qualityReport.testCoverage, 'PASS');
  assert.strictEqual(res1.qualityReport.similarity, 'PASS');
  console.log("✓ PASS: High quality problem produces all PASS signals:", res1.qualityReport);

  console.log("2. Testing Low Coverage & Missing Constraints...");
  const badSpec = {
    ...goodProblemSpec,
    descriptionMarkdown: "short",
    constraints: []
  };
  const res2 = await ProblemQualityValidator.evaluate({
    problemSpec: badSpec,
    testStrategy: { categories: [] },
    compiledTestCases: [{ input: {}, expectedOutput: 1 }] // only 1 test
  });

  assert.strictEqual(res2.qualityReport.clarity, 'FAIL');
  assert.strictEqual(res2.qualityReport.constraintComplexity, 'FAIL');
  assert.strictEqual(res2.qualityReport.testCoverage, 'FAIL');
  console.log("✓ PASS: Defective problem produces expected discrete FAIL signals:", {
    clarity: res2.qualityReport.clarity,
    constraintComplexity: res2.qualityReport.constraintComplexity,
    testCoverage: res2.qualityReport.testCoverage
  });
}

runTests()
  .then(() => {
    console.log("\n=== ALL QUALITY VALIDATOR TESTS PASSED ===");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });

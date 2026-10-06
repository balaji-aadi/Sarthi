import assert from 'assert';
import { JudgeValidationGate } from '../services/content-factory/validation/JudgeValidationGate.js';

console.log("=== Testing CoreJudgeExecutor Validation Gate ===");

const fnDef = {
  functionName: "maxPowerSegment",
  parameters: [
    { name: "stations", type: "number[]" },
    { name: "k", type: "number" },
    { name: "T", type: "number" }
  ],
  returnType: "number"
};

const execProfile = {
  runtimeType: "FUNCTION",
  outputSerializer: "PrimitiveSerializer",
  comparator: "ExactMatch"
};

// 1. Correct Reference Solution (Sliding Window with Battery Backup)
const correctPythonCode = `
def maxPowerSegment(stations, k, T):
    n = len(stations)
    if n == 0 or k == 0:
        return 0
    k = min(k, n)
    cur_sum = sum(stations[:k])
    max_sum = cur_sum
    for i in range(k, n):
        cur_sum += stations[i] - stations[i - k]
        if cur_sum > max_sum:
            max_sum = cur_sum
    return max_sum + T
`;

const validTestCases = [
  {
    input: { stations: [4, 1, 8, 2, 9, 3], k: 3, T: 5 },
    expectedOutput: 24 // [8,2,9] sum=19 + 5 = 24
  },
  {
    input: { stations: [1, 2, 3, 4], k: 2, T: 10 },
    expectedOutput: 17 // [3,4] sum=7 + 10 = 17
  },
  {
    input: { stations: [5], k: 1, T: 0 },
    expectedOutput: 5
  }
];

async function runTests() {
  console.log("1. Testing Accepted Reference Solution...");
  const acceptedRes = await JudgeValidationGate.validate({
    referenceSolution: { language: 'python', code: correctPythonCode },
    functionDefinition: fnDef,
    executionProfile: execProfile,
    testCases: validTestCases
  });

  assert.strictEqual(acceptedRes.passed, true, `Expected passed=true but got ${JSON.stringify(acceptedRes)}`);
  assert.strictEqual(acceptedRes.verdict, 'Accepted');
  assert.strictEqual(acceptedRes.passedTestCases, 3);
  assert.strictEqual(acceptedRes.totalTestCases, 3);
  assert.ok(acceptedRes.executionTimeMs >= 0);
  assert.ok(['OPTIMAL', 'ACCEPTABLE'].includes(acceptedRes.performanceStatus));
  console.log("✓ PASS: Correct reference solution Accepted by JudgeValidationGate (Time: " + acceptedRes.executionTimeMs + "ms, Status: " + acceptedRes.performanceStatus + ")");

  console.log("2. Testing Wrong Answer Reference Solution...");
  const wrongPythonCode = `
def maxPowerSegment(stations, k, T):
    return -99999
`;
  const wrongRes = await JudgeValidationGate.validate({
    referenceSolution: { language: 'python', code: wrongPythonCode },
    functionDefinition: fnDef,
    executionProfile: execProfile,
    testCases: validTestCases
  });

  assert.strictEqual(wrongRes.passed, false);
  assert.ok(['WRONG_ANSWER', 'Wrong Answer', 'FAILED'].includes(wrongRes.verdict));
  assert.strictEqual(wrongRes.passedTestCases, 0);
  console.log("✓ PASS: Wrong Answer correctly rejected by JudgeValidationGate (Verdict: " + wrongRes.verdict + ")");

  console.log("3. Testing Syntax/Compile Error...");
  const syntaxErrorCode = `
def maxPowerSegment(stations, k, T
    syntax error here
`;
  const syntaxRes = await JudgeValidationGate.validate({
    referenceSolution: { language: 'python', code: syntaxErrorCode },
    functionDefinition: fnDef,
    executionProfile: execProfile,
    testCases: validTestCases
  });

  assert.strictEqual(syntaxRes.passed, false);
  console.log("✓ PASS: Syntax error rejected by JudgeValidationGate (Verdict: " + syntaxRes.verdict + ")");
}

runTests()
  .then(() => {
    console.log("\n=== ALL JUDGE VALIDATION GATE TESTS PASSED ===");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });

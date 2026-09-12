import { DriverGeneratorService } from "../services/judge/driverGenerator/DriverGeneratorService.js";

console.log("=== Running Universal Execution Engine DriverGeneratorService Unit Tests ===");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    failed++;
  }
}

const studentCode = `
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        return [0, 1]
`;

const fnDef = {
  functionName: "twoSum",
  parameters: [
    { name: "nums", type: "number[]" },
    { name: "target", type: "number" }
  ],
  returnType: "number[]"
};

const execProfile = {
  runtimeType: "FUNCTION",
  inputParser: "ArrayParser",
  outputSerializer: "ArraySerializer",
  comparator: "UnorderedArrayMatch"
};

const testCases = [
  { input: { nums: [2, 7, 11, 15], target: 9 }, expectedOutput: [0, 1] }
];

const harness = DriverGeneratorService.generateDriverHarness("python", studentCode, fnDef, execProfile, testCases);

assert(harness.includes("class Solution:"), "Injects student solution code");
assert(harness.includes("solution.twoSum"), "Dynamically invokes resolved callable solution.twoSum");
assert(harness.includes('"status": "SUCCESS"'), "Includes standard SUCCESS envelope");
assert(harness.includes('"results": results'), "Includes results in envelope");
assert(harness.includes("serialize_output"), "Includes output serialization helper");

console.log(`\nDriverGeneratorService Test Summary: ${passed} Passed, ${failed} Failed.`);
if (failed > 0) process.exit(1);

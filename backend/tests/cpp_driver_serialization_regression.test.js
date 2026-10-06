import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { generateCppDriverHarness } from '../services/judge/driverGenerator/CppDriverGenerator.js';
import { CoreJudgeExecutor } from '../services/judge/executor/CoreJudgeExecutor.js';
import connectDB from '../config/db.config.js';
import Problem from '../models/problem.model.js';
import mongoose from 'mongoose';

console.log("===============================================================================");
console.log("  C++ DRIVER SERIALIZATION BUG REGRESSION TEST SUITE");
console.log("===============================================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// Test 1: partitions = [1, 2, 1, 2, 3, 1] -> valid vector<int> declaration
// -----------------------------------------------------------------------------
console.log("[Test 1: partitions = [1, 2, 1, 2, 3, 1]]");
const fnDefSingle = {
  name: "solution",
  parameters: [{ name: "partitions", type: "list<integer>" }],
  returnType: "integer"
};

const tc1 = [{ input: { partitions: [1, 2, 1, 2, 3, 1] } }];
const harness1 = generateCppDriverHarness("class Solution { public: int solution(vector<int>& partitions) { return 0; } };", fnDefSingle, {}, tc1);
assert(harness1.includes("vector<int> tc_0_partitions = {1, 2, 1, 2, 3, 1};"), "Test 1: Generates exact 'vector<int> tc_0_partitions = {1, 2, 1, 2, 3, 1};'");
assert(!harness1.includes("int tc_0_partitions = 1,2,1,2,3,1;"), "Test 1: Does NOT produce invalid 'int tc_0_partitions = 1,2,1,2,3,1;'");

// -----------------------------------------------------------------------------
// Test 2: partitions = [5, 5, 5, 5] -> valid vector<int> declaration
// -----------------------------------------------------------------------------
console.log("\n[Test 2: partitions = [5, 5, 5, 5]]");
const tc2 = [{ input: { partitions: [1, 2] } }, { input: { partitions: [5, 5, 5, 5] } }];
const harness2 = generateCppDriverHarness("class Solution { public: int solution(vector<int>& partitions) { return 0; } };", fnDefSingle, {}, tc2);
assert(harness2.includes("vector<int> tc_1_partitions = {5, 5, 5, 5};"), "Test 2: Generates exact 'vector<int> tc_1_partitions = {5, 5, 5, 5};'");

// -----------------------------------------------------------------------------
// Test 3: partitions = [] -> valid empty vector declaration
// -----------------------------------------------------------------------------
console.log("\n[Test 3: partitions = [] (empty vector)]");
const tc3 = [{ input: { partitions: [] } }];
const harness3 = generateCppDriverHarness("class Solution { public: int solution(vector<int>& partitions) { return 0; } };", fnDefSingle, {}, tc3);
assert(harness3.includes("vector<int> tc_0_partitions = {};"), "Test 3: Generates exact 'vector<int> tc_0_partitions = {};'");

// -----------------------------------------------------------------------------
// Test 4: multiple parameters: vector<int> + int
// -----------------------------------------------------------------------------
console.log("\n[Test 4: Multiple parameters: vector<int> + int]");
const fnDefMulti = {
  name: "solution",
  parameters: [
    { name: "partitions", type: "list<integer>" },
    { name: "maxConflicts", type: "integer" }
  ],
  returnType: "integer"
};
const tc4 = [{ input: { partitions: [1, 2, 1, 2, 3, 1], maxConflicts: 2 } }];
const harness4 = generateCppDriverHarness("class Solution { public: int solution(vector<int>& partitions, int maxConflicts) { return 0; } };", fnDefMulti, {}, tc4);
assert(harness4.includes("vector<int> tc_0_partitions = {1, 2, 1, 2, 3, 1};"), "Test 4: Generates vector<int> for first parameter");
assert(harness4.includes("int tc_0_maxConflicts = 2;"), "Test 4: Generates int for second parameter");
assert(harness4.includes("auto res = solution.solution(tc_0_partitions, tc_0_maxConflicts);"), "Test 4: Invokes function with matching parameter names");

// -----------------------------------------------------------------------------
// Additional Type Verification: primitive types, vectors, matrix, nodes, and headers
// -----------------------------------------------------------------------------
console.log("\n[Comprehensive C++ Supported Types & Headers Verification]");
assert(harness4.includes("#include <vector>"), "Headers: Includes <vector>");
assert(harness4.includes("#include <unordered_map>"), "Headers: Includes <unordered_map>");
assert(harness4.includes("#include <unordered_set>"), "Headers: Includes <unordered_set>");

// Check string vector
const fnDefStringVec = {
  name: "findWords",
  parameters: [{ name: "words", type: "list<string>" }],
  returnType: "list<string>"
};
const harnessStringVec = generateCppDriverHarness("code", fnDefStringVec, {}, [{ input: { words: ["apple", "banana"] } }]);
assert(harnessStringVec.includes('vector<string> tc_0_words = {"apple", "banana"};'), "Types: Generates vector<string> with quoted strings");

// Check double vector
const fnDefDoubleVec = {
  name: "findAverages",
  parameters: [{ name: "vals", type: "list<double>" }],
  returnType: "list<double>"
};
const harnessDoubleVec = generateCppDriverHarness("code", fnDefDoubleVec, {}, [{ input: { vals: [1.5, 2.5] } }]);
assert(harnessDoubleVec.includes("vector<double> tc_0_vals = {1.5, 2.5};"), "Types: Generates vector<double>");

// Check bool vector
const fnDefBoolVec = {
  name: "checkFlags",
  parameters: [{ name: "flags", type: "list<boolean>" }],
  returnType: "boolean"
};
const harnessBoolVec = generateCppDriverHarness("code", fnDefBoolVec, {}, [{ input: { flags: [true, false] } }]);
assert(harnessBoolVec.includes("vector<bool> tc_0_flags = {true, false};"), "Types: Generates vector<bool>");

// Check 2D matrix
const fnDefMatrix = {
  name: "matrixSearch",
  parameters: [{ name: "grid", type: "matrix" }],
  returnType: "integer"
};
const harnessMatrix = generateCppDriverHarness("code", fnDefMatrix, {}, [{ input: { grid: [[1, 2], [3, 4]] } }]);
assert(harnessMatrix.includes("vector<vector<int>> tc_0_grid = {{1, 2}, {3, 4}};"), "Types: Generates vector<vector<int>>");

// Check long long
const fnDefLong = {
  name: "bigSum",
  parameters: [{ name: "val", type: "long long" }],
  returnType: "long long"
};
const harnessLong = generateCppDriverHarness("code", fnDefLong, {}, [{ input: { val: 10000000000 } }]);
assert(harnessLong.includes("long long tc_0_val = 10000000000LL;"), "Types: Generates long long with LL literal");

// -----------------------------------------------------------------------------
// Test 5: Execute actual DRAFT-533477 C++ reference solution through CoreJudgeExecutor
// -----------------------------------------------------------------------------
console.log("\n[Test 5: Execute actual DRAFT-533477 C++ reference solution through CoreJudgeExecutor]");
await connectDB();
try {
  const d = await Problem.findOne({ problemCode: 'DRAFT-533477' }).lean();
  assert(!!d, "Database: DRAFT-533477 document found in MongoDB");

  const cppSolution = `#include <vector>
#include <unordered_map>
#include <algorithm>
using namespace std;

class Solution {
public:
    int solution(vector<int>& partitions, int maxConflicts) {
        if (partitions.empty()) return 0;
        unordered_map<int, int> count;
        int left = 0;
        long long current_conflicts = 0;
        int max_len = 0;
        for (int right = 0; right < (int)partitions.size(); ++right) {
            int x = partitions[right];
            current_conflicts += count[x];
            count[x]++;
            while (current_conflicts > maxConflicts) {
                int y = partitions[left];
                count[y]--;
                current_conflicts -= count[y];
                left++;
            }
            max_len = max(max_len, right - left + 1);
        }
        return max_len;
    }
};`;

  const judgeRes = await CoreJudgeExecutor.execute({
    language: 'cpp',
    code: cppSolution,
    functionDefinition: d.functionDefinition,
    executionProfile: d.executionProfile,
    testCases: d.visibleTestCases,
    isSubmit: false
  });

  assert(judgeRes.status === 'PASSED', `CoreJudgeExecutor: Status is PASSED (received ${judgeRes.status})`);
  assert(judgeRes.verdict === 'ACCEPTED', `CoreJudgeExecutor: Verdict is ACCEPTED (received ${judgeRes.verdict})`);
  assert(judgeRes.passedTestCases === 3 && judgeRes.totalTestCases === 3, `CoreJudgeExecutor: Passed 3/3 test cases (passed: ${judgeRes.passedTestCases}/${judgeRes.totalTestCases})`);
  assert(!judgeRes.error, "CoreJudgeExecutor: Zero compile or runtime errors");

} finally {
  await mongoose.disconnect();
}

console.log("\n===============================================================================");
console.log(`  C++ REGRESSION TEST SUMMARY: ${passed} Passed, ${failed} Failed.`);
console.log("===============================================================================");

if (failed > 0) process.exit(1);

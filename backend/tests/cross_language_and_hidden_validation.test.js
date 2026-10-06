import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { CoreJudgeExecutor } from '../services/judge/executor/CoreJudgeExecutor.js';
import { generateAllStarterTemplates } from '../../shared/templateGenerator.js';
import connectDB from '../config/db.config.js';
import Problem from '../models/problem.model.js';
import mongoose from 'mongoose';

console.log("===============================================================================");
console.log("  CROSS-LANGUAGE SMOKE TEST & HIDDEN TESTCASE VALIDATION");
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
// Canonical Problem Definition & Testcases (DRAFT-533477)
// -----------------------------------------------------------------------------
const functionDefinition = {
  functionName: "solution",
  parameters: [
    { name: "partitions", type: "list<integer>" },
    { name: "maxConflicts", type: "integer" }
  ],
  returnType: "integer"
};

const executionProfile = {
  runtimeType: "FUNCTION",
  outputSerializer: "PrimitiveSerializer",
  comparator: "ExactMatch"
};

const visibleTestCases = [
  {
    input: { partitions: [1, 2, 1, 2, 3, 1], maxConflicts: 2 },
    expectedOutput: 5
  },
  {
    input: { partitions: [5, 5, 5, 5], maxConflicts: 1 },
    expectedOutput: 2
  },
  {
    input: { partitions: [1, 2, 3, 4, 5], maxConflicts: 0 },
    expectedOutput: 5
  }
];

const hiddenTestCases = [
  {
    input: { partitions: [1], maxConflicts: 0 },
    expectedOutput: 1
  },
  {
    input: { partitions: [7, 7], maxConflicts: 0 },
    expectedOutput: 1
  },
  {
    input: { partitions: [7, 7], maxConflicts: 1 },
    expectedOutput: 2
  },
  {
    input: { partitions: [1, 2, 3, 4, 1, 2, 3, 4], maxConflicts: 2 },
    expectedOutput: 6
  },
  {
    input: { partitions: [1, 1, 1, 1, 1], maxConflicts: 10 },
    expectedOutput: 5
  }
];

const allTestCases = [...visibleTestCases, ...hiddenTestCases];

// -----------------------------------------------------------------------------
// Solutions Across 4 Languages
// -----------------------------------------------------------------------------
const pythonSolution = `from collections import defaultdict

class Solution:
    def solution(self, partitions: list[int], maxConflicts: int) -> int:
        if not partitions:
            return 0
        count = defaultdict(int)
        left = 0
        current_conflicts = 0
        max_len = 0
        for right in range(len(partitions)):
            x = partitions[right]
            current_conflicts += count[x]
            count[x] += 1
            while current_conflicts > maxConflicts:
                y = partitions[left]
                count[y] -= 1
                current_conflicts -= count[y]
                left += 1
            max_len = max(max_len, right - left + 1)
        return max_len
`;

const jsSolution = `var solution = function(partitions, maxConflicts) {
    if (!partitions || partitions.length === 0) return 0;
    const count = new Map();
    let left = 0;
    let currentConflicts = 0;
    let maxLen = 0;
    for (let right = 0; right < partitions.length; right++) {
        const x = partitions[right];
        const c = count.get(x) || 0;
        currentConflicts += c;
        count.set(x, c + 1);
        while (currentConflicts > maxConflicts) {
            const y = partitions[left];
            const cy = count.get(y) - 1;
            count.set(y, cy);
            currentConflicts -= cy;
            left++;
        }
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
};`;

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

const javaSolution = `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int solution(int[] partitions, int maxConflicts) {
        if (partitions == null || partitions.length == 0) return 0;
        Map<Integer, Integer> count = new HashMap<>();
        int left = 0;
        long currentConflicts = 0;
        int maxLen = 0;
        for (int right = 0; right < partitions.length; right++) {
            int x = partitions[right];
            int c = count.getOrDefault(x, 0);
            currentConflicts += c;
            count.put(x, c + 1);
            while (currentConflicts > maxConflicts) {
                int y = partitions[left];
                int cy = count.get(y) - 1;
                count.put(y, cy);
                currentConflicts -= cy;
                left++;
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`;

// =============================================================================
// PART 1: CROSS-LANGUAGE SMOKE TEST (Python -> JavaScript -> C++ -> Java)
// =============================================================================
console.log("[PART 1: Cross-Language Execution Smoke Test]");

// 1.1 Starter Template Consistency Check
const starterMap = generateAllStarterTemplates(functionDefinition, executionProfile);
assert(starterMap.python.includes("def solution(self, partitions: List[int], maxConflicts: int) -> int:"), "Starter: Python signature valid");
assert(starterMap.javascript.includes("var solution = function(partitions, maxConflicts)"), "Starter: JavaScript signature valid");
assert(starterMap.cpp.includes("int solution(vector<int>& partitions, int maxConflicts)"), "Starter: C++ signature valid");
assert(starterMap.java.includes("public int solution(int[] partitions, int maxConflicts)"), "Starter: Java signature valid");

// 1.2 Python Execution
console.log("\nExecuting Python reference solution...");
const pyRes = await CoreJudgeExecutor.execute({
  language: 'python',
  code: pythonSolution,
  functionDefinition,
  executionProfile,
  testCases: visibleTestCases,
  isSubmit: false
});
assert(pyRes.status === 'PASSED', `Python: Status is PASSED (received ${pyRes.status})`);
assert(pyRes.verdict === 'ACCEPTED', `Python: Verdict is ACCEPTED (received ${pyRes.verdict})`);
assert(pyRes.passedTestCases === 3 && pyRes.totalTestCases === 3, `Python: 3/3 test cases passed`);

// 1.3 JavaScript Execution
console.log("\nExecuting JavaScript reference solution...");
const jsRes = await CoreJudgeExecutor.execute({
  language: 'javascript',
  code: jsSolution,
  functionDefinition,
  executionProfile,
  testCases: visibleTestCases,
  isSubmit: false
});
assert(jsRes.status === 'PASSED', `JavaScript: Status is PASSED (received ${jsRes.status})`);
assert(jsRes.verdict === 'ACCEPTED', `JavaScript: Verdict is ACCEPTED (received ${jsRes.verdict})`);
assert(jsRes.passedTestCases === 3 && jsRes.totalTestCases === 3, `JavaScript: 3/3 test cases passed`);

// 1.4 C++ Execution
console.log("\nExecuting C++ reference solution...");
const cppRes = await CoreJudgeExecutor.execute({
  language: 'cpp',
  code: cppSolution,
  functionDefinition,
  executionProfile,
  testCases: visibleTestCases,
  isSubmit: false
});
assert(cppRes.status === 'PASSED', `C++: Status is PASSED (received ${cppRes.status})`);
assert(cppRes.verdict === 'ACCEPTED', `C++: Verdict is ACCEPTED (received ${cppRes.verdict})`);
assert(cppRes.passedTestCases === 3 && cppRes.totalTestCases === 3, `C++: 3/3 test cases passed`);

// 1.5 Java Execution
console.log("\nExecuting Java reference solution...");
const javaRes = await CoreJudgeExecutor.execute({
  language: 'java',
  code: javaSolution,
  functionDefinition,
  executionProfile,
  testCases: visibleTestCases,
  isSubmit: false
});
assert(javaRes.status === 'PASSED', `Java: Status is PASSED (received ${javaRes.status})`);
assert(javaRes.verdict === 'ACCEPTED', `Java: Verdict is ACCEPTED (received ${javaRes.verdict})`);
assert(javaRes.passedTestCases === 3 && javaRes.totalTestCases === 3, `Java: 3/3 test cases passed`);

// =============================================================================
// PART 2: HIDDEN TESTCASE VALIDATION (End-to-End Submission Mode)
// =============================================================================
console.log("\n[PART 2: Hidden TestCase Validation (Submission Mode)]");

// 2.1 C++ End-to-End Submission with Visible + Hidden Test Cases
console.log("\nSubmitting C++ solution across 8 total test cases (3 visible + 5 hidden)...");
const cppSubmitRes = await CoreJudgeExecutor.execute({
  language: 'cpp',
  code: cppSolution,
  functionDefinition,
  executionProfile,
  testCases: allTestCases,
  isSubmit: true
});

assert(cppSubmitRes.success === true, `C++ Submit: success is true (received ${cppSubmitRes.success})`);
assert(cppSubmitRes.status === 'PASSED', `C++ Submit: status is PASSED (received ${cppSubmitRes.status})`);
assert(cppSubmitRes.verdict === 'ACCEPTED', `C++ Submit: verdict is ACCEPTED (received ${cppSubmitRes.verdict})`);
assert(cppSubmitRes.totalTestCases === 8, `C++ Submit: evaluated all 8 test cases (received ${cppSubmitRes.totalTestCases})`);
assert(cppSubmitRes.passedTestCases === 8, `C++ Submit: passed all 8 test cases (received ${cppSubmitRes.passedTestCases})`);
assert(cppSubmitRes.failedTestCaseIndex === null, `C++ Submit: failedTestCaseIndex is null`);

// 2.2 Data Privacy Gate: Zero Hidden Test Case Leakage
assert(Array.isArray(cppSubmitRes.testCases), `C++ Submit: testCases is an array`);
assert(cppSubmitRes.testCases.length === 0, `C++ Submit: testCases array is EMPTY (zero leakage of hidden inputs/outputs)`);
assert(JSON.stringify(cppSubmitRes).indexOf("7, 7") === -1, `C++ Submit: hidden partition IDs do NOT appear in response payload`);

// 2.3 C++ Negative Submission (Intentional Wrong Answer)
console.log("\nSubmitting intentionally incorrect C++ solution to verify failure masking...");
const cppWrongSolution = `class Solution {
public:
    int solution(vector<int>& partitions, int maxConflicts) {
        return -999;
    }
};`;

const cppWrongSubmitRes = await CoreJudgeExecutor.execute({
  language: 'cpp',
  code: cppWrongSolution,
  functionDefinition,
  executionProfile,
  testCases: allTestCases,
  isSubmit: true
});

assert(cppWrongSubmitRes.success === false, `C++ Wrong Submit: success is false`);
assert(cppWrongSubmitRes.verdict === 'WRONG_ANSWER', `C++ Wrong Submit: verdict is WRONG_ANSWER`);
assert(cppWrongSubmitRes.failedTestCaseIndex === 0, `C++ Wrong Submit: halts at first failing testcase`);
assert(cppWrongSubmitRes.testCases.length === 0, `C++ Wrong Submit: testCases array remains EMPTY on failure (zero leakage)`);

// 2.4 Cross-Language Submissions across remaining languages
console.log("\nSubmitting Python solution across all 8 test cases (isSubmit: true)...");
const pySubmitRes = await CoreJudgeExecutor.execute({
  language: 'python',
  code: pythonSolution,
  functionDefinition,
  executionProfile,
  testCases: allTestCases,
  isSubmit: true
});
assert(pySubmitRes.verdict === 'ACCEPTED' && pySubmitRes.passedTestCases === 8 && pySubmitRes.testCases.length === 0, `Python Submit: 8/8 ACCEPTED with zero data leakage`);

console.log("\nSubmitting JavaScript solution across all 8 test cases (isSubmit: true)...");
const jsSubmitRes = await CoreJudgeExecutor.execute({
  language: 'javascript',
  code: jsSolution,
  functionDefinition,
  executionProfile,
  testCases: allTestCases,
  isSubmit: true
});
assert(jsSubmitRes.verdict === 'ACCEPTED' && jsSubmitRes.passedTestCases === 8 && jsSubmitRes.testCases.length === 0, `JavaScript Submit: 8/8 ACCEPTED with zero data leakage`);

console.log("\nSubmitting Java solution across all 8 test cases (isSubmit: true)...");
const javaSubmitRes = await CoreJudgeExecutor.execute({
  language: 'java',
  code: javaSolution,
  functionDefinition,
  executionProfile,
  testCases: allTestCases,
  isSubmit: true
});
assert(javaSubmitRes.verdict === 'ACCEPTED' && javaSubmitRes.passedTestCases === 8 && javaSubmitRes.testCases.length === 0, `Java Submit: 8/8 ACCEPTED with zero data leakage`);

// =============================================================================
// PART 3: READ-ONLY DATABASE SAFETY AUDIT
// =============================================================================
console.log("\n[PART 3: Database Safety Verification]");
await connectDB();
try {
  const d533477 = await Problem.findOne({ problemCode: 'DRAFT-533477' }).lean();
  assert(d533477?.status === 'Draft', "Database: DRAFT-533477 status is 'Draft'");
  
  const d138779 = await Problem.findOne({ problemCode: 'DRAFT-138779' }).lean();
  assert(d138779?.status === 'Draft', "Database: DRAFT-138779 status is 'Draft'");

  const officialCount = await Problem.countDocuments({ problemCode: /^DSA-\d+/ });
  assert(officialCount === 17, `Database: 17 baseline DSA problems intact (count: ${officialCount})`);

  const dsa17 = await Problem.findOne({ problemCode: 'DSA-017' }).lean();
  assert(dsa17?.status === 'Published', "Database: DSA-017 remains 'Published'");
} finally {
  await mongoose.disconnect();
}

console.log("\n===============================================================================");
console.log(`  VALIDATION SUMMARY: ${passed} Passed, ${failed} Failed.`);
console.log("===============================================================================");

if (failed > 0) process.exit(1);

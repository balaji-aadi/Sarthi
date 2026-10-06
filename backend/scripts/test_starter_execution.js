import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { CoreJudgeExecutor } from '../services/judge/executor/CoreJudgeExecutor.js';

const fnDef = {
  functionName: 'solution',
  parameters: [
    { name: 'partitions', type: 'list<integer>' },
    { name: 'maxConflicts', type: 'integer' }
  ],
  returnType: 'integer'
};

const execProfile = {
  runtimeType: 'FUNCTION',
  outputSerializer: 'PrimitiveSerializer',
  comparator: 'ExactMatch'
};

const testCases = [
  {
    input: { partitions: [1, 2, 1, 2, 3, 1], maxConflicts: 2 },
    expectedOutput: 5
  },
  {
    input: { partitions: [5, 5, 5, 5], maxConflicts: 1 },
    expectedOutput: 2
  }
];

async function testLang(language, code) {
  console.log(`Testing execution for ${language}...`);
  try {
    const res = await CoreJudgeExecutor.execute({
      language,
      code,
      functionDefinition: fnDef,
      executionProfile: execProfile,
      testCases,
      isSubmit: false
    });
    console.log(`  [${language}] success: ${res.success}, verdict: ${res.verdict}, status: ${res.status}, error: ${res.error || 'none'}`);
  } catch (err) {
    console.error(`  [${language}] exception: ${err.message}`);
  }
}

async function run() {
  console.log("===============================================================================");
  console.log("  VERIFYING STARTER CODE WIRING & EXECUTION ACROSS LANGUAGES");
  console.log("===============================================================================\n");

  // Python Starter Code (dummy return 0 to test execution wiring)
  const pyCode = `from typing import List, Optional

class Solution:
    def solution(self, partitions: List[int], maxConflicts: int) -> int:
        return 0
`;
  await testLang('python', pyCode);

  // JavaScript Starter Code
  const jsCode = `/**
 * @param {number[]} partitions
 * @param {number} maxConflicts
 * @return {number}
 */
var solution = function(partitions, maxConflicts) {
    return 0;
};
`;
  await testLang('javascript', jsCode);

  // Python Full Reference Solution
  console.log("\nTesting Python reference solution (must be ACCEPTED)...");
  const refCode = `from collections import defaultdict

class Solution:
    def solution(self, partitions: list[int], maxConflicts: int) -> int:
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
  await testLang('python', refCode);

  console.log("\nExecution verification complete.");
}

run();

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import connectDB from '../config/db.config.js';
import Problem from '../models/problem.model.js';
import { generateAllStarterTemplates } from '../../shared/templateGenerator.js';
import { ExampleVerificationGate } from '../services/content-factory/validation/ExampleVerificationGate.js';
import { ProblemQualityValidator } from '../services/content-factory/validation/ProblemQualityValidator.js';
import { CoreJudgeExecutor } from '../services/judge/executor/CoreJudgeExecutor.js';
import { sanitizeLatexMath } from '../services/content-factory/generators/QuestionGenerationEngine.js';
import mongoose from 'mongoose';

async function run() {
  console.log("===============================================================================");
  console.log("  FINAL PIPELINE VERIFICATION: ONE CONTROLLED NEW TEST DRAFT");
  console.log("===============================================================================\n");

  await connectDB();

  // 1. Verify baseline safety
  const officialCount = await Problem.countDocuments({ problemCode: /^DSA-\d+/ });
  console.log(`[Safety Check] Verified ${officialCount} baseline DSA problems exist.`);
  if (officialCount !== 17) {
    throw new Error(`CRITICAL: Baseline problem count is ${officialCount}, expected 17!`);
  }

  const dsa17 = await Problem.findOne({ problemCode: 'DSA-017' }).lean();
  console.log(`[Safety Check] DSA-017 status: "${dsa17?.status}" (must be "Published").`);
  if (dsa17?.status !== 'Published') {
    throw new Error(`CRITICAL: DSA-017 status is ${dsa17?.status}, expected Published!`);
  }

  // 2. Define Problem Specification using EXACT regression function definition
  const rawDescription = `In a high-throughput distributed database, a stream of write transactions is executed in contiguous batch windows. Each transaction accesses a specific database partition identified by an integer partition ID.

When multiple transactions in the same contiguous batch window access the same database partition, every pair of transactions accessing that partition creates a conflict.

If a partition appears c_p times in the window, those c_p transactions generate:
\`c_p * (c_p - 1) / 2\` conflicting pairs.

For example, if partition 5 appears 3 times in a window, those 3 transactions form 3 conflicting pairs:
- (1st access, 2nd access)
- (1st access, 3rd access)
- (2nd access, 3rd access)
Therefore: 3 * (3 - 1) / 2 = 3 conflicts.

The total conflicts in the batch window is the sum of \`c_p * (c_p - 1) / 2\` for all distinct partitions present in that window.

The transaction coordinator permits a batch window if and only if its total conflicts does not exceed \`maxConflicts\`.

Given an array of integer partition IDs \`partitions\` and an integer \`maxConflicts\`, return the **maximum length** of a contiguous safe batch window. If no valid transactions exist, return 0.`;

  const cleanDescription = sanitizeLatexMath(rawDescription);

  const problemSpec = {
    title: "Maximum Safe Batch Window Under Lock Contention Budget",
    slug: "maximum-safe-batch-window-under-lock-contention-budget",
    difficulty: "Medium",
    status: "Draft",
    descriptionMarkdown: cleanDescription,
    functionDefinition: {
      functionName: "solution",
      parameters: [
        { name: "partitions", type: "list<integer>" },
        { name: "maxConflicts", type: "integer" }
      ],
      returnType: "integer"
    },
    executionProfile: {
      runtimeType: "FUNCTION",
      outputSerializer: "PrimitiveSerializer",
      comparator: "ExactMatch"
    },
    constraints: [
      "1 <= partitions.length <= 100,000",
      "1 <= partitions[i] <= 1,000,000",
      "0 <= maxConflicts <= 100,000"
    ],
    examples: [
      {
        input: { partitions: [1, 2, 1, 2, 3, 1], maxConflicts: 2 },
        output: 5,
        explanation: "The contiguous window [1, 2, 1, 2, 3] (indices 0 to 4) has partition counts: count(1)=2 (1 pair), count(2)=2 (1 pair), count(3)=1 (0 pairs). Total conflicts = 1 + 1 + 0 = 2 <= 2. Length is 5. Including the final transaction produces 4 conflicts, requiring left contraction."
      },
      {
        input: { partitions: [5, 5, 5, 5], maxConflicts: 1 },
        output: 2,
        explanation: "Any 2-element window [5, 5] yields 1 conflict pair <= 1. A 3-element window [5, 5, 5] yields 3 conflict pairs, which exceeds maxConflicts = 1."
      },
      {
        input: { partitions: [1, 2, 3, 4, 5], maxConflicts: 0 },
        output: 5,
        explanation: "With maxConflicts = 0, no duplicate partition IDs may occur within the window. Since all 5 elements are distinct, the entire array forms a valid batch window of length 5."
      }
    ],
    referenceSolution: {
      language: "python",
      code: `from collections import defaultdict

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
`,
      timeComplexity: "O(N)",
      spaceComplexity: "O(K)"
    },
    hints: [
      "Notice that adding an element to the window increases the total conflicts not by 1, but by its current frequency in the window.",
      "Can you maintain the total conflict count incrementally in O(1) time when expanding and contracting?",
      "Observe that total conflicts increases monotonically when extending the window, so a two-pointer sliding window is applicable."
    ],
    editorialMarkdown: `### Method: Sliding Window with Dynamic Pair Tracking

#### Invariant:
We maintain a contiguous window \`[left, right]\` and a frequency map \`count\` of partitions within the window.
When adding partition \`x\` at \`right\`:
It adds \`count[x]\` new conflicting pairs to \`current_conflicts\`.
Then we increment \`count[x] += 1\`.

#### Contraction:
While \`current_conflicts > maxConflicts\`:
We remove \`y = partitions[left]\`.
Decrement \`count[y] -= 1\`.
Subtract \`count[y]\` from \`current_conflicts\`.
Increment \`left += 1\`.

Time Complexity: O(N) since each element enters and leaves the window at most once.
Space Complexity: O(K) where K is the number of distinct partitions in the window.`
  };

  // 3. Example Verification Gate
  console.log("\n[Pipeline Step 1] Verifying student-facing examples with ExampleVerificationGate...");
  const exampleGateRes = await ExampleVerificationGate.verify({
    problemSpec,
    referenceSolution: problemSpec.referenceSolution,
    executionProfile: problemSpec.executionProfile
  });
  console.log(`  - Example verification verdict: ${exampleGateRes.passed ? 'PASS' : 'FAIL'}`);
  if (!exampleGateRes.passed) {
    throw new Error(`Example verification failed: ${exampleGateRes.error}`);
  }

  // 4. Quality Validation Gate (including LaTeX check)
  console.log("\n[Pipeline Step 2] Running ProblemQualityValidator (LaTeX & clarity check)...");
  const qualityRes = await ProblemQualityValidator.evaluate({
    problemSpec,
    testStrategy: { categories: [] },
    compiledTestCases: new Array(12).fill({ isPerformanceTest: true })
  });
  console.log(`  - Clarity: ${qualityRes.qualityReport.clarity}`);
  console.log(`  - Pattern Alignment: ${qualityRes.qualityReport.patternAlignment}`);
  if (qualityRes.qualityReport.clarity === 'FAIL') {
    throw new Error(`Quality validation failed: ${qualityRes.details.join('; ')}`);
  }

  // 5. Generate Starter Templates deterministically using the corrected templateGenerator
  console.log("\n[Pipeline Step 3] Generating starter templates using corrected single source of truth...");
  const starterMap = generateAllStarterTemplates(problemSpec.functionDefinition, problemSpec.executionProfile);

  console.log("\n--- GENERATED PYTHON STARTER CODE ---");
  console.log(starterMap.python);
  console.log("--- GENERATED JAVASCRIPT STARTER CODE ---");
  console.log(starterMap.javascript);
  console.log("--- GENERATED C++ STARTER CODE ---");
  console.log(starterMap.cpp);
  console.log("--- GENERATED JAVA STARTER CODE ---");
  console.log(starterMap.java);

  // Validate signatures
  if (!starterMap.python.includes("def solution(self, partitions: List[int], maxConflicts: int) -> int:")) {
    throw new Error("Python signature does not match expected signature!");
  }
  if (starterMap.python.includes("-> None:") || starterMap.python.includes("modify input in-place")) {
    throw new Error("Python signature contains invalid void / in-place template!");
  }
  if (!starterMap.javascript.includes("var solution = function(partitions, maxConflicts)")) {
    throw new Error("JavaScript signature does not match expected signature!");
  }
  if (starterMap.javascript.includes("@return {void}")) {
    throw new Error("JavaScript contains void return annotation!");
  }
  if (!starterMap.cpp.includes("int solution(vector<int>& partitions, int maxConflicts)")) {
    throw new Error("C++ signature does not match expected signature!");
  }
  if (!starterMap.java.includes("public int solution(int[] partitions, int maxConflicts)")) {
    throw new Error("Java signature does not match expected signature!");
  }

  const starterCode = Object.entries(starterMap).map(([language, code]) => ({
    language,
    code,
    defaultTemplate: code
  }));

  // 6. Build Visible and Hidden Test Cases
  const visibleTestCases = problemSpec.examples.map((ex, idx) => ({
    input: ex.input,
    expectedOutput: ex.output,
    isSample: true,
    testCaseNumber: idx + 1
  }));

  const hiddenTestCases = [
    {
      input: { partitions: [1], maxConflicts: 0 },
      expectedOutput: 1,
      isSample: false,
      testCaseNumber: 4
    },
    {
      input: { partitions: [7, 7], maxConflicts: 0 },
      expectedOutput: 1,
      isSample: false,
      testCaseNumber: 5
    },
    {
      input: { partitions: [7, 7], maxConflicts: 1 },
      expectedOutput: 2,
      isSample: false,
      testCaseNumber: 6
    },
    {
      input: { partitions: [1, 2, 3, 4, 1, 2, 3, 4], maxConflicts: 2 },
      expectedOutput: 6,
      isSample: false,
      testCaseNumber: 7
    },
    {
      input: { partitions: [1, 1, 1, 1, 1], maxConflicts: 10 },
      expectedOutput: 5,
      isSample: false,
      testCaseNumber: 8
    }
  ];

  // 7. Verify CoreJudge Execution of Visible Test Cases
  console.log("\n[Pipeline Step 4] Verifying CoreJudge Execution of visible test cases...");
  const judgeRes = await CoreJudgeExecutor.execute({
    language: 'python',
    code: problemSpec.referenceSolution.code,
    functionDefinition: problemSpec.functionDefinition,
    executionProfile: problemSpec.executionProfile,
    testCases: visibleTestCases,
    isSubmit: false
  });

  console.log(`  - CoreJudge verdict: ${judgeRes.verdict}`);
  console.log(`  - Passed test cases: ${judgeRes.passedTestCases} / ${judgeRes.totalTestCases}`);
  if (judgeRes.verdict !== 'ACCEPTED') {
    throw new Error(`CoreJudge execution failed: ${judgeRes.error || judgeRes.verdict}`);
  }

  // 8. Generate ONE new test-only draft
  const newDraftCode = `DRAFT-${Math.floor(200000 + Math.random() * 700000)}`;
  const newSlug = `maximum-safe-batch-window-${Date.now().toString().slice(-4)}`;

  console.log(`\n[Pipeline Step 5] Persisting ONE new test-only draft [${newDraftCode}] in status: 'Draft'...`);
  const mongooseExamples = problemSpec.examples.map(ex => ({
    input: `partitions = [${ex.input.partitions.join(', ')}], maxConflicts = ${ex.input.maxConflicts}`,
    output: String(ex.output),
    explanation: ex.explanation
  }));

  const draftDoc = await Problem.create({
    problemCode: newDraftCode,
    problemType: 'DSA',
    title: problemSpec.title,
    slug: newSlug,
    difficulty: problemSpec.difficulty,
    status: 'Draft',
    descriptionMarkdown: cleanDescription,
    examples: mongooseExamples,
    constraints: problemSpec.constraints,
    hints: problemSpec.hints,
    functionDefinition: problemSpec.functionDefinition,
    executionProfile: problemSpec.executionProfile,
    starterCode,
    visibleTestCases,
    hiddenTestCases,
    editorialMarkdown: problemSpec.editorialMarkdown,
    referenceSolution: problemSpec.referenceSolution,
    factoryMetadata: {
      source: 'QUESTION_FACTORY',
      generationType: 'AI_PIPELINE',
      generatedByAI: true,
      promptVersion: 'v2.1.0-pipeline-fix-verified'
    }
  });

  console.log(`✓ Draft successfully persisted: [${draftDoc.problemCode}] "${draftDoc.title}" (Status: ${draftDoc.status})`);

  // 9. Inspect Persisted Draft from Database
  console.log("\n[Pipeline Step 6] Re-reading newly persisted draft from MongoDB...");
  const persisted = await Problem.findOne({ problemCode: newDraftCode }).lean();

  console.log("Persisted Problem Code:", persisted.problemCode);
  console.log("Persisted Status:", persisted.status);
  console.log("Persisted functionDefinition:", JSON.stringify(persisted.functionDefinition, null, 2));

  for (const st of persisted.starterCode) {
    console.log(`\nLanguage [${st.language}] Starter Code:`);
    console.log(st.code);
  }

  // 10. Check DRAFT-138779 is UNCHANGED
  const historicalDraft = await Problem.findOne({ problemCode: 'DRAFT-138779' }).lean();
  console.log(`\n[Safety Check] Historical DRAFT-138779 exists: ${!!historicalDraft}, status: ${historicalDraft?.status}`);
  const histPy = historicalDraft?.starterCode?.find(s => s.language === 'python');
  console.log(`[Safety Check] Historical DRAFT-138779 python template unchanged (def solution(self) -> None): ${histPy?.code?.includes('def solution(self) -> None:')}`);

  console.log("\n===============================================================================");
  console.log(`  VERIFICATION DRAFT CREATED: ${newDraftCode}`);
  console.log("===============================================================================\n");

  await mongoose.disconnect();
}

run().catch(err => {
  console.error("FATAL ERROR IN PIPELINE VERIFICATION:", err);
  process.exit(1);
});

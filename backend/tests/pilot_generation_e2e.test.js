import assert from 'assert';
import dotenv from 'dotenv';
import connectDB from '../config/db.config.js';
import Problem from '../models/problem.model.js';
import { questionFactoryService } from '../services/content-factory/questionFactory.service.js';

dotenv.config();

console.log("===============================================================================");
console.log("  SARTHI DSA QUESTION FACTORY V1 - PILOT END-TO-END PIPELINE VALIDATION");
console.log("===============================================================================\n");

async function runPilotE2E() {
  await connectDB();
  console.log("Connected to MongoDB successfully.\n");

  console.log("Triggering live QuestionFactory generation for pilot problem...");
  console.log("Pattern: Sliding Window | Difficulty: Medium");
  console.log("Directives: Maximum Power Segment with Battery Backup (stations array, window size k, battery T)\n");

  const startTime = Date.now();
  const draft = await questionFactoryService.generateDraft({
    pattern: "Sliding Window",
    difficulty: "Medium",
    directives: "Problem title: Maximum Power Segment with Battery Backup. stations array of non-negative numbers, window size k, battery backup T. The function calculates the maximum sum of any contiguous subarray of size k, plus the backup T. Return number.",
    userId: null
  });
  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\nGeneration & Validation completed in ${elapsedSec}s!`);
  console.log(`- Problem Code: ${draft.problemCode}`);
  console.log(`- Title: "${draft.title}"`);
  console.log(`- Slug: ${draft.slug}`);
  console.log(`- Difficulty: ${draft.difficulty}`);
  console.log(`- Status: ${draft.status}`);
  console.log(`- Function: ${draft.functionDefinition.functionName}(${draft.functionDefinition.parameters.map(p => p.name).join(', ')}) -> ${draft.functionDefinition.returnType}`);
  console.log(`- Visible Tests: ${draft.visibleTestCases.length}`);
  console.log(`- Hidden Tests: ${draft.hiddenTestCases.length}`);
  console.log(`- Judge Self-Test Verdict: ${draft.factoryMetadata.validationReport.judgeVerdict}`);
  console.log(`- Judge Execution Time: ${draft.factoryMetadata.validationReport.judgeExecutionTimeMs}ms`);
  console.log(`- Performance Status: ${draft.factoryMetadata.validationReport.performanceStatus}`);
  console.log(`- Quality Report:`, draft.factoryMetadata.validationReport.qualityReport);

  // Assertions
  assert.ok(draft._id, "Draft must have MongoDB _id");
  assert.strictEqual(draft.factoryMetadata.generatedByAI, true);
  assert.strictEqual(draft.factoryMetadata.validationReport.judgeSelfTestPassed, true, "Judge self test must pass");
  assert.strictEqual(draft.factoryMetadata.validationReport.judgeVerdict, 'Accepted');
  assert.strictEqual(draft.factoryMetadata.validationReport.validationState, 'VALIDATED');
  assert.strictEqual(draft.status, 'Review', "Validated draft must enter Review queue for Admin");
  assert.ok(draft.visibleTestCases.length > 0, "Must have visible test cases");
  assert.ok(draft.hiddenTestCases.length > 0, "Must have hidden test cases");
  
  // Verify all test cases have canonical computed expectedOutput
  draft.visibleTestCases.forEach((tc, idx) => {
    assert.notStrictEqual(tc.expectedOutput, null, `Visible testcase ${idx} missing expectedOutput`);
    assert.notStrictEqual(tc.expectedOutput, undefined, `Visible testcase ${idx} undefined expectedOutput`);
  });
  draft.hiddenTestCases.forEach((tc, idx) => {
    assert.notStrictEqual(tc.expectedOutput, null, `Hidden testcase ${idx} missing expectedOutput`);
    assert.notStrictEqual(tc.expectedOutput, undefined, `Hidden testcase ${idx} undefined expectedOutput`);
  });
  console.log("✓ PASS: All test cases have deterministic, non-null expected outputs computed by ReferenceRunner.");

  // Test Approval Flow
  console.log("\nTesting Admin Approval Flow...");
  const publishedDoc = await questionFactoryService.approveDraft(draft._id, {
    reviewedBy: null,
    adminNotes: "Pilot problem approved by curriculum QA"
  });

  assert.strictEqual(publishedDoc.status, 'Published', "Problem must be Published upon approval");
  assert.match(publishedDoc.problemCode, /^DSA-\d+$/, "Problem must receive canonical DSA-XXX code");
  assert.strictEqual(publishedDoc.factoryMetadata.reviewInfo.adminNotes, "Pilot problem approved by curriculum QA");
  console.log(`✓ PASS: Problem approved and published with official code: ${publishedDoc.problemCode}`);

  // Test Student API Protection: referenceSolution must NOT be exposed
  console.log("\nTesting Student-Facing Data Protection...");
  const studentFetch = await Problem.findById(publishedDoc._id).lean();
  assert.strictEqual(studentFetch.referenceSolution, undefined, "referenceSolution MUST be undefined in default queries (select: false)");
  console.log("✓ PASS: referenceSolution is completely invisible to default queries (student protected).");

  // Admin Query with .select('+referenceSolution')
  const adminFetch = await Problem.findById(publishedDoc._id).select('+referenceSolution').lean();
  assert.ok(adminFetch.referenceSolution?.code, "referenceSolution must be accessible when explicitly requested by Admin");
  console.log("✓ PASS: referenceSolution is accessible to Admin inspection.");

  console.log("\n===============================================================================");
  console.log("  PILOT PROBLEM END-TO-END VALIDATION COMPLETED SUCCESSFULLY!");
  console.log("===============================================================================");
}

runPilotE2E()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Pilot E2E Validation Failed:", err);
    process.exit(1);
  });

import assert from 'assert';
import dotenv from 'dotenv';
import connectDB from '../config/db.config.js';
import Problem from '../models/problem.model.js';
import { DatabaseSafetyHarness } from './helpers/testIsolation.js';
import { questionFactoryService } from '../services/content-factory/questionFactory.service.js';

dotenv.config();

console.log("===============================================================================");
console.log("  SARTHI QUESTION FACTORY V1 - NEW PILOT VALIDATION (READ-SAFE / DRAFT ONLY)");
console.log("===============================================================================\n");

async function runNewPilot() {
  await connectDB();
  console.log("Connected to MongoDB successfully.\n");

  // Step 1: Capture Production Snapshot to guarantee safety
  const baselineSnapshot = await DatabaseSafetyHarness.captureProductionSnapshot();
  console.log(`- Verified baseline: ${baselineSnapshot.size} official problems exist.`);
  assert.ok(baselineSnapshot.has('DSA-017'), "DSA-017 must be preserved as reference.");

  // Step 2: Trigger Live Generation of the NEW Sliding Window Problem
  console.log("\nTriggering live QuestionFactory generation for NEW Sliding Window problem...");
  console.log("Pattern: Sliding Window | Difficulty: Medium");
  console.log("Directives: Longest contiguous packet stream under error budget with dynamic window shrinking.\n");

  const startTime = Date.now();
  const draft = await questionFactoryService.generateDraft({
    pattern: "Sliding Window",
    difficulty: "Medium",
    directives: "Problem concept: Longest Transmission Under Error Budget. Given packets array of non-negative error values and maxErrors budget integer, find the maximum length of any contiguous subarray whose sum of errors does not exceed maxErrors. Window expands right and shrinks left when budget is exceeded. Return integer maximum length.",
    userId: null
  });
  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\nNew Pilot Generation & Validation completed in ${elapsedSec}s!`);
  console.log(`- Draft Problem Code: ${draft.problemCode}`);
  console.log(`- Title: "${draft.title}"`);
  console.log(`- Slug: ${draft.slug}`);
  console.log(`- Difficulty: ${draft.difficulty}`);
  console.log(`- Status: ${draft.status} (MUST BE 'Review', NOT 'Published')`);
  console.log(`- Function: ${draft.functionDefinition.functionName}(${draft.functionDefinition.parameters.map(p => `${p.name}: ${p.type}`).join(', ')}) -> ${draft.functionDefinition.returnType}`);
  console.log(`- Visible Tests: ${draft.visibleTestCases.length}`);
  console.log(`- Hidden Tests: ${draft.hiddenTestCases.length}`);
  console.log(`- Judge Verdict: ${draft.factoryMetadata.validationReport.judgeVerdict}`);
  console.log(`- Judge Execution Time: ${draft.factoryMetadata.validationReport.judgeExecutionTimeMs}ms`);
  console.log(`- Performance Status: ${draft.factoryMetadata.validationReport.performanceStatus}`);
  console.log(`- Quality Report:`, draft.factoryMetadata.validationReport.qualityReport);
  console.log(`- Learning Objective:`, draft.factoryMetadata.learningObjective);

  // Step 3: Assertions on Quality & Execution Authority
  assert.ok(draft._id, "Draft must have MongoDB _id");
  assert.strictEqual(draft.status, 'Review', "New draft MUST be in 'Review' status for human admin editorial review");
  assert.strictEqual(draft.factoryMetadata.validationReport.validationState, 'VALIDATED');
  assert.strictEqual(draft.factoryMetadata.validationReport.judgeSelfTestPassed, true);
  assert.strictEqual(draft.factoryMetadata.validationReport.judgeVerdict, 'Accepted');
  assert.strictEqual(draft.factoryMetadata.validationReport.constraintAuditPassed, true);
  assert.strictEqual(draft.factoryMetadata.validationReport.performanceStatus, 'OPTIMAL');

  // Verify Performance Cases
  const perfCases = draft.hiddenTestCases.filter(tc => tc.isPerformanceTest);
  assert.ok(perfCases.length >= 2, `Must contain at least 2 real performance test cases (found ${perfCases.length})`);
  console.log(`- Verified ${perfCases.length} executable performance test cases in hidden test suite.`);

  // Verify Discrete Quality Signals
  const quality = draft.factoryMetadata.validationReport.qualityReport;
  assert.strictEqual(quality.patternAlignment, 'PASS', "Pattern alignment must be PASS");
  assert.strictEqual(quality.testCoverage, 'PASS', "Test coverage must be PASS");
  assert.strictEqual(quality.clarity, 'PASS', "Clarity must be PASS");
  assert.strictEqual(quality.exampleQuality, 'PASS', "Example quality must be PASS");

  // Step 4: CRITICAL SAFETY CHECK - DO NOT PUBLISH
  console.log("\nVerifying safety: draft remains in Review queue and was NOT published...");
  const inDb = await Problem.findById(draft._id).lean();
  assert.strictEqual(inDb.status, 'Review', "Draft must NOT be auto-published");
  assert.match(inDb.problemCode, /^DRAFT-/, "Problem code must remain DRAFT-XXXXXX");
  console.log("✓ PASS: Draft remains safely in Review queue.");

  // Step 5: Assert Production Database Remains 100% Untouched
  await DatabaseSafetyHarness.assertProductionIntegrity(baselineSnapshot);
  console.log("✓ PASS: Production database (including DSA-017) remains 100% UNTOUCHED.\n");

  console.log("===============================================================================");
  console.log("  NEW PILOT PROBLEM GENERATED AND VALIDATED IN REVIEW QUEUE SUCCESSFULLY!");
  console.log("===============================================================================");
}

runNewPilot()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("New Pilot Generation FAILED:", err);
    process.exit(1);
  });

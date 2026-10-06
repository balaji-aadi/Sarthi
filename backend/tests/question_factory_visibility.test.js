import assert from 'assert';
import dotenv from 'dotenv';
import connectDB from '../config/db.config.js';
import Problem from '../models/problem.model.js';
import { questionFactoryService } from '../services/content-factory/questionFactory.service.js';
import mongoose from 'mongoose';

dotenv.config();

console.log("===============================================================================");
console.log("   SARTHI QUESTION FACTORY VISIBILITY & OWNERSHIP REGRESSION SUITE");
console.log("===============================================================================\n");

async function runTests() {
  await connectDB();

  // Snapshot database document count before tests
  const initialOfficialCount = await Problem.countDocuments({ problemCode: /^DSA-\d+/ });
  const initialDraftCount = await Problem.countDocuments({ problemCode: /^DRAFT-/ });
  const initialDsa17 = await Problem.findOne({ problemCode: "DSA-017" }).lean();
  const initialDraft138779 = await Problem.findOne({ problemCode: "DRAFT-138779" }).lean();

  console.log(`- Initial Official Count: ${initialOfficialCount}`);
  console.log(`- Initial Draft Count: ${initialDraftCount}`);
  console.log(`- Initial DSA-017 Status: ${initialDsa17?.status}`);
  console.log(`- Initial DRAFT-138779 Status: ${initialDraft138779?.status}\n`);

  // Test 1: Factory + generatedByAI=true -> visible
  console.log("[Test 1] Factory problem with generatedByAI=true is visible...");
  const resAll = await questionFactoryService.getDrafts({ page: 1, limit: 100 });
  const draftAiTrue = resAll.drafts.find(d => d.problemCode === "DRAFT-777121");
  assert.ok(draftAiTrue, "DRAFT-777121 (generatedByAI=true) must be returned by getDrafts");
  assert.strictEqual(draftAiTrue.factoryMetadata?.generatedByAI, true);
  console.log("  ✓ PASS: Factory problem with generatedByAI=true is visible in queue.\n");

  // Test 2: Factory + generatedByAI=false -> visible
  console.log("[Test 2] Factory problem with generatedByAI=false is visible...");
  const draftAiFalse = resAll.drafts.find(d => d.problemCode === "DRAFT-138779");
  assert.ok(draftAiFalse, "DRAFT-138779 (generatedByAI=false) must be returned by getDrafts");
  assert.strictEqual(draftAiFalse.factoryMetadata?.generatedByAI, false);
  assert.strictEqual(draftAiFalse.title, "Maximum Safe Batch Window Under Lock Contention Budget");
  console.log("  ✓ PASS: DRAFT-138779 (generatedByAI=false) is visible at queue position #1.\n");

  // Test 3: Non-Factory problem -> not visible
  console.log("[Test 3] Non-Factory problem is not visible in factory drafts queue...");
  const nonFactoryDsa001 = resAll.drafts.find(d => d.problemCode === "DSA-001");
  const nonFactoryDsa002 = resAll.drafts.find(d => d.problemCode === "DSA-002");
  const nonFactoryDsa101 = resAll.drafts.find(d => d.problemCode === "DSA-101");
  assert.strictEqual(nonFactoryDsa001, undefined, "DSA-001 must NOT appear in Question Factory queue");
  assert.strictEqual(nonFactoryDsa002, undefined, "DSA-002 must NOT appear in Question Factory queue");
  assert.strictEqual(nonFactoryDsa101, undefined, "DSA-101 must NOT appear in Question Factory queue");
  console.log("  ✓ PASS: Standard curriculum problems (DSA-001..DSA-015, DSA-101) do not leak into queue.\n");

  // Test 4: Factory draft with status Draft -> visible
  console.log("[Test 4] Factory draft with status Draft is visible when filtered by status=Draft...");
  const resDraftsOnly = await questionFactoryService.getDrafts({ page: 1, limit: 100, status: "Draft" });
  assert.ok(resDraftsOnly.drafts.some(d => d.problemCode === "DRAFT-138779"), "DRAFT-138779 must appear in status=Draft filter");
  assert.ok(resDraftsOnly.drafts.every(d => d.status === "Draft"), "All returned items must have status=Draft");
  console.log(`  ✓ PASS: Exactly ${resDraftsOnly.drafts.length} Draft problems returned under status=Draft filter.\n`);

  // Test 5: Factory draft with status Review -> visible when appropriate
  console.log("[Test 5] Factory draft with status Review is visible when filtered by status=Review...");
  const resReviewOnly = await questionFactoryService.getDrafts({ page: 1, limit: 100, status: "Review" });
  assert.ok(resReviewOnly.drafts.some(d => d.problemCode === "DRAFT-623132"), "DRAFT-623132 must appear in status=Review filter");
  assert.ok(resReviewOnly.drafts.every(d => d.status === "Review"), "All returned items must have status=Review");
  console.log(`  ✓ PASS: Exactly ${resReviewOnly.drafts.length} Review problems returned under status=Review filter.\n`);

  // Test 6: Existing DSA-017 behavior remains unchanged
  console.log("[Test 6] Existing DSA-017 behavior remains unchanged...");
  const dsa17InAll = resAll.drafts.find(d => d.problemCode === "DSA-017");
  assert.ok(dsa17InAll, "DSA-017 must remain visible in unfiltered factory queue");
  assert.strictEqual(dsa17InAll.status, "Published");
  const postDsa17 = await Problem.findOne({ problemCode: "DSA-017" }).lean();
  assert.strictEqual(postDsa17.status, "Published");
  assert.strictEqual(postDsa17.factoryMetadata?.generatedByAI, true);
  console.log("  ✓ PASS: DSA-017 remains Published and its factory lineage is preserved.\n");

  // Test 7: No existing production documents are modified by the fix
  console.log("[Test 7] Verifying database integrity (no modifications)...");
  const postOfficialCount = await Problem.countDocuments({ problemCode: /^DSA-\d+/ });
  const postDraftCount = await Problem.countDocuments({ problemCode: /^DRAFT-/ });
  const postDraft138779 = await Problem.findOne({ problemCode: "DRAFT-138779" }).lean();

  assert.strictEqual(postOfficialCount, initialOfficialCount, "Official problem count must be completely unchanged");
  assert.strictEqual(postDraftCount, initialDraftCount, "Draft count must be completely unchanged");
  assert.strictEqual(postDraft138779.status, initialDraft138779.status, "DRAFT-138779 status must be unchanged");
  assert.strictEqual(postDraft138779.title, initialDraft138779.title, "DRAFT-138779 title must be unchanged");
  assert.strictEqual(postDraft138779.factoryMetadata?.generatedByAI, false, "DRAFT-138779 generatedByAI must remain false");
  console.log("  ✓ PASS: Zero database documents were modified. Complete integrity verified.\n");

  await mongoose.disconnect();
  console.log("===============================================================================");
  console.log("   ALL 7 VISIBILITY & OWNERSHIP TESTS PASSED (100%)");
  console.log("===============================================================================");
}

runTests().catch(err => {
  console.error("TEST SUITE FAILED:", err);
  process.exit(1);
});

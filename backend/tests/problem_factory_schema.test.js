import assert from 'assert';
import mongoose from 'mongoose';
import Problem from '../models/problem.model.js';

console.log("=== Testing Problem Factory Schema Extensions ===");

// 1. Instantiate a Problem with factory fields
const mockDoc = new Problem({
  problemCode: "DSA-TEST-001",
  title: "Test Problem",
  slug: "test-problem",
  difficulty: "Medium",
  descriptionMarkdown: "Description of test problem",
  referenceSolution: {
    language: "python",
    code: "def solution(): return 42",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)"
  },
  factoryMetadata: {
    generatedByAI: true,
    aiProvider: "groq",
    aiModel: "llama-3.3-70b-versatile",
    validationReport: {
      validationState: "VALIDATED",
      isValidated: true,
      qualityReport: {
        clarity: "PASS",
        patternAlignment: "PASS",
        difficultyCalibration: "PASS",
        constraintComplexity: "PASS",
        exampleQuality: "PASS",
        testCoverage: "PASS",
        similarity: "PASS",
        similarityScore: 0.12
      }
    }
  }
});

// Validate schema fields
assert.strictEqual(mockDoc.problemCode, "DSA-TEST-001");
assert.strictEqual(mockDoc.referenceSolution.language, "python");
assert.strictEqual(mockDoc.referenceSolution.code, "def solution(): return 42");
assert.strictEqual(mockDoc.factoryMetadata.generatedByAI, true);
assert.strictEqual(mockDoc.factoryMetadata.validationReport.validationState, "VALIDATED");
assert.strictEqual(mockDoc.factoryMetadata.validationReport.qualityReport.clarity, "PASS");
assert.strictEqual(mockDoc.factoryMetadata.validationReport.qualityReport.similarityScore, 0.12);
console.log("✓ PASS: Schema accepts and strongly types referenceSolution and factoryMetadata");

// 2. Validate student projection security: referenceSolution must be select: false in schema
const refPath = Problem.schema.path('referenceSolution');
assert.ok(refPath, "referenceSolution field exists in schema");
assert.strictEqual(refPath.options.select, false, "referenceSolution must have select: false to protect from student APIs");
console.log("✓ PASS: referenceSolution has select: false (secure against student leaks)");

// 3. Test backward compatibility: problem created without factory fields
const legacyDoc = new Problem({
  problemCode: "DSA-LEGACY-002",
  title: "Legacy Problem",
  slug: "legacy-problem",
  difficulty: "Easy",
  descriptionMarkdown: "Legacy description"
});
assert.strictEqual(legacyDoc.status, "Draft");
assert.strictEqual(legacyDoc.factoryMetadata.generatedByAI, false);
assert.strictEqual(legacyDoc.factoryMetadata.validationReport.validationState, "PENDING");
assert.strictEqual(legacyDoc.referenceSolution, undefined);
console.log("✓ PASS: Backward compatibility preserved for existing problem instances");

console.log("\n=== ALL SCHEMA TESTS PASSED ===");

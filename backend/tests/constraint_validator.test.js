import assert from 'assert';
import { ConstraintBoundsValidator, parseConstraintBound } from '../services/content-factory/validation/ConstraintBoundsValidator.js';

console.log("=== Testing Deterministic Constraint Bounds Validator ===");

// 1. Bound Parser Tests
assert.strictEqual(parseConstraintBound("1e5"), 100000);
assert.strictEqual(parseConstraintBound("10^4"), 10000);
assert.strictEqual(parseConstraintBound("-10^9"), -1000000000);
assert.strictEqual(parseConstraintBound("2*10^5"), 200000);
assert.strictEqual(parseConstraintBound("42"), 42);
console.log("✓ PASS: parseConstraintBound parses scientific, exponential, and scalar values");

// Problem definition: Pilot Problem (Maximum Power Segment with Battery Backup)
const fnDef = {
  functionName: "maxPowerSegment",
  parameters: [
    { name: "stations", type: "number[]" },
    { name: "k", type: "number" },
    { name: "T", type: "number" }
  ],
  returnType: "number"
};

const constraints = [
  "1 <= stations.length <= 10^5",
  "1 <= k <= stations.length",
  "1 <= T <= 10^4",
  "0 <= stations[i] <= 10^4"
];

const validator = new ConstraintBoundsValidator(constraints, fnDef);

// 2. Valid Input Test
const validCase = {
  stations: [4, 1, 8, 2, 9, 3],
  k: 3,
  T: 5
};
const res1 = validator.validateInput(validCase);
assert.strictEqual(res1.isValid, true);
assert.strictEqual(res1.errors.length, 0);
console.log("✓ PASS: Valid input passes constraint validation");

// 3. Invalid Array Size Test
const emptyCase = {
  stations: [],
  k: 1,
  T: 5
};
const res2 = validator.validateInput(emptyCase);
assert.strictEqual(res2.isValid, false);
assert.ok(res2.errors.some(e => e.includes("stations") && e.includes("violates constraint")));
console.log("✓ PASS: Rejects empty array when min length is 1");

// 4. Invalid Relational Parameter (k > stations.length)
const invalidKCase = {
  stations: [1, 2, 3],
  k: 5,
  T: 10
};
const res3 = validator.validateInput(invalidKCase);
assert.strictEqual(res3.isValid, false);
assert.ok(res3.errors.some(e => e.includes("k") && e.includes("violates relational constraint")));
console.log("✓ PASS: Rejects relational violation where k > stations.length");

// 5. Invalid Element Out of Bounds
const invalidElemCase = {
  stations: [5, 20000, 3],
  k: 2,
  T: 10
};
const res4 = validator.validateInput(invalidElemCase);
assert.strictEqual(res4.isValid, false);
assert.ok(res4.errors.some(e => e.includes("violates range")));
console.log("✓ PASS: Rejects element value exceeding max bound");

// 6. Missing Parameter
const missingParamCase = {
  stations: [1, 2, 3],
  k: 2
  // T missing
};
const res5 = validator.validateInput(missingParamCase);
assert.strictEqual(res5.isValid, false);
assert.ok(res5.errors.some(e => e.includes("Missing required parameter 'T'")));
console.log("✓ PASS: Rejects missing required parameter");

// 7. Wrong Type (String instead of number[])
const wrongTypeCase = {
  stations: "not an array",
  k: 2,
  T: 10
};
const res6 = validator.validateInput(wrongTypeCase);
assert.strictEqual(res6.isValid, false);
assert.ok(res6.errors.some(e => e.includes("invalid type")));
console.log("✓ PASS: Rejects incorrect parameter data type");

// 8. Batch Validation
const batchRes = validator.validateBatch([
  { categoryId: "typical", input: validCase },
  { categoryId: "typical", input: invalidKCase }
]);
assert.strictEqual(batchRes.valid.length, 1);
assert.strictEqual(batchRes.invalid.length, 1);
assert.strictEqual(batchRes.categoryBreakdown["typical"].valid, 1);
assert.strictEqual(batchRes.categoryBreakdown["typical"].invalid, 1);
console.log("✓ PASS: Batch validation accurately tracks valid/invalid categorized items");

console.log("\n=== ALL CONSTRAINT VALIDATOR TESTS PASSED ===");

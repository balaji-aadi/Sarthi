import assert from 'assert';
import dotenv from 'dotenv';
import { extractAndParseJSON, getFactoryAIProvider } from '../services/content-factory/adapters/GroqAdapter.js';

dotenv.config();

console.log("=== Testing AI Provider & JSON Extraction Engine ===");

// 1. Test clean JSON
const sample1 = '{"title": "Valid Problem", "difficulty": "Medium"}';
const parsed1 = extractAndParseJSON(sample1);
assert.strictEqual(parsed1.title, "Valid Problem");
assert.strictEqual(parsed1.difficulty, "Medium");
console.log("✓ PASS: Pure JSON parsing");

// 2. Test Markdown Fenced JSON
const sample2 = '```json\n{\n  "status": "success",\n  "count": 42\n}\n```';
const parsed2 = extractAndParseJSON(sample2);
assert.strictEqual(parsed2.status, "success");
assert.strictEqual(parsed2.count, 42);
console.log("✓ PASS: Markdown fenced JSON parsing");

// 3. Test Text with surrounding preamble/postamble
const sample3 = 'Here is your generated response:\n\n```\n{"result": true, "items": [1, 2, 3]}\n```\nHope this helps!';
const parsed3 = extractAndParseJSON(sample3);
assert.strictEqual(parsed3.result, true);
assert.strictEqual(parsed3.items.length, 3);
console.log("✓ PASS: Surrounded preamble extraction");

// 4. Test Trailing commas
const sample4 = '{\n  "name": "algo",\n  "values": [10, 20, ],\n}';
const parsed4 = extractAndParseJSON(sample4);
assert.strictEqual(parsed4.name, "algo");
assert.strictEqual(parsed4.values.length, 2);
console.log("✓ PASS: Trailing comma correction");

// 5. Test Live Provider invocation with small request
async function testLiveProvider() {
  const provider = getFactoryAIProvider();
  if (!provider.apiKey) {
    console.warn("⚠️ SKIP Live API Call: No GROQ_API_KEY in environment");
    return;
  }

  console.log("Calling live AI provider with structured JSON request...");
  const response = await provider.generateJSON({
    prompt: "Return a JSON object with keys: 'status' with value 'active', and 'message' with value 'Sarthi DSA Factory operational'.",
    systemPrompt: "You are a test helper that only returns valid JSON.",
    maxTokens: 100
  });

  assert.ok(response, "Response must exist");
  assert.strictEqual(response.status, "active");
  console.log("✓ PASS: Live AI Provider structured JSON response received:", response);
}

testLiveProvider()
  .then(() => {
    console.log("\n=== ALL AI PROVIDER TESTS PASSED ===");
    process.exit(0);
  })
  .catch((err) => {
    console.error("AI Provider Test Failed:", err);
    process.exit(1);
  });

import {
  generatePythonTemplate,
  generateJavaScriptTemplate,
  generateCppTemplate,
  generateJavaTemplate,
  generateAllStarterTemplates,
  normalizeCanonicalType,
  normalizeFunctionDefinition
} from '../../shared/templateGenerator.js';

import {
  DATA_TYPE_PARSER_MAP,
  RETURN_TYPE_SERIALIZER_MAP,
  validateSingleInput
} from '../services/problem-service/problem.validator.js';

import {
  QuestionGenerationEngine,
  sanitizeLatexMath
} from '../services/content-factory/generators/QuestionGenerationEngine.js';

import { ProblemQualityValidator } from '../services/content-factory/validation/ProblemQualityValidator.js';

console.log("===============================================================================");
console.log("  QUESTION FACTORY PIPELINE FIX REGRESSION TEST SUITE");
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

function assertThrows(fn, expectedSubstr, message) {
  try {
    fn();
    console.error(`  ✗ FAIL: ${message} (Expected error containing "${expectedSubstr}", but nothing was thrown)`);
    failed++;
  } catch (err) {
    if (err.message.toLowerCase().includes(expectedSubstr.toLowerCase())) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message} (Expected "${expectedSubstr}", received "${err.message}")`);
      failed++;
    }
  }
}

// -----------------------------------------------------------------------------
// TEST GROUP A: Canonical Type Normalization (integer -> number, list<integer> -> number[])
// -----------------------------------------------------------------------------
console.log("[Group A: Integer & Number Normalization]");

assert(normalizeCanonicalType('integer') === 'number', "Normalizes 'integer' -> 'number'");
assert(normalizeCanonicalType('int') === 'number', "Normalizes 'int' -> 'number'");
assert(normalizeCanonicalType('number') === 'number', "Normalizes 'number' -> 'number'");
assert(normalizeCanonicalType('INTEGER') === 'number', "Normalizes uppercase 'INTEGER' -> 'number'");

console.log("\n[Group B: List Integer Normalization]");
assert(normalizeCanonicalType('list<integer>') === 'number[]', "Normalizes 'list<integer>' -> 'number[]'");
assert(normalizeCanonicalType('list<int>') === 'number[]', "Normalizes 'list<int>' -> 'number[]'");
assert(normalizeCanonicalType('list[integer]') === 'number[]', "Normalizes 'list[integer]' -> 'number[]'");
assert(normalizeCanonicalType('integer[]') === 'number[]', "Normalizes 'integer[]' -> 'number[]'");
assert(normalizeCanonicalType('int[]') === 'number[]', "Normalizes 'int[]' -> 'number[]'");
assert(normalizeCanonicalType('number[]') === 'number[]', "Normalizes 'number[]' -> 'number[]'");
assert(normalizeCanonicalType('list<string>') === 'string[]', "Normalizes 'list<string>' -> 'string[]'");
assert(normalizeCanonicalType('list<boolean>') === 'boolean[]', "Normalizes 'list<boolean>' -> 'boolean[]'");
assert(normalizeCanonicalType('list<list<integer>>') === 'number[][]', "Normalizes 'list<list<integer>>' -> 'number[][]'");

// Problem validator mappings
assert(DATA_TYPE_PARSER_MAP['integer'] === 'PrimitiveParser', "DATA_TYPE_PARSER_MAP has 'integer'");
assert(DATA_TYPE_PARSER_MAP['list<integer>'] === 'ArrayParser', "DATA_TYPE_PARSER_MAP has 'list<integer>'");
assert(RETURN_TYPE_SERIALIZER_MAP['integer'].includes('PrimitiveSerializer'), "RETURN_TYPE_SERIALIZER_MAP has 'integer'");

// -----------------------------------------------------------------------------
// TEST GROUP C: Starter Generation for DRAFT-138779 Function Definition
// -----------------------------------------------------------------------------
console.log("\n[Group C: Starter Code Generation Across 4 Languages]");

const draft138779FnDef = {
  functionName: "solution",
  parameters: [
    { name: "partitions", type: "list<integer>" },
    { name: "maxConflicts", type: "integer" }
  ],
  returnType: "integer"
};

const templates = generateAllStarterTemplates(draft138779FnDef);

// Python Verification
const py = templates.python;
assert(py.includes("def solution(self, partitions: List[int], maxConflicts: int) -> int:"), "Python: exact signature with List[int] and int -> int");
assert(!py.includes("-> None"), "Python: return annotation is NOT None");
assert(!py.includes("modify input in-place"), "Python: NOT an in-place mutation template");
assert(py.includes("# Write your solution here"), "Python: standard write your solution comment");

// JavaScript Verification
const js = templates.javascript;
assert(js.includes("* @param {number[]} partitions"), "JS: JSDoc parameter partitions is number[]");
assert(js.includes("* @param {number} maxConflicts"), "JS: JSDoc parameter maxConflicts is number");
assert(js.includes("* @return {number}"), "JS: JSDoc return is number");
assert(js.includes("var solution = function(partitions, maxConflicts) {"), "JS: exact function signature with parameters");
assert(!js.includes("@return {void}"), "JS: return is NOT void");

// C++ Verification
const cpp = templates.cpp;
assert(cpp.includes("int solution(vector<int>& partitions, int maxConflicts)"), "C++: exact signature with vector<int>& and int return");
assert(!cpp.includes("void solution("), "C++: return type is NOT void");

// Java Verification
const java = templates.java;
assert(java.includes("public int solution(int[] partitions, int maxConflicts)"), "Java: exact signature with int[] and int return");
assert(!java.includes("public void solution("), "Java: return type is NOT void");

// -----------------------------------------------------------------------------
// TEST GROUP D: Zero-Argument / Bad String Invocation Regression
// -----------------------------------------------------------------------------
console.log("\n[Group D: Zero-Argument & String Argument Regression]");

assertThrows(
  () => generateAllStarterTemplates("maxBatchWindow"),
  "InvalidFunctionDefinitionError",
  "Throws InvalidFunctionDefinitionError when passed a string instead of an object"
);

assertThrows(
  () => generateAllStarterTemplates(null),
  "InvalidFunctionDefinitionError",
  "Throws InvalidFunctionDefinitionError when passed null"
);

assertThrows(
  () => generateAllStarterTemplates(["not", "an", "object"]),
  "InvalidFunctionDefinitionError",
  "Throws InvalidFunctionDefinitionError when passed an array"
);

// -----------------------------------------------------------------------------
// TEST GROUP E: Return Type Regression
// -----------------------------------------------------------------------------
console.log("\n[Group E: Return Type Preservation]");

const testFnDefIntReturn = {
  functionName: "compute",
  parameters: [{ name: "val", type: "integer" }],
  returnType: "integer"
};

const pyInt = generatePythonTemplate(testFnDefIntReturn);
assert(pyInt.includes("-> int:"), "Integer return type preserves '-> int:'");
assert(!pyInt.includes("-> None:"), "Integer return type NEVER becomes '-> None:'");

// -----------------------------------------------------------------------------
// TEST GROUP F: Parameter Preservation Regression
// -----------------------------------------------------------------------------
console.log("\n[Group F: Parameter Preservation]");

for (const lang of ['python', 'javascript', 'cpp', 'java']) {
  const code = templates[lang];
  assert(code.includes("partitions"), `${lang}: preserves 'partitions' parameter`);
  assert(code.includes("maxConflicts"), `${lang}: preserves 'maxConflicts' parameter`);
}

// -----------------------------------------------------------------------------
// TEST GROUP G: Content Rendering Contract & LaTeX Sanitization
// -----------------------------------------------------------------------------
console.log("\n[Group G: Content Rendering Contract & LaTeX Sanitization]");

const rawLatexDescription = `
In a high-throughput distributed database:
$$\\binom{c_p}{2} = \\frac{c_p \\times (c_p - 1)}{2}$$

The total contention is:
$$\\text{totalConflicts} = \\sum_{p} \\frac{c_p \\times (c_p - 1)}{2}$$
`;

const sanitized = sanitizeLatexMath(rawLatexDescription);
assert(!sanitized.includes("\\binom"), "Sanitizer removes '\\binom'");
assert(!sanitized.includes("\\frac"), "Sanitizer removes '\\frac'");
assert(!sanitized.includes("\\times"), "Sanitizer removes '\\times'");
assert(!sanitized.includes("\\sum"), "Sanitizer removes '\\sum'");
assert(!sanitized.includes("\\text{"), "Sanitizer removes '\\text{'");
assert(sanitized.includes("c_p * (c_p - 1) / 2"), "Sanitizer converts binom to 'c_p * (c_p - 1) / 2'");

// ProblemQualityValidator should reject raw LaTeX if un-sanitized
const mockProblemSpecWithLatex = {
  title: "Test LaTeX Problem",
  descriptionMarkdown: rawLatexDescription,
  difficulty: "Medium",
  functionDefinition: draft138779FnDef,
  constraints: ["1 <= n <= 100"],
  examples: [{ input: "a = 1", output: "1", explanation: "step 1" }],
  referenceSolution: {
    code: "class Solution:\n    def solution(self, partitions, maxConflicts):\n        return 0\n",
    timeComplexity: "O(N)"
  },
  intendedAlgorithm: "Sliding window with state",
  editorialMarkdown: "Editorial explaining algorithm"
};

const qualityRes = await ProblemQualityValidator.evaluate({
  problemSpec: mockProblemSpecWithLatex,
  testStrategy: { categories: [] },
  compiledTestCases: []
});

assert(qualityRes.qualityReport.clarity === 'FAIL', "ProblemQualityValidator flags clarity 'FAIL' on raw LaTeX macros");
assert(qualityRes.details.some(d => d.includes("Unsupported LaTeX syntax detected")), "ProblemQualityValidator includes descriptive LaTeX error details");

// -----------------------------------------------------------------------------
// TEST GROUP H: Full Factory Pipeline Integration Test
// -----------------------------------------------------------------------------
console.log("\n[Group H: Factory Pipeline Integration Test]");

const mockProvider = {
  async generateJSON({ prompt }) {
    return {
      title: "Safe Window Lock Allocation",
      slug: "safe-window-lock-allocation",
      difficulty: "Medium",
      descriptionMarkdown: "Safe window lock allocation with partitions and maxConflicts under budget.\n`c_p * (c_p - 1) / 2` conflicts per partition.",
      constraints: ["1 <= partitions.length <= 10^5", "0 <= maxConflicts <= 10^5"],
      examples: [{
        input: "partitions = [1, 2, 1], maxConflicts = 1",
        output: "3",
        explanation: "All 3 elements form valid window.",
        order: 1
      }],
      functionDefinition: {
        functionName: "maxBatchWindow",
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
      referenceSolution: {
        language: "python",
        code: "class Solution:\n    def maxBatchWindow(self, partitions, maxConflicts):\n        return len(partitions)\n",
        timeComplexity: "O(N)",
        spaceComplexity: "O(K)"
      },
      intendedAlgorithm: "Sliding window maintaining count map and total conflict pairs with while left expansion.",
      editorialMarkdown: "Use two pointers left and right."
    };
  }
};

const engine = new QuestionGenerationEngine(mockProvider);
const compiledSpec = await engine.generateProblemSpec({ pattern: 'Sliding Window', difficulty: 'Medium' });

assert(Array.isArray(compiledSpec.starterCode) && compiledSpec.starterCode.length === 4, "Engine generates all 4 starterCode templates");

const pyStarter = compiledSpec.starterCode.find(s => s.language === 'python');
assert(pyStarter.code.includes("def maxBatchWindow(self, partitions: List[int], maxConflicts: int) -> int:"), "Pipeline generates correct Python signature");

const jsStarter = compiledSpec.starterCode.find(s => s.language === 'javascript');
assert(jsStarter.code.includes("var maxBatchWindow = function(partitions, maxConflicts) {"), "Pipeline generates correct JavaScript signature");

const cppStarter = compiledSpec.starterCode.find(s => s.language === 'cpp');
assert(cppStarter.code.includes("int maxBatchWindow(vector<int>& partitions, int maxConflicts)"), "Pipeline generates correct C++ signature");

const javaStarter = compiledSpec.starterCode.find(s => s.language === 'java');
assert(javaStarter.code.includes("public int maxBatchWindow(int[] partitions, int maxConflicts)"), "Pipeline generates correct Java signature");

console.log("\n===============================================================================");
console.log(`  PIPELINE FIX REGRESSION TEST SUMMARY: ${passed} Passed, ${failed} Failed.`);
console.log("===============================================================================\n");

if (failed > 0) {
  process.exit(1);
}

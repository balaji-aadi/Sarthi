/**
 * Prompt Templates for Sarthi DSA Question Factory
 * Enforces structured output, canonical Sarthi data types, algorithmic contracts,
 * and zero contamination in test strategies.
 */

import { getPatternContract } from '../patterns/PatternContractRegistry.js';

export const SUPPORTED_PARAM_TYPES = [
  'number', 'string', 'boolean',
  'number[]', 'string[]', 'boolean[]',
  'number[][]', 'string[][]', 'boolean[][]',
  'ListNode', 'TreeNode'
];

export const SUPPORTED_RETURN_TYPES = [
  'number', 'string', 'boolean',
  'number[]', 'string[]', 'boolean[]',
  'number[][]', 'string[][]', 'boolean[][]',
  'ListNode', 'TreeNode'
];

/**
 * Pass 1: Core Problem Specification Prompt with Algorithmic Pattern Contract
 */
export function buildProblemSpecPrompt({ pattern = 'Sliding Window', difficulty = 'Medium', directives = '' }) {
  const contract = getPatternContract(pattern);
  const contractInstructions = contract.getPass1ContractInstructions(difficulty);

  return `
You are the Lead DSA Curriculum Architect at Sarthi.
Design an original, interview-grade Data Structures & Algorithms problem targeting the "${pattern}" pattern at "${difficulty}" difficulty.

${directives ? `Specific Directives from Admin: "${directives}"` : ''}

${contractInstructions}

CRITICAL RULES:
1. The problem must be 100% original. Do not copy LeetCode, Codeforces, or HackerRank problem storylines verbatim.
2. The problem MUST genuinely test the ${pattern} learning objective. Avoid trivial reductions or decorative wrappers around basic sums.
3. The function signature and parameters must strictly adhere to Sarthi standard types:
   - Allowed parameter types: ${SUPPORTED_PARAM_TYPES.join(', ')}
   - Allowed return types: ${SUPPORTED_RETURN_TYPES.join(', ')}
4. All constraint statements MUST explicitly reference the exact parameter names from functionDefinition (e.g. if parameter is "stations", write "1 <= stations.length <= 10^5", NOT "1 <= n <= 10^5" unless n is explicitly stated as stations.length).
5. The reference solution MUST be written in Python 3.
   - It MUST define 'class Solution:' containing the method matching the exact functionName and parameter names:
     class Solution:
         def functionName(self, param1, param2):
             return result
   - It MUST be self-contained and NOT print anything to stdout (no print statements).
   - It MUST implement the optimal algorithmic contract for the declared difficulty.
6. MARKDOWN & MATH RENDERING CONTRACT (MANDATORY):
   - Do NOT generate raw LaTeX commands such as: \\binom, \\frac, \\sum, \\text{}, \\times, \\sqrt, etc.
   - Sarthi's frontend renderer does NOT support LaTeX macros.
   - Prefer plain Markdown, inline code (e.g. \`c_p * (c_p - 1) / 2\`), code blocks, and standard readable text.
   - Always use concrete, learner-friendly examples to explain formulas before presenting general expressions.
     (e.g., "If a partition appears 3 times, those 3 transactions form 3 pairs: 1st <-> 2nd, 1st <-> 3rd, and 2nd <-> 3rd. Therefore, 3 * (3 - 1) / 2 = 3 conflicts. Total conflicts is the sum of this quantity for every distinct partition.")
7. Output MUST be valid JSON adhering exactly to the following schema.

Respond ONLY with a JSON object matching this schema:
{
  "title": "String (engaging, professional DSA title)",
  "slug": "kebab-case-slug",
  "difficulty": "${difficulty}",
  "descriptionMarkdown": "String (Markdown problem statement, clear problem background, parameter definitions, and objective)",
  "examples": [
    {
      "input": "param1 = [...], param2 = ... (strictly structured parameter assignments matching functionDefinition)",
      "output": "Exact expected output matching the reference solution return value (MUST be strictly mathematically verified)",
      "explanation": "Clear explanation showing step-by-step evaluation matching the declared output",
      "order": 1
    }
  ],
  "constraints": [
    "1 <= <paramName>.length <= 10^5",
    "0 <= <paramName>[i] <= 10^4"
  ],
  "hints": [
    "Hint 1...",
    "Hint 2..."
  ],
  "functionDefinition": {
    "functionName": "camelCaseName",
    "parameters": [
      {
        "name": "paramName",
        "type": "one of: ${SUPPORTED_PARAM_TYPES.join(', ')}",
        "description": "parameter description"
      }
    ],
    "returnType": "one of: ${SUPPORTED_RETURN_TYPES.join(', ')}"
  },
  "executionProfile": {
    "runtimeType": "FUNCTION",
    "outputSerializer": "PrimitiveSerializer (use ArraySerializer for 1D arrays, MatrixSerializer for 2D)",
    "comparator": "ExactMatch"
  },
  "referenceSolution": {
    "language": "python",
    "code": "class Solution:\\n    def functionName(self, params):\\n        # optimal implementation\\n        return result",
    "timeComplexity": "O(...)",
    "spaceComplexity": "O(...)"
  },
  "intendedAlgorithm": "Detailed explanation of the optimal algorithm, window state transitions, and why it solves the problem",
  "editorialMarkdown": "Editorial walkthrough explaining naive brute-force vs optimal approach",
  "learningObjective": {
    "pattern": "${pattern}",
    "coreSkill": "Core skill tested by this problem",
    "recognitionSignal": "Key indicators that suggest this pattern",
    "requiredInvariant": "The invariant that must be maintained",
    "difficultyReason": "Why this problem fits ${difficulty} difficulty",
    "commonWrongApproaches": [
      "Naive approach and why it fails",
      "Common implementation pitfall"
    ]
  }
}
`;
}

/**
 * Pass 2: Problem-Specific Test Strategy Prompt (Contamination-Free)
 */
export function buildTestStrategyPrompt({ problemSpec }) {
  const pattern = problemSpec.factoryMetadata?.learningObjective?.pattern || problemSpec.pattern || 'Sliding Window';
  const contract = getPatternContract(pattern);
  const trapSuggestions = contract.getPass2StrategyInstructions();

  return `
You are the Lead QA & Test Strategy Architect at Sarthi.
Analyze the following DSA problem specification and construct a comprehensive, problem-specific test strategy.

Problem Title: ${problemSpec.title}
Difficulty: ${problemSpec.difficulty}
Constraints:
${(problemSpec.constraints || []).map(c => `- ${c}`).join('\n')}

Function Signature:
${problemSpec.functionDefinition.functionName}(${problemSpec.functionDefinition.parameters.map(p => `${p.name}: ${p.type}`).join(', ')}) -> ${problemSpec.functionDefinition.returnType}

Intended Algorithm:
${problemSpec.intendedAlgorithm}

${trapSuggestions}

CRITICAL RULES:
1. DO NOT copy generic placeholders or unrelated pattern terms.
2. The strategy and targeted mistakes must describe ONLY the specific rules, constraints, and traps of THIS EXACT problem.
3. If the problem constraints only allow non-negative numbers, DO NOT suggest testing negative numbers.
4. Formulate test categories to rigorously stress-test student submissions:
   - edge_cases: minimal constraints, empty/singleton where allowed, zeroes, bounds
   - boundary_cases: upper constraint boundaries, window size equals array size, identical elements
   - pattern_traps: inputs designed to fail greedy choices, off-by-one errors, ties, or tricky transitions
   - typical_cases: standard representative inputs with realistic distribution

Respond ONLY with a JSON object matching this schema:
{
  "summary": "Brief summary of the test strategy for this specific problem",
  "intendedAlgorithm": "${problemSpec.intendedAlgorithm?.slice(0, 300) || 'Optimal implementation'}",
  "targetedMistakes": [
    "Specific common student mistake #1 relevant to this problem",
    "Specific common student mistake #2 relevant to this problem",
    "Specific common student mistake #3 relevant to this problem"
  ],
  "categories": [
    {
      "categoryId": "edge_cases",
      "description": "Specific minimal and edge boundary conditions for this problem",
      "targetCount": 3
    },
    {
      "categoryId": "boundary_cases",
      "description": "Specific constraint boundary conditions for this problem",
      "targetCount": 3
    },
    {
      "categoryId": "pattern_traps",
      "description": "Specific inputs targeting common wrong algorithms or off-by-one errors for this problem",
      "targetCount": 4
    },
    {
      "categoryId": "typical_cases",
      "description": "Standard representative test cases for this problem",
      "targetCount": 3
    }
  ]
}
`;
}

/**
 * Pass 3: Batch Semantic Test Input Generation Prompt
 * (Generates edge_cases, boundary_cases, pattern_traps, typical_cases. Performance cases are generated deterministically in Phase 4)
 */
export function buildBatchTestInputsPrompt({ problemSpec, testStrategy }) {
  const paramList = problemSpec.functionDefinition.parameters;
  const paramTemplate = {};
  paramList.forEach(p => {
    paramTemplate[p.name] = `<value matching type ${p.type}>`;
  });

  return `
You are a Test Data Generator for Sarthi DSA Engine.
Generate comprehensive test case INPUTS across the 4 semantic test categories for the problem "${problemSpec.title}".

Problem Constraints:
${(problemSpec.constraints || []).map(c => `- ${c}`).join('\n')}

Required Function Parameters:
${paramList.map(p => `- ${p.name} (${p.type})`).join('\n')}

STRICT RULES:
1. Generate test INPUTS only. Do NOT generate expected outputs.
2. Every test input must be a JSON object mapping EXACT parameter names: [${paramList.map(p => `"${p.name}"`).join(', ')}].
3. Adhere strictly to all numerical bounds, array bounds, and relational constraints.
4. You must provide:
   - exactly 3 inputs in "edge_cases"
   - exactly 3 inputs in "boundary_cases"
   - exactly 4 inputs in "pattern_traps"
   - exactly 3 inputs in "typical_cases"

Respond ONLY with a JSON object matching this schema:
{
  "edge_cases": [
    ${JSON.stringify(paramTemplate, null, 2)}
  ],
  "boundary_cases": [
    ${JSON.stringify(paramTemplate, null, 2)}
  ],
  "pattern_traps": [
    ${JSON.stringify(paramTemplate, null, 2)}
  ],
  "typical_cases": [
    ${JSON.stringify(paramTemplate, null, 2)}
  ]
}
`;
}

/**
 * Category-Specific Regeneration Prompt
 */
export function buildCategoryRegenerationPrompt({ problemSpec, categoryId, categoryDescription, count = 3, failureReasons = [] }) {
  const paramList = problemSpec.functionDefinition.parameters;
  const paramTemplate = {};
  paramList.forEach(p => {
    paramTemplate[p.name] = `<value matching type ${p.type}>`;
  });

  return `
You are correcting previously rejected test case inputs for Sarthi DSA Engine.
The previous test inputs generated for category "${categoryId}" (${categoryDescription}) FAILED constraint validation for the following reasons:
${failureReasons.map(r => `- ${r}`).join('\n')}

Problem: ${problemSpec.title}
Constraints:
${(problemSpec.constraints || []).map(c => `- ${c}`).join('\n')}

Required Parameters:
${paramList.map(p => `- ${p.name} (${p.type})`).join('\n')}

STRICT RULES:
1. Generate exactly ${count} test case INPUTS for category "${categoryId}".
2. Obey ALL constraints strictly to prevent rejection.
3. Every test input must map exact parameter names: [${paramList.map(p => `"${p.name}"`).join(', ')}].

Respond ONLY with a JSON object matching this schema:
{
  "categoryId": "${categoryId}",
  "inputs": [
    ${JSON.stringify(paramTemplate, null, 2)}
  ]
}
`;
}

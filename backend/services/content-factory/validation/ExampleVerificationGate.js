import { ReferenceRunner } from '../../judge/referenceRunner.js';
import { ComparatorRegistry } from '../../judge/comparators/ComparatorRegistry.js';

/**
 * ExampleVerificationGate (Phase 2 Hardening)
 * 
 * Verifies that all human-facing examples in problemSpec.examples are mathematically correct
 * and consistent with the reference solution before a draft can enter Review or Published.
 */
export class ExampleVerificationGate {
  /**
   * Parses an example input string into structured parameter object or array compatible with ReferenceRunner.
   * Handles:
   * 1. Key-value string assignments: "ratings = [2, 5, 1, 3, 4], minRequired = 4, budget = 3"
   * 2. Key-value colons: "ratings: [2, 5, 1, 3, 4], minRequired: 4, budget: 3"
   * 3. JSON array of positional args: "[[1, 3, 6, 4, 2, 5], 2]"
   * 4. JSON object: "{\"ratings\": [2, 5, 1, 3, 4], \"minRequired\": 4, \"budget\": 3}"
   * 5. Single primitive or array string: "[1, 2, 3, 4]"
   * 
   * @param {string|Object} rawInput
   * @param {Object} functionDefinition
   * @returns {Object} Structured input dictionary { param1: val1, ... }
   */
  static parseExampleInput(rawInput, functionDefinition) {
    if (!rawInput) return {};
    if (typeof rawInput === 'object' && !Array.isArray(rawInput)) {
      return rawInput;
    }

    const params = functionDefinition?.parameters || [];
    let strInput = typeof rawInput === 'string' ? rawInput.trim() : JSON.stringify(rawInput);

    // Normalize Python literals in JSON representation
    const normalizePyLiterals = (s) => s.replace(/\bTrue\b/g, 'true')
                                        .replace(/\bFalse\b/g, 'false')
                                        .replace(/\bNone\b/g, 'null');

    // Attempt 1: Standard JSON parse
    try {
      const parsed = JSON.parse(normalizePyLiterals(strInput));
      if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) {
        return parsed;
      }
      if (Array.isArray(parsed)) {
        if (params.length === 1) {
          return { [params[0].name]: parsed };
        }
        if (parsed.length === params.length) {
          const dict = {};
          params.forEach((p, idx) => {
            dict[p.name] = parsed[idx];
          });
          return dict;
        }
      }
    } catch (_) {
      // Not raw JSON, proceed to tokenized assignment parser
    }

    // Attempt 2: Tokenize comma-separated assignments: "var1 = val1, var2 = val2"
    // Split on commas that are not nested within brackets, braces, or quotes
    const tokens = [];
    let currentToken = '';
    let bracketDepth = 0;
    let braceDepth = 0;
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < strInput.length; i++) {
      const ch = strInput[i];
      if (inQuotes) {
        currentToken += ch;
        if (ch === quoteChar && strInput[i - 1] !== '\\') {
          inQuotes = false;
        }
      } else {
        if (ch === '"' || ch === "'") {
          inQuotes = true;
          quoteChar = ch;
          currentToken += ch;
        } else if (ch === '[' || ch === '(') {
          bracketDepth++;
          currentToken += ch;
        } else if (ch === ']' || ch === ')') {
          bracketDepth--;
          currentToken += ch;
        } else if (ch === '{') {
          braceDepth++;
          currentToken += ch;
        } else if (ch === '}') {
          braceDepth--;
          currentToken += ch;
        } else if (ch === ',' && bracketDepth === 0 && braceDepth === 0) {
          if (currentToken.trim()) tokens.push(currentToken.trim());
          currentToken = '';
        } else {
          currentToken += ch;
        }
      }
    }
    if (currentToken.trim()) tokens.push(currentToken.trim());

    const result = {};
    for (const token of tokens) {
      const assignMatch = token.match(/^([a-zA-Z0-9_]+)\s*[:=]\s*(.*)$/s);
      if (assignMatch) {
        const paramName = assignMatch[1].trim();
        const rawVal = assignMatch[2].trim();
        try {
          result[paramName] = JSON.parse(normalizePyLiterals(rawVal));
        } catch (_) {
          // If scalar number
          if (!isNaN(Number(rawVal))) {
            result[paramName] = Number(rawVal);
          } else {
            result[paramName] = rawVal.replace(/^["']|["']$/g, '');
          }
        }
      }
    }

    if (Object.keys(result).length > 0) {
      return result;
    }

    // Attempt 3: Single parameter fallback
    if (params.length === 1) {
      try {
        return { [params[0].name]: JSON.parse(normalizePyLiterals(strInput)) };
      } catch (_) {
        return { [params[0].name]: strInput };
      }
    }

    return {};
  }

  /**
   * Parses declared example output into typed value.
   */
  static parseExampleOutput(rawOutput) {
    if (rawOutput === undefined || rawOutput === null) return null;
    if (typeof rawOutput !== 'string') return rawOutput;
    const clean = rawOutput.trim()
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null');
    try {
      return JSON.parse(clean);
    } catch (_) {
      if (!isNaN(Number(clean))) return Number(clean);
      return clean;
    }
  }

  /**
   * Audits explanation text for blatant internal contradictions with declared or reference outputs.
   */
  static auditExplanation(explanation, declaredOutput, referenceOutput) {
    if (!explanation || typeof explanation !== 'string') return null;

    const lower = explanation.toLowerCase();
    
    // Check 1: Explanation explicitly states a different output than declared
    // e.g. "The output should be 1" when declared is 2, or "Hence the answer is 4" when declared is 5
    const conflictPatterns = [
      /output\s+should\s+be\s+[*`]?(-?\d+)[*`]?/i,
      /hence\s+the\s+answer\s+is\s+[*`]?(-?\d+)[*`]?/i,
      /correct\s+(?:longest\s+)?(?:stable\s+)?segment\s+is.*length\s+[*`]?(-?\d+)[*`]?/i,
      /minimum\s+evictions\s*=\s*[*`]?(-?\d+)[*`]?/i
    ];

    for (const pat of conflictPatterns) {
      const match = explanation.match(pat);
      if (match && match[1]) {
        const explainedNum = Number(match[1]);
        if (Number(declaredOutput) !== explainedNum) {
          return `Explanation text explicitly states answer is ${explainedNum}, contradicting declared output '${declaredOutput}'.`;
        }
      }
    }

    // Check 2: Reference output mismatch confirmation
    if (declaredOutput !== referenceOutput && explanation.includes(String(referenceOutput))) {
      return `Explanation references correct answer (${referenceOutput}), but declared output field specifies incorrect value (${declaredOutput}).`;
    }

    return null;
  }

  /**
   * Executes trusted reference solution over every student-facing example.
   * Compares declared expected outputs with mathematically computed truth outputs.
   * Hard-fails if any example is mathematically false or contradictory.
   * 
   * @param {Object} params
   * @param {Object} params.problemSpec
   * @param {Object} params.referenceSolution
   * @param {Object} [params.executionProfile]
   * @returns {Promise<Object>}
   */
  static async verify({ problemSpec, referenceSolution, executionProfile = {} }) {
    const examples = problemSpec.examples || [];
    if (!examples || examples.length === 0) {
      return {
        passed: false,
        verdict: 'NO_EXAMPLES',
        error: 'Problem specification contains zero student-facing examples.',
        exampleReports: []
      };
    }

    const funcDef = problemSpec.functionDefinition;
    const refCode = referenceSolution?.code;
    if (!refCode) {
      return {
        passed: false,
        verdict: 'NO_REFERENCE_CODE',
        error: 'Reference solution code is missing for example verification.',
        exampleReports: []
      };
    }

    const parsedTestCases = [];
    const exampleAuditReports = [];
    const errors = [];

    // Parse all examples into executable test cases
    for (let idx = 0; idx < examples.length; idx++) {
      const ex = examples[idx];
      const parsedInput = this.parseExampleInput(ex.input, funcDef);
      const parsedDeclaredOutput = this.parseExampleOutput(ex.output);

      // Verify that parsed input has required parameters
      const missingParams = (funcDef.parameters || [])
        .map(p => p.name)
        .filter(pName => parsedInput[pName] === undefined);

      if (missingParams.length > 0) {
        errors.push(`Example #${ex.order || idx + 1}: Failed to parse required parameter(s) [${missingParams.join(', ')}] from input string "${ex.input}".`);
      }

      parsedTestCases.push({
        input: parsedInput,
        expectedOutput: parsedDeclaredOutput,
        order: ex.order || idx + 1,
        rawInput: ex.input,
        declaredOutput: parsedDeclaredOutput,
        explanation: ex.explanation || ''
      });
    }

    if (errors.length > 0) {
      return {
        passed: false,
        verdict: 'EXAMPLE_PARSING_FAILED',
        error: errors.join('; '),
        errors,
        exampleReports: []
      };
    }

    // Execute reference runner to compute ground truth
    let runnerRes;
    try {
      runnerRes = await ReferenceRunner.execute({
        language: 'python',
        referenceCode: refCode,
        functionDefinition: funcDef,
        testCases: parsedTestCases,
        executionProfile,
        timeLimitMs: 4000
      });
    } catch (execErr) {
      return {
        passed: false,
        verdict: 'REFERENCE_RUNNER_ERROR',
        error: `Reference runner failed during example verification: ${execErr.message}`,
        errors: [execErr.message],
        exampleReports: []
      };
    }

    if (!runnerRes.success) {
      return {
        passed: false,
        verdict: 'REFERENCE_EXECUTION_FAILED',
        error: runnerRes.error || 'Failed to execute reference solution over examples.',
        errors: [runnerRes.error],
        exampleReports: []
      };
    }

    const comparator = executionProfile?.comparator || 'ExactMatch';

    // Verify each example's declared output against reference output
    for (let idx = 0; idx < parsedTestCases.length; idx++) {
      const tc = parsedTestCases[idx];
      const actualOutput = runnerRes.compiledTestCases[idx]?.expectedOutput;
      const compRes = ComparatorRegistry.compare(actualOutput, tc.declaredOutput, comparator);
      const isMatch = Boolean(compRes === true || compRes?.passed === true || compRes?.match === true);

      const explanationWarning = this.auditExplanation(tc.explanation, tc.declaredOutput, actualOutput);

      const report = {
        exampleOrder: tc.order,
        rawInput: tc.rawInput,
        declaredOutput: tc.declaredOutput,
        computedTruthOutput: actualOutput,
        isMatch,
        explanationWarning
      };

      if (!isMatch) {
        errors.push(
          `Example #${tc.order} Output Mismatch: Declared output '${JSON.stringify(tc.declaredOutput)}' does not match reference truth '${JSON.stringify(actualOutput)}'.`
        );
      }

      if (explanationWarning) {
        errors.push(`Example #${tc.order} Explanation Contradiction: ${explanationWarning}`);
      }

      exampleAuditReports.push(report);
    }

    const passed = errors.length === 0;

    return {
      passed,
      verdict: passed ? 'PASSED' : 'EXAMPLE_VALIDATION_FAILED',
      error: passed ? '' : errors.join(' | '),
      errors,
      exampleReports: exampleAuditReports
    };
  }
}

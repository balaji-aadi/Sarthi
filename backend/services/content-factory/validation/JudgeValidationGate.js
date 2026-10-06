import { CoreJudgeExecutor } from '../../judge/executor/CoreJudgeExecutor.js';

export const PERF_WARNING_THRESHOLD_MS = 1200; // Configurable performance warning threshold

export function normalizePythonReferenceCode(code, functionName = 'solution') {
  if (!code || typeof code !== 'string') return '';
  let cleanCode = code.trim();
  
  // Unescape literal backslash-n if returned from JSON as literal \n
  if (cleanCode.includes('\\n')) {
    cleanCode = cleanCode.replace(/\\r/g, '').replace(/\\n/g, '\n').replace(/\\t/g, '    ');
  }

  if (!cleanCode.includes('class Solution')) {
    cleanCode = `${cleanCode}\n\nclass Solution:\n    @staticmethod\n    def ${functionName}(*args, **kwargs):\n        return ${functionName}(*args, **kwargs)\n`;
  }
  return cleanCode;
}

export class JudgeValidationGate {
  /**
   * Executes the generated reference solution through the real production CoreJudgeExecutor.
   * Proves that drivers, serializers, comparators, and process isolation all work seamlessly.
   * 
   * @param {Object} params
   * @param {Object} params.referenceSolution - { language: 'python', code: string }
   * @param {Object} params.functionDefinition
   * @param {Object} params.executionProfile
   * @param {Array} params.testCases - [{ input, expectedOutput }]
   * @param {Object} [params.executionLimits]
   * @returns {Promise<Object>}
   */
  static async validate({
    referenceSolution,
    functionDefinition,
    executionProfile,
    testCases = [],
    executionLimits = { timeLimitMs: 2000, memoryLimitMb: 256 }
  }) {
    if (!referenceSolution?.code) {
      return {
        passed: false,
        verdict: 'NO_REFERENCE_CODE',
        error: 'Reference solution code is missing.',
        executionTimeMs: 0,
        performanceStatus: 'UNTESTED'
      };
    }

    if (!testCases || testCases.length === 0) {
      return {
        passed: false,
        verdict: 'NO_TEST_CASES',
        error: 'No compiled test cases available for Judge execution.',
        executionTimeMs: 0,
        performanceStatus: 'UNTESTED'
      };
    }

    try {
      const funcName = functionDefinition?.name || functionDefinition?.functionName || 'solution';
      const executableCode = normalizePythonReferenceCode(referenceSolution.code, funcName);

      const judgeRes = await CoreJudgeExecutor.execute({
        language: 'python',
        code: executableCode,
        functionDefinition,
        executionProfile,
        testCases,
        executionLimits,
        isSubmit: true
      });

      const isAccepted = judgeRes.verdict === 'ACCEPTED' || judgeRes.verdict === 'Accepted' || (judgeRes.passedTestCases === judgeRes.totalTestCases && judgeRes.totalTestCases > 0);
      const executionTimeMs = judgeRes.executionTimeMs || 0;

      let performanceStatus = 'OPTIMAL';
      let performanceWarningDetails = '';

      if (executionTimeMs > PERF_WARNING_THRESHOLD_MS) {
        performanceStatus = 'WARNING';
        performanceWarningDetails = `Execution time of ${executionTimeMs}ms exceeds target threshold of ${PERF_WARNING_THRESHOLD_MS}ms. Optimization recommended.`;
      } else if (executionTimeMs > 600) {
        performanceStatus = 'ACCEPTABLE';
      }

      if (!isAccepted) {
        return {
          passed: false,
          verdict: judgeRes.verdict || judgeRes.status || 'FAILED',
          error: judgeRes.error || `Judge self-test failed: ${judgeRes.passedTestCases}/${judgeRes.totalTestCases} passed.`,
          passedTestCases: judgeRes.passedTestCases || 0,
          totalTestCases: judgeRes.totalTestCases || testCases.length,
          executionTimeMs,
          performanceStatus: 'UNTESTED'
        };
      }

      return {
        passed: true,
        verdict: 'Accepted',
        passedTestCases: judgeRes.passedTestCases,
        totalTestCases: judgeRes.totalTestCases,
        executionTimeMs,
        performanceStatus,
        performanceWarningDetails
      };
    } catch (judgeErr) {
      return {
        passed: false,
        verdict: 'JUDGE_CRASH',
        error: `Unexpected exception in CoreJudgeExecutor: ${judgeErr.message}`,
        executionTimeMs: 0,
        performanceStatus: 'UNTESTED'
      };
    }
  }
}

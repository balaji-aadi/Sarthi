import { RuntimeProcessExecutor } from '../runners/RuntimeProcessExecutor.js';
import { DockerSandboxExecutor, isDockerAvailable } from '../sandbox/DockerSandboxExecutor.js';
import { normalizeExecutionLimits } from '../sandbox/ExecutionLimits.js';

export const SUPPORTED_LLD_LANGUAGES = Object.freeze(['cpp', 'c++', 'python', 'python3', 'java']);

/**
 * LLD Direct Program Executor (Phase 1 & 2)
 * 
 * Executes complete, student-authored programs (classes, objects, inheritance, main())
 * directly without wrapping in a DSA 'class Solution' or function-call harness.
 */
export class LldDirectProgramExecutor {
  /**
   * Executes a direct program submission.
   * 
   * @param {Object} params
   * @param {string} params.language Target programming language ('cpp', 'python', 'java')
   * @param {string} params.code Student's complete source code (containing main())
   * @param {Object} [params.executionLimits] Resource constraints (time, memory, output, cpu)
   * @param {boolean} [params.strictSandboxMode] Enforce Docker-only execution
   * @returns {Promise<Object>} Normalized execution result:
   *   {
   *     success: boolean,
   *     status: 'SUCCESS' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'OUTPUT_LIMIT_EXCEEDED' | 'PROCESS_ERROR' | 'SANDBOX_UNAVAILABLE',
   *     executionTimeMs: number,
   *     stdout: string,
   *     stderr: string,
   *     error: string | null
   *   }
   */
  static async execute({
    language,
    code,
    executionLimits = {},
    strictSandboxMode = false
  }) {
    // 1. Validate Source Code Parameter
    if (!code || typeof code !== 'string' || !code.trim()) {
      return {
        success: false,
        status: 'PROCESS_ERROR',
        executionTimeMs: 0,
        stdout: '',
        stderr: '',
        error: 'Code parameter cannot be empty.'
      };
    }

    // 2. Validate Language Support
    const cleanLang = (language || '').toLowerCase().trim();
    if (!cleanLang || !SUPPORTED_LLD_LANGUAGES.includes(cleanLang)) {
      return {
        success: false,
        status: 'PROCESS_ERROR',
        executionTimeMs: 0,
        stdout: '',
        stderr: '',
        error: `Unsupported LLD language: '${language}'. Supported languages: C++, Python, Java.`
      };
    }

    // 3. Normalize Resource Limits (LLD defaults to 5000ms for full system programs)
    const limits = normalizeExecutionLimits({ timeLimitMs: 5000, ...executionLimits });

    // 4. Strict Sandbox Enforcement (Zero Silent Host Bypass)
    const dockerReady = isDockerAvailable();
    if (strictSandboxMode && !dockerReady) {
      return {
        success: false,
        status: 'SANDBOX_UNAVAILABLE',
        executionTimeMs: 0,
        stdout: '',
        stderr: '',
        error: 'Docker container sandbox is not available in the host environment.'
      };
    }

    // 5. Dispatch to Sandbox or Host Runner
    let procResult;
    if (dockerReady) {
      procResult = await DockerSandboxExecutor.execute({
        language: cleanLang,
        sourceCode: code,
        executionLimits: limits,
        testCasesCount: 1,
        directProgram: true
      });
    } else {
      procResult = await RuntimeProcessExecutor.executeProgram({
        language: cleanLang,
        sourceCode: code,
        timeLimitMs: limits.timeLimitMs,
        maxMemoryMb: limits.memoryLimitMb,
        maxOutputBytes: limits.outputLimitBytes,
        testCasesCount: 1,
        directProgram: true
      });
    }

    // 6. Return Normalized LLD Execution Result
    return {
      success: procResult.status === 'SUCCESS',
      status: procResult.status,
      executionTimeMs: procResult.executionTimeMs || 0,
      stdout: procResult.stdout || '',
      stderr: procResult.stderr || '',
      error: procResult.error || null
    };
  }
}

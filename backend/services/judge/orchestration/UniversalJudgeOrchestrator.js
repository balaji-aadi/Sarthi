import { CoreJudgeExecutor } from '../executor/CoreJudgeExecutor.js';
import { LldDirectProgramExecutor } from '../lld/LldDirectProgramExecutor.js';

export const EXECUTION_MODES = Object.freeze({
  FUNCTION_CALL: 'FUNCTION_CALL',
  DIRECT_PROGRAM: 'DIRECT_PROGRAM'
});

/**
 * UniversalJudgeOrchestrator - Top-Level Universal Dispatcher (Phase 6)
 * 
 * Supports both:
 * 1. DSA Execution Profile (FUNCTION_CALL): Injected driver, testcase comparison, LeetCode function model.
 * 2. LLD Execution Profile (DIRECT_PROGRAM): Standalone executable program, student main(), classes/objects.
 * 
 * Backward Compatibility Guarantee:
 * If executionMode is omitted, defaults to FUNCTION_CALL, preserving 100% of existing DSA behavior.
 */
export class UniversalJudgeOrchestrator {
  static async execute(request = {}) {
    const mode = (request.executionMode || EXECUTION_MODES.FUNCTION_CALL).toUpperCase().trim();

    if (mode === EXECUTION_MODES.DIRECT_PROGRAM) {
      return await LldDirectProgramExecutor.execute({
        language: request.language,
        code: request.code,
        executionLimits: request.executionLimits,
        strictSandboxMode: request.strictSandboxMode
      });
    }

    // Default: Dispatch to Frozen DSA CoreJudgeExecutor
    return await CoreJudgeExecutor.execute(request);
  }
}

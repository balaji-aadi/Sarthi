/**
 * WrongSolutionRegistry (Phase 2.6 Hardened)
 * 
 * Defines algorithmic strategies and mutations derived from learning objectives.
 * 
 * CORE FACTORY PRINCIPLE:
 * "The Question Factory must evaluate whether a student's algorithm is correct
 * under the problem specification, not whether it resembles the factory's
 * reference implementation."
 * 
 * Explicit Semantic Classifications:
 * - INTENTIONALLY_WRONG: Logically incorrect strategy that MUST be rejected.
 * - CORRECT_ALTERNATIVE: Alternative valid implementation (e.g. different valid two-pointer approach).
 * - EQUIVALENT_OPTIMIZATION: Non-shrinking or alternative loop that produces identical answers.
 * - SUBOPTIMAL_BUT_CORRECT: Logically sound approach that fails performance/complexity limits (e.g. naive O(N*K)).
 * - UNKNOWN: Semantic validity not yet established (requires differential verification).
 */

export const MutationSemantic = {
  INTENTIONALLY_WRONG: 'INTENTIONALLY_WRONG',
  CORRECT_ALTERNATIVE: 'CORRECT_ALTERNATIVE',
  EQUIVALENT_OPTIMIZATION: 'EQUIVALENT_OPTIMIZATION',
  SUBOPTIMAL_BUT_CORRECT: 'SUBOPTIMAL_BUT_CORRECT',
  UNKNOWN: 'UNKNOWN'
};

export const CorrectnessStatus = {
  CORRECT: 'CORRECT',
  WRONG: 'WRONG'
};

export const ComplexityStatus = {
  WITHIN_LIMIT: 'WITHIN_LIMIT',
  PERFORMANCE_WARNING: 'PERFORMANCE_WARNING',
  PERFORMANCE_FAILURE: 'PERFORMANCE_FAILURE',
  NOT_MEASURED: 'NOT_MEASURED'
};

export class WrongSolutionRegistry {
  /**
   * Generates candidate mutations for a given pattern and problem specification.
   * @param {Object} params
   * @param {string} params.pattern - e.g. "Sliding Window"
   * @param {Object} params.problemSpec
   * @returns {Array<{ id: string, name: string, description: string, code: string, targetTrap: string, initialClassification: string }>}
   */
  static getWrongSolutions({ pattern = "Sliding Window", problemSpec }) {
    const mutations = [];
    const refCode = problemSpec.referenceSolution?.code || "";
    const funcName = problemSpec.functionDefinition?.name || problemSpec.functionDefinition?.functionName || "solution";
    const params = problemSpec.functionDefinition?.parameters || [];
    const arrayParam = params.find(p => p.type.endsWith('[]'))?.name || 'nums';
    const scalarParam = params.find(p => p.type === 'number')?.name || 'k';

    if (!refCode) return mutations;

    // 1. Single-Step Shrink Mutation
    // In exact-equality or minimum-window problems, single-step fails.
    // In maximum-window monotonic problems, it is the canonical Non-Shrinking Window optimization.
    const hasWhileShrink = refCode.includes('while ') && (refCode.includes('left +=') || refCode.includes('left+=') || refCode.includes('left = left + 1'));
    if (hasWhileShrink) {
      const singleStepCode = refCode.replace(/while\s+([^:\n]+):/g, (match, cond) => {
        if ((cond.includes('left') || cond.includes('switches') || cond.includes('drop') || cond.includes('deficit')) && !cond.includes('[-1]')) {
          return `if ${cond}:`;
        }
        return match;
      });

      if (singleStepCode !== refCode) {
        mutations.push({
          id: 'single_step_shrink',
          name: 'Single-Step Window Shrink',
          description: 'Replaces while shrink loop with a single if-check. May be an EQUIVALENT_OPTIMIZATION for max-window or INTENTIONALLY_WRONG for exact-sum/min-window.',
          code: singleStepCode,
          targetTrap: 'catastrophic_multi_shrink_spike',
          initialClassification: MutationSemantic.UNKNOWN
        });
      }
    }

    // 2. Off-by-One Window Sizing Mutation (INTENTIONALLY_WRONG)
    if (refCode.includes('right - left + 1')) {
      const offByOneCode = refCode.replace(/right\s*-\s*left\s*\+\s*1/g, 'right - left');
      mutations.push({
        id: 'off_by_one_window_size',
        name: 'Off-by-One Window Sizing',
        description: 'Computes window length as (right - left) instead of (right - left + 1).',
        code: offByOneCode,
        targetTrap: 'minimal_single_element_array',
        initialClassification: MutationSemantic.INTENTIONALLY_WRONG
      });
    }

    // 3. Reset-on-Transition Greedy Fallacy (for transition/drop counting problems) (INTENTIONALLY_WRONG)
    const hasTransition = refCode.includes('switches') || refCode.includes('jobs[right] !=') || refCode.includes('metrics[right] <');
    if (hasTransition) {
      const resetCode = `
class Solution:
    def ${funcName}(self, ${arrayParam}, ${scalarParam}):
        n = len(${arrayParam})
        if n == 0: return 0
        left = 0
        count = 0
        max_len = 1
        for right in range(1, n):
            if ${arrayParam}[right] != ${arrayParam}[right - 1]:
                count += 1
            if count > ${scalarParam}:
                left = right
                count = 0
            cur = right - left + 1
            if cur > max_len:
                max_len = cur
        return max_len
`.trim();

      mutations.push({
        id: 'reset_on_transition',
        name: 'Reset on Transition Fallacy',
        description: 'Hard-resets window to left = right whenever event budget is exceeded, destroying valid windows that cross boundaries.',
        code: resetCode,
        targetTrap: 'reset_transition_asymmetric_trap',
        initialClassification: MutationSemantic.INTENTIONALLY_WRONG
      });
    }

    // 4. Stale Scalar Max (for Monotonic Deque problems) (INTENTIONALLY_WRONG)
    const hasDeque = refCode.includes('deque') || refCode.includes('max_deque') || refCode.includes('min_deque');
    if (hasDeque) {
      const staleScalarCode = `
class Solution:
    def ${funcName}(self, ${arrayParam}, ${scalarParam}):
        n = len(${arrayParam})
        max_len = 0
        left = 0
        curr_max = 0
        for right in range(n):
            curr_max = max(curr_max, ${arrayParam}[right])
            while left <= right and curr_max * (right - left + 1) > ${scalarParam}:
                left += 1
            if left <= right:
                max_len = max(max_len, right - left + 1)
        return max_len
`.trim();

      mutations.push({
        id: 'stale_scalar_max',
        name: 'Stale Scalar Maximum Fallacy',
        description: 'Tracks maximum with a scalar variable without monotonic deque, failing to decrease maximum when peaks exit window.',
        code: staleScalarCode,
        targetTrap: 'peak_drop_recovery_trap',
        initialClassification: MutationSemantic.INTENTIONALLY_WRONG
      });

      // 5. Stale Deque Front (INTENTIONALLY_WRONG)
      if (refCode.includes('.popleft()')) {
        const staleFrontCode = refCode.replace(/if\s+[a-zA-Z0-9_]+\[0\]\s*<\s*left:\s*\n\s*[a-zA-Z0-9_]+\.popleft\(\)/g, '# Omitted popleft bug');
        if (staleFrontCode !== refCode) {
          mutations.push({
            id: 'stale_deque_front',
            name: 'Stale Deque Front Eviction Failure',
            description: 'Advances left pointer but forgets to evict out-of-bounds maximum from deque front.',
            code: staleFrontCode,
            targetTrap: 'deque_front_stale_trap',
            initialClassification: MutationSemantic.INTENTIONALLY_WRONG
          });
        }
      }

      // 6. Naive Slice Rescan (SUBOPTIMAL_BUT_CORRECT)
      const naiveRescanCode = `
class Solution:
    def ${funcName}(self, ${arrayParam}, ${scalarParam}):
        n = len(${arrayParam})
        max_len = 0
        left = 0
        for right in range(n):
            # Logically correct O(N*K) slice rescan
            while left <= right and max(${arrayParam}[left:right+1]) * (right - left + 1) > ${scalarParam}:
                left += 1
            if left <= right:
                max_len = max(max_len, right - left + 1)
        return max_len
`.trim();

      mutations.push({
        id: 'naive_slice_rescan',
        name: 'Naive Window Slice Rescan',
        description: 'Recomputes maximum via array slicing on each contraction. Logically sound, but complexity-invalid under high N.',
        code: naiveRescanCode,
        targetTrap: 'sustained_large_window_scale',
        initialClassification: MutationSemantic.SUBOPTIMAL_BUT_CORRECT
      });
    }

    // 7. Surplus Offset Fallacy (INTENTIONALLY_WRONG)
    const hasDeficit = refCode.includes('deficit') || refCode.includes('budget') || refCode.includes('minRequired');
    if (hasDeficit && refCode.includes('minRequired - ratings[')) {
      let surplusCode = refCode.replace(
        /if\s+ratings\[right\]\s*<\s*minRequired:\s*\n\s*deficit\s*\+=\s*minRequired\s*-\s*ratings\[right\]/g,
        'deficit += minRequired - ratings[right]'
      );
      if (surplusCode !== refCode) {
        mutations.push({
          id: 'surplus_offset_fallacy',
          name: 'Surplus Offset Fallacy',
          description: 'Allows servers with ratings exceeding minRequired to generate negative deficit to subsidize broken servers.',
          code: surplusCode,
          targetTrap: 'surplus_subsidy_trap',
          initialClassification: MutationSemantic.INTENTIONALLY_WRONG
        });
      }
    }

    return mutations;
  }
}

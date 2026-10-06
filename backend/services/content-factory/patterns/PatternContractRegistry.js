/**
 * Sarthi Pattern Learning Contract Registry
 * 
 * Formalizes algorithmic requirements, core skills, recognition signals, invariants,
 * forbidden trivializations, and targeted traps for each DSA pattern.
 * Used during Problem Spec generation, Test Strategy formulation, and Problem Quality validation.
 */

export class PatternLearningContract {
  constructor({
    pattern,
    coreSkill,
    recognitionSignals = [],
    requiredInvariants = [],
    antiPatternsAndTrivializations = [],
    forbiddenSimplifications = {},
    commonWrongApproaches = [],
    expectedTimeComplexity = 'O(N)',
    expectedSpaceComplexity = 'O(1) or O(K)',
    suggestedTraps = []
  }) {
    this.pattern = pattern;
    this.coreSkill = coreSkill;
    this.recognitionSignals = recognitionSignals;
    this.requiredInvariants = requiredInvariants;
    this.antiPatternsAndTrivializations = antiPatternsAndTrivializations;
    this.forbiddenSimplifications = forbiddenSimplifications;
    this.commonWrongApproaches = commonWrongApproaches;
    this.expectedTimeComplexity = expectedTimeComplexity;
    this.expectedSpaceComplexity = expectedSpaceComplexity;
    this.suggestedTraps = suggestedTraps;
  }

  /**
   * Generates prompt instructions for Pass 1 (Problem Spec Generation).
   */
  getPass1ContractInstructions(difficulty = 'Medium') {
    const forbiddenForDifficulty = this.forbiddenSimplifications[difficulty] || [];
    return `
ALGORITHMIC PATTERN CONTRACT: "${this.pattern}"
- Core Learning Objective: ${this.coreSkill}
- Invariant Requirement: ${this.requiredInvariants.join('; ')}
- Recognition Signals: ${this.recognitionSignals.join('; ')}
- Anti-Patterns / Forbidden Trivializations:
${this.antiPatternsAndTrivializations.map(ap => `  * ${ap}`).join('\n')}
${forbiddenForDifficulty.length > 0 ? `- Strict Requirements for ${difficulty} difficulty:\n${forbiddenForDifficulty.map(f => `  * ${f}`).join('\n')}` : ''}
- Expected Optimal Complexity: Time ${this.expectedTimeComplexity}, Space ${this.expectedSpaceComplexity}.
- DO NOT generate a problem where the pattern is decorative. The optimal solution MUST genuinely maintain and update the pattern invariant.
`;
  }

  /**
   * Generates prompt instructions for Pass 2 (Test Strategy Formulation).
   */
  getPass2StrategyInstructions() {
    return `
TARGETED COMMON STUDENT TRAPS FOR "${this.pattern}":
${this.commonWrongApproaches.map(m => `- ${m}`).join('\n')}
${this.suggestedTraps.map(t => `- Trap Case: ${t}`).join('\n')}
`;
  }
}

export const PATTERN_REGISTRY = {
  'Sliding Window': new PatternLearningContract({
    pattern: 'Sliding Window',
    coreSkill: 'Contiguous range optimization where a window state is incrementally updated as bounds move, avoiding redundant re-computation.',
    recognitionSignals: [
      'Problem asks for optimal/longest/shortest contiguous subarray or substring satisfying a monotone condition',
      'Brute force recomputing each range requires O(N^2) or O(N*K), while sliding window achieves O(N)',
      'State changes incrementally by adding right element and removing/adjusting left element'
    ],
    requiredInvariants: [
      'Window bounds [left, right] represent a contiguous span whose state is maintained in O(1) amortized per step',
      'The expansion and shrinking conditions must be driven by problem constraints (budget, frequency, uniqueness, or budget backup)'
    ],
    antiPatternsAndTrivializations: [
      'Trivial fixed window sum with an unconstrained scalar added at the end (e.g. max_sum(k) + T)',
      'Problems that can be solved by simple global sorting or direct mathematical closed-form',
      'Problems where contiguous ordering does not matter'
    ],
    forbiddenSimplifications: {
      'Medium': [
        'Must NOT be a plain unconstrained fixed-size max sum without variable budget, dynamic valid conditions, or capacity threshold.',
        'Must require maintaining a non-trivial window state (e.g., dynamic window expansion with shrinking under budget, or elements with replenishment / battery replacement constraints).',
        'Brute-force O(N^2) or O(N*K) must exceed time limits on n=10^5.'
      ],
      'Hard': [
        'Must involve multi-state window invariant or auxiliary data structure (monotonic deque / hash table / two budgets).',
        'Shrink condition must require careful non-trivial bounds restoration.'
      ]
    },
    commonWrongApproaches: [
      'Recomputing the window from scratch for every index O(N*K)',
      'Off-by-one errors on window sizing or slice indices',
      'Greedy termination without evaluating larger or alternate valid windows',
      'Improper window shrinking condition leaving invalid states',
      'Integer overflow or boundary mishandling on minimal arrays'
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1) or O(K)',
    suggestedTraps: [
      'Inputs where the optimal window is at the very beginning or very end',
      'Inputs with extreme spikes where a greedy choice fails',
      'Arrays where all elements satisfy or all fail the condition',
      'Window size equals array length (k == n)',
      'Subtle budget consumption requiring proper state decrement'
    ]
  }),

  'Two Pointers': new PatternLearningContract({
    pattern: 'Two Pointers',
    coreSkill: 'Iterating through sorted or structured sequences using two convergent or directional pointers to eliminate half the search space at each step.',
    recognitionSignals: [
      'Searching pairs or triplets in sorted sequences',
      'Partitioning or in-place swapping',
      'Comparing from both ends toward the middle'
    ],
    requiredInvariants: [
      'Monotonic movement of left and right pointers based on comparison against target'
    ],
    antiPatternsAndTrivializations: [
      'Using a hash map for two-sum when two pointers on sorted array was requested',
      'Problems requiring arbitrary graph search'
    ],
    forbiddenSimplifications: {
      'Medium': [
        'Must require careful duplicate skipping or multi-target conditions',
        'Cannot be a single 2-line while loop without edge condition handling'
      ]
    },
    commonWrongApproaches: [
      'Infinite loops due to improper pointer increment/decrement',
      'Failing to skip duplicate values leading to duplicate answer pairs',
      'Index out of bounds on array limits'
    ],
    expectedTimeComplexity: 'O(N log N) or O(N)',
    expectedSpaceComplexity: 'O(1)'
  }),

  'Prefix Sum': new PatternLearningContract({
    pattern: 'Prefix Sum',
    coreSkill: 'Precomputing cumulative sums to answer range queries in O(1) time or combining with hash maps to find subarrays with target sums.',
    recognitionSignals: [
      'Frequent subarray sum queries',
      'Count of subarrays with sum divisible by or equal to K'
    ],
    requiredInvariants: [
      'Sum(i...j) = Prefix[j+1] - Prefix[i]; frequency map of seen prefix sums'
    ],
    antiPatternsAndTrivializations: [
      'Brute force nested loops recalculating subarray sums'
    ],
    commonWrongApproaches: [
      'Off-by-one on prefix array indexing',
      'Forgetting to initialize hash map with {0: 1} for subarrays starting at index 0'
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(N)'
  }),

  'Binary Search': new PatternLearningContract({
    pattern: 'Binary Search',
    coreSkill: 'Logarithmic search space reduction over monotonic answer spaces (binary search on answer) or sorted arrays.',
    recognitionSignals: [
      'Finding min/max value satisfying a monotonic feasibility function',
      'Sorted arrays or rotated sorted arrays'
    ],
    requiredInvariants: [
      'Feasibility function f(mid) is monotonic (False...False, True...True)'
    ],
    antiPatternsAndTrivializations: [
      'Linear scanning O(N) when O(log N) or O(N log(Range)) was intended'
    ],
    commonWrongApproaches: [
      'Integer overflow on (low + high) / 2',
      'Infinite loops from improper mid adjustment (low = mid vs low = mid + 1)',
      'Wrong boundary return (low vs high)'
    ],
    expectedTimeComplexity: 'O(log N) or O(N log(Range))',
    expectedSpaceComplexity: 'O(1)'
  }),

  'Monotonic Stack': new PatternLearningContract({
    pattern: 'Monotonic Stack',
    coreSkill: 'Maintaining elements in strictly increasing or decreasing order to find the next/previous greater/smaller element in linear time.',
    recognitionSignals: [
      'Next greater element, previous smaller element',
      'Histogram areas, stock span, daily temperatures'
    ],
    requiredInvariants: [
      'Stack maintains indices or values in monotonic order; elements popped when new element violates monotonicity'
    ],
    antiPatternsAndTrivializations: [
      'Nested loops O(N^2) searching forward from each index'
    ],
    commonWrongApproaches: [
      'Storing values instead of indices when distances are needed',
      'Using < instead of <= causing duplicate errors'
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(N)'
  })
};

/**
 * Resolves a pattern contract, falling back to a generic default contract if unknown.
 */
export function getPatternContract(patternName = 'Sliding Window') {
  if (PATTERN_REGISTRY[patternName]) {
    return PATTERN_REGISTRY[patternName];
  }
  // Case-insensitive lookup
  const clean = (patternName || '').toLowerCase().trim();
  for (const [key, contract] of Object.entries(PATTERN_REGISTRY)) {
    if (key.toLowerCase() === clean) {
      return contract;
    }
  }

  // Generic fallback
  return new PatternLearningContract({
    pattern: patternName,
    coreSkill: `Rigorous application of the "${patternName}" pattern to solve the problem optimally.`,
    recognitionSignals: [`Problem requires optimal algorithmic efficiency using ${patternName}.`],
    requiredInvariants: [`Core ${patternName} invariants must be maintained throughout state transitions.`],
    antiPatternsAndTrivializations: [`Trivial bypass of ${patternName} using naive brute force.`],
    commonWrongApproaches: [`Brute force complexity exceeding time limits`, `Edge case boundary errors`]
  });
}

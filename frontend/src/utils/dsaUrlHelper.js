/**
 * dsaUrlHelper.js
 * 
 * Centralized utility for resolving DSA problem URLs and metadata.
 * 
 * Rules & Guarantees:
 * 1. Explicit task.leetcodeUrl takes precedence.
 * 2. Clearly distinguishes verified/explicit URL from generated fallback.
 * 3. Generated fallback is NEVER presented as verified.
 * 4. Difficulty is never guessed or derived from taskPriority.
 */

/**
 * Generates a standard LeetCode search/problem URL fallback based on task title.
 * Clearly designated as a generated fallback, NOT a verified explicit URL.
 * 
 * @param {string} title
 * @returns {string}
 */
export const getGeneratedLeetCodeSlugUrl = (title) => {
  if (!title) return 'https://leetcode.com/problemset/';
  const slug = String(title)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `https://leetcode.com/problems/${slug}/description/`;
};

/**
 * Resolves the URL and verification status for a DSA problem.
 * 
 * Precedence:
 * 1. Explicit task.leetcodeUrl (if non-empty string) -> uses explicit URL.
 *    - isExplicit: true
 *    - isVerified: Boolean(task.isUrlVerified)
 *    - source: isVerified ? 'VERIFIED_EXPLICIT' : 'MANUAL_EXPLICIT'
 *    - label: isVerified ? 'Verified LeetCode Link' : 'Provided Link (Unverified)'
 * 2. Generated fallback from problem title:
 *    - isExplicit: false
 *    - isVerified: false
 *    - source: 'GENERATED_FALLBACK'
 *    - label: 'Search Fallback (Unverified)'
 * 
 * @param {Object} task
 * @returns {{ url: string, isExplicit: boolean, isVerified: boolean, source: string, label: string }}
 */
export const resolveProblemUrl = (task) => {
  if (!task) {
    return {
      url: 'https://leetcode.com/problemset/',
      isExplicit: false,
      isVerified: false,
      source: 'DEFAULT',
      label: 'LeetCode'
    };
  }

  const explicitUrl = typeof task.leetcodeUrl === 'string' ? task.leetcodeUrl.trim() : '';
  if (explicitUrl) {
    const isVerified = Boolean(task.isUrlVerified);
    return {
      url: explicitUrl,
      isExplicit: true,
      isVerified,
      source: isVerified ? 'VERIFIED_EXPLICIT' : 'MANUAL_EXPLICIT',
      label: isVerified ? 'Verified LeetCode Link' : 'Provided Link (Unverified)'
    };
  }

  const fallbackUrl = getGeneratedLeetCodeSlugUrl(task.taskName);
  return {
    url: fallbackUrl,
    isExplicit: false,
    isVerified: false,
    source: 'GENERATED_FALLBACK',
    label: 'Search Fallback (Unverified)'
  };
};

/**
 * Normalizes difficulty value without guessing or deriving from priority.
 * Returns null if difficulty is missing, empty, or not explicitly Easy/Medium/Hard.
 * 
 * @param {Object} task
 * @returns {'Easy' | 'Medium' | 'Hard' | null}
 */
export const getProblemDifficulty = (task) => {
  if (!task) return null;
  const d = task.difficulty;
  if (typeof d === 'string') {
    const trimmed = d.trim();
    if (['Easy', 'Medium', 'Hard'].includes(trimmed)) {
      return trimmed;
    }
  }
  return null;
};

/**
 * Styling configuration for difficulty badges.
 */
export const DIFFICULTY_CONFIG = {
  Easy: {
    label: 'Easy',
    style: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
  },
  Medium: {
    label: 'Medium',
    style: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
  },
  Hard: {
    label: 'Hard',
    style: 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
  }
};

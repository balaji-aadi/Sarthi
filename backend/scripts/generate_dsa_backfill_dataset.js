import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const leetcodeMaster = JSON.parse(fs.readFileSync(path.join(__dirname, '../../leetcode_problems_master.json'), 'utf-8'));
const ourProblems = JSON.parse(fs.readFileSync(path.join(__dirname, '../../problem_titles_for_mapping.json'), 'utf-8'));

// Build lookup maps
const bySlug = new Map();
const byCleanTitle = new Map();

function normalizeTitle(t) {
  return t
    .toLowerCase()
    .replace(/\|\|\|/g, "iii")
    .replace(/\|\|/g, "ii")
    .replace(/\|/g, "i")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toSlug(t) {
  return t
    .toLowerCase()
    .replace(/\|\|\|/g, "iii")
    .replace(/\|\|/g, "ii")
    .replace(/\|/g, "i")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

Object.values(leetcodeMaster).forEach(p => {
  bySlug.set(p.slug, p);
  byCleanTitle.set(normalizeTitle(p.title), p);
});

// Explicit verified overrides for custom or non-standard titled problems
const explicitOverrides = {
  // Concept / custom briefs
  "DSA-2": { leetcodeUrl: null, difficulty: null }, // Patterns Brief
  "DSA-47": { leetcodeUrl: null, difficulty: null }, // Difference array basics
  "DSAP2-134": { leetcodeUrl: null, difficulty: null }, // Recursive Bubble Sort (conceptual exercise)

  // Specific LeetCode title variations
  "DSA-6": { leetcodeSlug: "max-consecutive-ones-iii", difficulty: "Medium" },
  "DSA-11": { leetcodeSlug: "longest-substring-with-at-most-k-distinct-characters", difficulty: "Medium" },
  "DSA-12": { leetcodeSlug: "number-of-substrings-containing-all-three-characters", difficulty: "Medium" },
  "DSA-13": { leetcodeSlug: "binary-subarrays-with-sum", difficulty: "Medium" },
  "DSA-19": { leetcodeSlug: "two-sum-ii-input-array-is-sorted", difficulty: "Medium" },
  "DSA-26": { leetcodeSlug: "squares-of-a-sorted-array", difficulty: "Easy" },
  "DSA-27": { leetcodeSlug: "partition-array-according-to-given-pivot", difficulty: "Medium" },
  "DSA-41": { leetcodeSlug: "range-sum-query-immutable", difficulty: "Easy" },
  "DSA-44": { leetcodeSlug: "subarray-sums-divisible-by-k", difficulty: "Medium" },
  "DSA-46": { leetcodeSlug: "maximum-size-subarray-sum-equals-k", difficulty: "Medium" },
  "DSA-56": { leetcodeUrl: null, difficulty: "Hard" }, // Maximum sum rectangle (2D Kadane / GFG)
  "DSA-61": { leetcodeSlug: "maximum-difference-between-increasing-elements", difficulty: "Easy" },
  "DSA-87": { leetcodeSlug: "online-stock-span", difficulty: "Medium" },
  "DSA-90": { leetcodeUrl: null, difficulty: "Medium" }, // Next smaller element (GFG / Interview classic)
  "DSA-110": { leetcodeSlug: "longest-palindromic-subsequence", difficulty: "Medium" },
  "DSA-115": { leetcodeSlug: "minimum-insertion-steps-to-make-a-string-palindrome", difficulty: "Hard" },
  "DSA-170": { leetcodeUrl: null, difficulty: "Medium" }, // Aggressive Cows (SPOJ / GFG classic)
  "DSAP2-21": { leetcodeSlug: "reverse-linked-list", difficulty: "Easy" },
  "DSAP2-22": { leetcodeUrl: null, difficulty: "Medium" }, // Reverse first K elements of given linked list
  "DSAP2-44": { leetcodeSlug: "copy-list-with-random-pointer", difficulty: "Medium" },
  "DSAP2-52": { leetcodeSlug: "implement-stack-using-queues", difficulty: "Easy" },
  "DSAP2-77": { leetcodeSlug: "implement-queue-using-stacks", difficulty: "Easy" },
  "DSAP2-88": { leetcodeSlug: "design-front-middle-back-queue", difficulty: "Medium" },
  "DSAP2-89": { leetcodeSlug: "design-hit-counter", difficulty: "Medium" },
  "DSAP3-96": { leetcodeSlug: "number-of-longest-increasing-subsequence", difficulty: "Medium" },
  "DSAP2-111": { leetcodeUrl: null, difficulty: null }, // Factorial (Recursion drill)
  "DSAP2-112": { leetcodeSlug: "fibonacci-number", difficulty: "Easy" },
  "DSAP2-113": { leetcodeSlug: "powx-n", difficulty: "Medium" },
  "DSAP2-114": { leetcodeUrl: null, difficulty: null }, // Sum of Array (Recursion drill)
  "DSAP2-123": { leetcodeSlug: "sort-an-array", difficulty: "Medium" }, // Merge Sort
  "DSAP2-124": { leetcodeSlug: "sort-an-array", difficulty: "Medium" }, // Quick Sort
  "DSAP2-132": { leetcodeSlug: "find-the-winner-of-the-circular-game", difficulty: "Medium" }, // Josephus
  "DSAP2-133": { leetcodeUrl: null, difficulty: "Medium" }, // Tower of Hanoi
};

const backfillDataset = [];

ourProblems.forEach(p => {
  let leetcodeUrl = null;
  let difficulty = null;

  if (explicitOverrides[p.taskId]) {
    const override = explicitOverrides[p.taskId];
    if (override.leetcodeSlug) {
      leetcodeUrl = `https://leetcode.com/problems/${override.leetcodeSlug}/`;
      difficulty = override.difficulty;
    } else {
      leetcodeUrl = override.leetcodeUrl;
      difficulty = override.difficulty;
    }
  } else {
    const norm = normalizeTitle(p.title);
    const slug = toSlug(p.title);

    let match = bySlug.get(slug) || byCleanTitle.get(norm);
    if (!match) {
      const stripped = p.title.replace(/\([^)]*\)/g, "").trim();
      match = bySlug.get(toSlug(stripped)) || byCleanTitle.get(normalizeTitle(stripped));
    }

    if (match) {
      leetcodeUrl = `https://leetcode.com/problems/${match.slug}/`;
      difficulty = match.difficulty;
    }
  }

  backfillDataset.push({
    taskId: p.taskId,
    title: p.title,
    leetcodeUrl: leetcodeUrl,
    difficulty: difficulty
  });
});

// Sort by taskId numeric index
backfillDataset.sort((a, b) => {
  const getParts = (id) => {
    if (id.startsWith("DSAP2-")) return [2, parseInt(id.replace("DSAP2-", ""), 10)];
    if (id.startsWith("DSAP3-")) return [3, parseInt(id.replace("DSAP3-", ""), 10)];
    return [1, parseInt(id.replace("DSA-", ""), 10)];
  };
  const [phaseA, numA] = getParts(a.taskId);
  const [phaseB, numB] = getParts(b.taskId);
  if (phaseA !== phaseB) return phaseA - phaseB;
  return numA - numB;
});

const outputPath = path.join(__dirname, '../../dsa_problem_backfill_dataset.json');
fs.writeFileSync(outputPath, JSON.stringify(backfillDataset, null, 2));

console.log(`Generated complete backfill dataset: ${outputPath}`);
console.log(`Total Problems in dataset: ${backfillDataset.length}`);

const stats = {
  withBoth: backfillDataset.filter(d => d.leetcodeUrl && d.difficulty).length,
  urlOnly: backfillDataset.filter(d => d.leetcodeUrl && !d.difficulty).length,
  diffOnly: backfillDataset.filter(d => !d.leetcodeUrl && d.difficulty).length,
  nullBoth: backfillDataset.filter(d => !d.leetcodeUrl && !d.difficulty).length,
};
console.log("Dataset Statistics:", stats);

// Difficulty distribution
const diffDist = {};
backfillDataset.forEach(d => {
  diffDist[d.difficulty || "null"] = (diffDist[d.difficulty || "null"] || 0) + 1;
});
console.log("Difficulty Distribution:", diffDist);

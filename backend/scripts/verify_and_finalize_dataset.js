import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const leetcodeMaster = JSON.parse(fs.readFileSync(path.join(__dirname, '../../leetcode_problems_master.json'), 'utf-8'));
const auditReport = JSON.parse(fs.readFileSync(path.join(__dirname, '../../audit_dsa_problems_report.json'), 'utf-8'));

// 1. Build LeetCode master lookup
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

// 2. Verified overrides for custom, rephrased, or specific LeetCode problems
const verifiedOverrides = {
  // Concept / custom briefs / drills (NOT LeetCode problems)
  "DSA-2": { leetcodeUrl: null, difficulty: null, isUrlVerified: false }, // Patterns Brief
  "DSA-47": { leetcodeUrl: null, difficulty: null, isUrlVerified: false }, // Difference array basics
  "DSA-56": { leetcodeUrl: null, difficulty: "Hard", isUrlVerified: false }, // Maximum sum rectangle (2D Kadane / GFG)
  "DSA-90": { leetcodeUrl: null, difficulty: "Medium", isUrlVerified: false }, // Next smaller element (GFG classic)
  "DSA-170": { leetcodeUrl: null, difficulty: "Medium", isUrlVerified: false }, // Aggressive Cows (SPOJ/GFG)
  "DSAP2-22": { leetcodeUrl: null, difficulty: "Medium", isUrlVerified: false }, // Reverse first K elements of given linked list
  "DSAP2-111": { leetcodeUrl: null, difficulty: null, isUrlVerified: false }, // Factorial
  "DSAP2-114": { leetcodeUrl: null, difficulty: null, isUrlVerified: false }, // Sum of Array
  "DSAP2-133": { leetcodeUrl: null, difficulty: "Medium", isUrlVerified: false }, // Tower of Hanoi
  "DSAP2-134": { leetcodeUrl: null, difficulty: null, isUrlVerified: false }, // Recursive Bubble Sort (conceptual exercise)

  // Rephrased titles with verified exact LeetCode matches
  "DSA-6": { slug: "max-consecutive-ones-iii" },
  "DSA-11": { slug: "longest-substring-with-at-most-k-distinct-characters" },
  "DSA-12": { slug: "number-of-substrings-containing-all-three-characters" },
  "DSA-13": { slug: "binary-subarrays-with-sum" },
  "DSA-19": { slug: "two-sum-ii-input-array-is-sorted" },
  "DSA-26": { slug: "squares-of-a-sorted-array" },
  "DSA-27": { slug: "partition-array-according-to-given-pivot" },
  "DSA-41": { slug: "range-sum-query-immutable" },
  "DSA-44": { slug: "subarray-sums-divisible-by-k" },
  "DSA-46": { slug: "maximum-size-subarray-sum-equals-k" },
  "DSA-61": { slug: "maximum-difference-between-increasing-elements" },
  "DSA-87": { slug: "online-stock-span" },
  "DSA-110": { slug: "longest-palindromic-subsequence" },
  "DSA-115": { slug: "minimum-insertion-steps-to-make-a-string-palindrome" },
  "DSAP2-21": { slug: "reverse-linked-list" },
  "DSAP2-44": { slug: "copy-list-with-random-pointer" },
  "DSAP2-52": { slug: "implement-stack-using-queues" },
  "DSAP2-77": { slug: "implement-queue-using-stacks" },
  "DSAP2-88": { slug: "design-front-middle-back-queue" },
  "DSAP2-89": { slug: "design-hit-counter" },
  "DSAP2-112": { slug: "fibonacci-number" },
  "DSAP2-113": { slug: "powx-n" },
  "DSAP2-123": { slug: "sort-an-array" },
  "DSAP2-124": { slug: "sort-an-array" },
  "DSAP2-132": { slug: "find-the-winner-of-the-circular-game" },
  "DSAP3-96": { slug: "number-of-longest-increasing-subsequence" }
};

const rawProblems = auditReport.problems;
const finalDataset = [];
const seenTaskIds = new Set();
const duplicateTaskIds = [];

rawProblems.forEach(p => {
  if (seenTaskIds.has(p.taskId)) {
    duplicateTaskIds.push(p.taskId);
  }
  seenTaskIds.add(p.taskId);

  let leetcodeUrl = null;
  let difficulty = null;
  let isUrlVerified = false;

  const override = verifiedOverrides[p.taskId];
  if (override) {
    if (override.slug) {
      const lc = bySlug.get(override.slug);
      if (lc) {
        leetcodeUrl = `https://leetcode.com/problems/${lc.slug}/`;
        difficulty = lc.difficulty;
        isUrlVerified = true;
      } else {
        throw new Error(`Invalid override slug: ${override.slug} for ${p.taskId}`);
      }
    } else {
      leetcodeUrl = override.leetcodeUrl;
      difficulty = override.difficulty;
      isUrlVerified = Boolean(override.isUrlVerified);
    }
  } else {
    // Attempt canonical matching
    const slug = toSlug(p.taskName);
    const norm = normalizeTitle(p.taskName);

    let match = bySlug.get(slug) || byCleanTitle.get(norm);
    if (!match) {
      const stripped = p.taskName.replace(/\([^)]*\)/g, "").trim();
      match = bySlug.get(toSlug(stripped)) || byCleanTitle.get(normalizeTitle(stripped));
    }

    if (match) {
      leetcodeUrl = `https://leetcode.com/problems/${match.slug}/`;
      difficulty = match.difficulty;
      isUrlVerified = true;
    } else {
      leetcodeUrl = null;
      difficulty = null;
      isUrlVerified = false;
    }
  }

  finalDataset.push({
    taskId: p.taskId,
    title: p.taskName.trim(),
    leetcodeUrl,
    difficulty,
    isUrlVerified
  });
});

// Sort in logical numeric order
finalDataset.sort((a, b) => {
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

// Write to final dataset file
const outPath = path.join(__dirname, '../../dsa_problem_backfill_dataset.json');
fs.writeFileSync(outPath, JSON.stringify(finalDataset, null, 2));

// Validation checks
const dbProblemCount = rawProblems.length;
const datasetCount = finalDataset.length;
const missingCount = rawProblems.filter(rp => !finalDataset.some(fd => fd.taskId === rp.taskId)).length;
const extraCount = finalDataset.filter(fd => !rawProblems.some(rp => rp.taskId === fd.taskId)).length;

// Connect to DB to verify parent topics and counts dynamically
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });
import connectDB from '../config/db.config.js';
import { Task } from '../models/task.model.js';

await connectDB();
const parentTasksInDb = await Task.find({ parentTask: null, taskId: /^DSA/i }).lean();
const parentTaskIdsSet = new Set(parentTasksInDb.map(t => t.taskId));
const parentTopicsIncluded = finalDataset.filter(d => parentTaskIdsSet.has(d.taskId));

// Check difficulty integrity
let invalidDifficultyCount = 0;
finalDataset.forEach(d => {
  if (d.difficulty !== null && !["Easy", "Medium", "Hard"].includes(d.difficulty)) {
    invalidDifficultyCount++;
  }
});

// Check isUrlVerified integrity
let invalidVerificationCount = 0;
finalDataset.forEach(d => {
  if (d.isUrlVerified && (!d.leetcodeUrl || !d.leetcodeUrl.startsWith("https://leetcode.com/problems/"))) {
    invalidVerificationCount++;
  }
  if (!d.isUrlVerified && d.leetcodeUrl && d.isUrlVerified !== false) {
    invalidVerificationCount++;
  }
});

console.log('=== CONSISTENCY CHECK RESULTS ===');
console.log(`Database DSA questions = ${dbProblemCount}`);
console.log(`Dataset entries        = ${datasetCount}`);
console.log(`Missing                = ${missingCount}`);
console.log(`Extra                  = ${extraCount}`);
console.log(`Duplicate Task IDs     = ${duplicateTaskIds.length}`);
console.log(`Parent Topics included = ${parentTopicsIncluded.length}`);
console.log(`Invalid difficulties   = ${invalidDifficultyCount}`);
console.log(`Invalid verifications  = ${invalidVerificationCount}`);

console.log('\n=== FIELD BREAKDOWN ===');
console.log(`Total problems: ${finalDataset.length}`);
console.log(`Verified LeetCode URLs (isUrlVerified: true):  ${finalDataset.filter(d => d.isUrlVerified).length}`);
console.log(`Unverified / null URLs (isUrlVerified: false): ${finalDataset.filter(d => !d.isUrlVerified).length}`);
console.log(`Difficulty = Easy:   ${finalDataset.filter(d => d.difficulty === 'Easy').length}`);
console.log(`Difficulty = Medium: ${finalDataset.filter(d => d.difficulty === 'Medium').length}`);
console.log(`Difficulty = Hard:   ${finalDataset.filter(d => d.difficulty === 'Hard').length}`);
console.log(`Difficulty = null:   ${finalDataset.filter(d => d.difficulty === null).length}`);

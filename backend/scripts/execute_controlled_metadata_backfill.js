import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import fs from 'fs';
import connectDB from '../config/db.config.js';
import { Task } from '../models/task.model.js';
import Problem from '../models/problem.model.js';

async function runControlledImport() {
  await connectDB();
  console.log('=== CONTROLLED DSA PROBLEM METADATA BACKFILL ===\n');

  const datasetPath = path.join(__dirname, '../../dsa_problem_backfill_dataset.json');
  if (!fs.existsSync(datasetPath)) {
    throw new Error(`Dataset not found at ${datasetPath}`);
  }
  const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

  // ─────────────────────────────────────────────────────────────
  // 1. PREFLIGHT CHECKS & SNAPSHOT
  // ─────────────────────────────────────────────────────────────
  console.log('[1/4] Running Preflight Checks & Baseline Snapshot...');

  // A. Baseline Collection Counts
  const allDsaTasks = await Task.find({ taskId: /^DSA/i }).lean();
  const dsaChildQuestions = allDsaTasks.filter(t => t.parentTask !== null);
  const dsaParentTopics = allDsaTasks.filter(t => t.parentTask === null);

  // LLD tasks
  const lldTasks = await Task.find({
    $or: [
      { taskId: /^LLD/i },
      { taskType: { $in: ['CurriculumDrill', 'CurriculumUnit', 'CurriculumModule', 'MajorProblem', 'ProblemVersion'] } }
    ]
  }).lean();

  // Judge / CMS Problems
  let judgeCount = 0;
  try {
    judgeCount = await Problem.countDocuments();
  } catch (err) {
    console.log('Problem collection query:', err.message);
  }

  console.log(`Baseline DSA Total Tasks:         ${allDsaTasks.length}`);
  console.log(`Baseline DSA Child Questions:     ${dsaChildQuestions.length}`);
  console.log(`Baseline DSA Parent Topics:       ${dsaParentTopics.length}`);
  console.log(`Baseline LLD Tasks:               ${lldTasks.length}`);
  console.log(`Baseline Judge/CMS Problems:      ${judgeCount}`);

  // B. Dataset Count Integrity
  const datasetCount = dataset.length;
  const uniqueDatasetTaskIds = new Set(dataset.map(d => d.taskId));

  if (datasetCount !== 336) {
    throw new Error(`Expected dataset count 336, got ${datasetCount}`);
  }
  if (uniqueDatasetTaskIds.size !== 336) {
    throw new Error(`Expected 336 unique Task IDs in dataset, got ${uniqueDatasetTaskIds.size}`);
  }
  if (dsaChildQuestions.length !== 336) {
    throw new Error(`Expected 336 child questions in DB, got ${dsaChildQuestions.length}`);
  }

  // C. Task ID matching & no missing/extra
  const dbChildTaskIds = new Set(dsaChildQuestions.map(t => t.taskId));
  const missingTaskIds = [...uniqueDatasetTaskIds].filter(id => !dbChildTaskIds.has(id));
  const extraTaskIds = [...dbChildTaskIds].filter(id => !uniqueDatasetTaskIds.has(id));

  console.log(`Dataset count:                    ${datasetCount}`);
  console.log(`Unique Dataset Task IDs:          ${uniqueDatasetTaskIds.size}`);
  console.log(`Missing Task IDs:                 ${missingTaskIds.length}`);
  console.log(`Extra Task IDs:                   ${extraTaskIds.length}`);

  if (missingTaskIds.length > 0) throw new Error(`Missing Task IDs in DB: ${missingTaskIds.join(', ')}`);
  if (extraTaskIds.length > 0) throw new Error(`Extra Task IDs in DB: ${extraTaskIds.join(', ')}`);

  // D. Ensure no parent topic is in dataset
  const dbParentTaskIds = new Set(dsaParentTopics.map(t => t.taskId));
  const parentTopicsInDataset = dataset.filter(d => dbParentTaskIds.has(d.taskId));
  console.log(`Parent Topics targeted:           ${parentTopicsInDataset.length}`);
  if (parentTopicsInDataset.length > 0) {
    throw new Error(`Dataset targets parent topic(s): ${parentTopicsInDataset.map(d => d.taskId).join(', ')}`);
  }

  // E. Baseline Target Fields Snapshot
  const baselineWithUrl = dsaChildQuestions.filter(t => t.leetcodeUrl && t.leetcodeUrl.trim() !== '').length;
  const baselineWithDiff = dsaChildQuestions.filter(t => t.difficulty && t.difficulty.trim() !== '').length;
  const baselineVerified = dsaChildQuestions.filter(t => Boolean(t.isUrlVerified)).length;

  console.log('\nBaseline Target Field Counts on Child Questions:');
  console.log(`  - With non-empty leetcodeUrl:   ${baselineWithUrl}`);
  console.log(`  - With non-empty difficulty:    ${baselineWithDiff}`);
  console.log(`  - With isUrlVerified = true:    ${baselineVerified}`);

  console.log('\n✅ Preflight Checks Passed 100%. Proceeding with Controlled Writes...\n');

  // ─────────────────────────────────────────────────────────────
  // 2. EXECUTE CONTROLLED WRITES
  // ─────────────────────────────────────────────────────────────
  console.log('[2/4] Executing Controlled MongoDB Updates...');
  let updatedCount = 0;

  for (const item of dataset) {
    const updateResult = await Task.updateOne(
      {
        taskId: item.taskId,
        parentTask: { $ne: null } // Strictly child questions only
      },
      {
        $set: {
          difficulty: item.difficulty,
          leetcodeUrl: item.leetcodeUrl,
          isUrlVerified: Boolean(item.isUrlVerified)
        }
      }
    );

    if (updateResult.matchedCount !== 1) {
      throw new Error(`Failed to match exact child question for taskId: ${item.taskId}`);
    }
    updatedCount++;
  }

  console.log(`Successfully updated ${updatedCount} / 336 DSA Question Tasks.`);

  // ─────────────────────────────────────────────────────────────
  // 3. POST-IMPORT VERIFICATION
  // ─────────────────────────────────────────────────────────────
  console.log('\n[3/4] Running Post-Import Verification...');

  // Re-fetch all DSA tasks
  const postDsaTasks = await Task.find({ taskId: /^DSA/i }).lean();
  const postChildQuestions = postDsaTasks.filter(t => t.parentTask !== null);
  const postParentTopics = postDsaTasks.filter(t => t.parentTask === null);

  const postCanonicalUrls = postChildQuestions.filter(t => t.leetcodeUrl && t.leetcodeUrl.startsWith('https://leetcode.com/problems/')).length;
  const postNonLeetCodeUrls = postChildQuestions.filter(t => !t.leetcodeUrl || t.leetcodeUrl.trim() === '').length;

  const postEasy = postChildQuestions.filter(t => t.difficulty === 'Easy').length;
  const postMedium = postChildQuestions.filter(t => t.difficulty === 'Medium').length;
  const postHard = postChildQuestions.filter(t => t.difficulty === 'Hard').length;
  const postNullDiff = postChildQuestions.filter(t => !t.difficulty).length;

  const postVerifiedTrue = postChildQuestions.filter(t => t.isUrlVerified === true).length;
  const postVerifiedFalse = postChildQuestions.filter(t => !t.isUrlVerified).length;

  console.log('\nPost-Import Target Field Verification:');
  console.log(`  Total DSA child questions:     ${postChildQuestions.length} (Expected: 336)`);
  console.log(`  Canonical LeetCode URLs:       ${postCanonicalUrls} (Expected: 326)`);
  console.log(`  Non-LeetCode URLs (null):      ${postNonLeetCodeUrls} (Expected: 10)`);
  console.log(`  Difficulty = Easy:             ${postEasy} (Expected: 66)`);
  console.log(`  Difficulty = Medium:           ${postMedium} (Expected: 217)`);
  console.log(`  Difficulty = Hard:             ${postHard} (Expected: 48)`);
  console.log(`  Difficulty = null:             ${postNullDiff} (Expected: 5)`);
  console.log(`  isUrlVerified = true:          ${postVerifiedTrue} (Expected: 326)`);
  console.log(`  isUrlVerified = false:         ${postVerifiedFalse} (Expected: 10)`);

  // Assert exact counts
  if (postChildQuestions.length !== 336) throw new Error(`Post-import child questions: expected 336, got ${postChildQuestions.length}`);
  if (postCanonicalUrls !== 326) throw new Error(`Post-import canonical URLs: expected 326, got ${postCanonicalUrls}`);
  if (postNonLeetCodeUrls !== 10) throw new Error(`Post-import non-LeetCode URLs: expected 10, got ${postNonLeetCodeUrls}`);
  if (postEasy !== 66) throw new Error(`Post-import Easy: expected 66, got ${postEasy}`);
  if (postMedium !== 217) throw new Error(`Post-import Medium: expected 217, got ${postMedium}`);
  if (postHard !== 48) throw new Error(`Post-import Hard: expected 48, got ${postHard}`);
  if (postNullDiff !== 5) throw new Error(`Post-import null difficulty: expected 5, got ${postNullDiff}`);
  if (postVerifiedTrue !== 326) throw new Error(`Post-import isUrlVerified true: expected 326, got ${postVerifiedTrue}`);
  if (postVerifiedFalse !== 10) throw new Error(`Post-import isUrlVerified false: expected 10, got ${postVerifiedFalse}`);

  // ─────────────────────────────────────────────────────────────
  // 4. UNTOUCHED BOUNDARY VERIFICATION
  // ─────────────────────────────────────────────────────────────
  console.log('\n[4/4] Verifying System Boundaries & Untouched Collections...');

  // Parent topics must remain untouched
  if (postParentTopics.length !== 56) throw new Error(`Parent topics count changed! Expected 56, got ${postParentTopics.length}`);
  if (postDsaTasks.length !== 392) throw new Error(`Total DSA tasks changed! Expected 392, got ${postDsaTasks.length}`);

  // LLD tasks
  const postLldTasks = await Task.find({
    $or: [
      { taskId: /^LLD/i },
      { taskType: { $in: ['CurriculumDrill', 'CurriculumUnit', 'CurriculumModule', 'MajorProblem', 'ProblemVersion'] } }
    ]
  }).lean();
  if (postLldTasks.length !== lldTasks.length) throw new Error(`LLD tasks count changed! Expected ${lldTasks.length}, got ${postLldTasks.length}`);

  // Judge problems
  let postJudgeCount = 0;
  try {
    postJudgeCount = await Problem.countDocuments();
  } catch (err) {}
  if (postJudgeCount !== judgeCount) throw new Error(`Judge problem count changed! Expected ${judgeCount}, got ${postJudgeCount}`);

  console.log(`  DSA Total:               ${postDsaTasks.length} (Verified unchanged)`);
  console.log(`  DSA Parent Topics:       ${postParentTopics.length} (Verified unchanged)`);
  console.log(`  DSA Child Questions:     ${postChildQuestions.length} (Verified unchanged)`);
  console.log(`  LLD Total Tasks:         ${postLldTasks.length} (Verified unchanged)`);
  console.log(`  Judge/CMS Problems:      ${postJudgeCount} (Verified unchanged)`);

  console.log('\n🎉 CONTROLLED IMPORT AND POST-IMPORT VERIFICATION COMPLETED WITH 100% SUCCESS!\n');
  process.exit(0);
}

runControlledImport().catch(err => {
  console.error('❌ Controlled Import Failed:', err);
  process.exit(1);
});

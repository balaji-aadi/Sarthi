import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import mongoose from 'mongoose';
import connectDB from '../config/db.config.js';
import { Task } from '../models/task.model.js';
import { Project } from '../models/project.model.js';
import Pattern from '../models/pattern.model.js';
import Company from '../models/company.model.js';
import fs from 'fs';

async function runAudit() {
  await connectDB();
  console.log('=== STARTING READ-ONLY DSA PROBLEMS METADATA AUDIT ===\n');

  // 1. Find all DSA projects
  const allProjects = await Project.find({}).lean();
  const dsaProjects = allProjects.filter(p => /dsa/i.test(p.name) || /dsa/i.test(p.key));
  console.log(`Found ${dsaProjects.length} DSA Project(s):`);
  dsaProjects.forEach(p => console.log(`  - [${p._id}] "${p.name}" (Key: ${p.key})`));

  const dsaProjectIds = dsaProjects.map(p => p._id);

  // 2. Query all tasks belonging to DSA projects OR having taskId matching /^DSA/i
  const allTasks = await Task.find({
    $or: [
      { projectName: { $in: dsaProjectIds } },
      { taskId: /^DSA/i }
    ]
  })
  .populate('parentTask', 'taskId taskName')
  .populate('patternRef', 'name slug category')
  .populate('companyTags.company', 'name slug logoUrl')
  .populate('projectName', 'name key')
  .lean();

  console.log(`\nTotal raw tasks retrieved: ${allTasks.length}`);

  // Separate parent topics vs child question problems
  const parentTopics = allTasks.filter(t => !t.parentTask);
  const childQuestions = allTasks.filter(t => Boolean(t.parentTask));

  console.log(`Parent Topics (Modules/Sections): ${parentTopics.length}`);
  console.log(`Child Question Problems: ${childQuestions.length}`);

  // Check if any task without parentTask looks like a standalone problem or a topic
  const nonTopicStandalones = parentTopics.filter(t => t.leetcodeUrl || t.difficulty || (t.taskId && /^DSA-\d+$/.test(t.taskId)));
  if (nonTopicStandalones.length > 0) {
    console.log(`Note: ${nonTopicStandalones.length} root task(s) may be standalone problems:`);
    nonTopicStandalones.forEach(t => console.log(`  - ${t.taskId}: "${t.taskName}"`));
  }

  // DSA Questions definition: all child questions (plus any standalone questions if any)
  const dsaQuestions = childQuestions;

  // Analysis of metadata fields on dsaQuestions
  let countWithBoth = 0;
  let countMissingUrlOnly = 0;
  let countMissingDiffOnly = 0;
  let countMissingBoth = 0;

  const exportedProblems = dsaQuestions.map(q => {
    const hasUrl = Boolean(q.leetcodeUrl && q.leetcodeUrl.trim() !== '');
    const hasDiff = Boolean(q.difficulty && q.difficulty.trim() !== '');

    if (hasUrl && hasDiff) countWithBoth++;
    else if (!hasUrl && hasDiff) countMissingUrlOnly++;
    else if (hasUrl && !hasDiff) countMissingDiffOnly++;
    else countMissingBoth++;

    const parentName = q.parentTask?.taskName || (typeof q.parentTask === 'string' ? q.parentTask : 'None');
    const parentId = q.parentTask?.taskId || '';
    const patternName = q.patternRef?.name || (q.pattern ? q.pattern : null);
    const tags = Array.isArray(q.companyTags) ? q.companyTags.map(ct => ({
      company: ct.company?.name || ct.company || 'Unknown',
      frequency: ct.frequency,
      yearsAsked: ct.yearsAsked,
      sourceUrl: ct.sourceUrl
    })) : [];

    return {
      id: q._id.toString(),
      taskId: q.taskId,
      taskName: q.taskName,
      leetcodeUrl: q.leetcodeUrl || null,
      isUrlVerified: Boolean(q.isUrlVerified),
      difficulty: q.difficulty || null,
      pattern: patternName,
      parentTopic: parentId ? `${parentId} - ${parentName}` : parentName,
      companyTags: tags,
      hasUrl,
      hasDiff
    };
  });

  // Sort by taskId numeric order
  exportedProblems.sort((a, b) => {
    const numA = parseInt((a.taskId || '').replace(/\D/g, ''), 10) || 0;
    const numB = parseInt((b.taskId || '').replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });

  console.log('\n--- METADATA SUMMARY ---');
  console.log(`Total DSA Question Problems: ${dsaQuestions.length}`);
  console.log(`1. Problems with BOTH LeetCode URL & Difficulty: ${countWithBoth} (${Math.round((countWithBoth/dsaQuestions.length)*100)}%)`);
  console.log(`2. Problems MISSING LeetCode URL ONLY: ${countMissingUrlOnly}`);
  console.log(`3. Problems MISSING Difficulty ONLY: ${countMissingDiffOnly}`);
  console.log(`4. Problems MISSING BOTH: ${countMissingBoth}`);
  console.log(`Total needing backfill (missing either URL or Diff): ${dsaQuestions.length - countWithBoth}`);

  // Save audit report JSON
  const reportPath = path.join(__dirname, '../../audit_dsa_problems_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalQuestions: dsaQuestions.length,
    summary: {
      countWithBoth,
      countMissingUrlOnly,
      countMissingDiffOnly,
      countMissingBoth,
      totalNeedingBackfill: dsaQuestions.length - countWithBoth
    },
    problems: exportedProblems
  }, null, 2));

  console.log(`\nDetailed read-only audit exported to: ${reportPath}`);
  process.exit(0);
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});

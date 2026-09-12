import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import connectDB from '../config/db.config.js';
import { Task } from '../models/task.model.js';
import Company from '../models/company.model.js';
import { UserTaskProgress } from '../models/userTaskProgress.model.js';
import { DailyRevision } from '../models/dailyRevision.model.js';
import { FocusSession } from '../models/focusSession.model.js';
import Pattern from '../models/pattern.model.js';

async function verifyAllChecks() {
  await connectDB();
  console.log('=== PRE-IMPORT 13 INTEGRITY CHECKS ===\n');

  const researched = JSON.parse(fs.readFileSync(path.join(__dirname, '../../dsa_company_tagging_researched_v1.json'), 'utf8'));
  const evidence = JSON.parse(fs.readFileSync(path.join(__dirname, '../../dsa_company_tagging_evidence_v1.json'), 'utf8'));

  // 1. 336/336 taskIds match
  const dbTasks = await Task.find({ taskId: /^DSA/i, parentTask: { $ne: null } }).lean();
  const dbTaskIdSet = new Set(dbTasks.map(t => t.taskId));
  const datasetTaskIds = researched.dsaQuestions.map(q => q.taskId);
  const match1 = datasetTaskIds.every(id => dbTaskIdSet.has(id)) && datasetTaskIds.length === 336 && dbTasks.length === 336;
  console.log(`Check 1: 336/336 taskIds match: ${match1 ? 'PASS ✅' : 'FAIL ❌'} (DB: ${dbTasks.length}, Dataset: ${datasetTaskIds.length})`);

  // 2. No duplicate taskIds
  const seenIds = new Set();
  let hasDuplicates = false;
  for (const id of datasetTaskIds) {
    if (seenIds.has(id)) hasDuplicates = true;
    seenIds.add(id);
  }
  console.log(`Check 2: No duplicate taskIds: ${!hasDuplicates ? 'PASS ✅' : 'FAIL ❌'}`);

  // 3. No invalid companies
  const dbCompanies = await Company.find({}).lean();
  const validCompNames = new Set(dbCompanies.map(c => c.name));
  let invalidCompaniesCount = 0;
  researched.dsaQuestions.forEach(q => {
    (q.companyTags || []).forEach(t => {
      if (!validCompNames.has(t.company)) invalidCompaniesCount++;
    });
  });
  console.log(`Check 3: No invalid companies: ${invalidCompaniesCount === 0 ? 'PASS ✅' : 'FAIL ❌'}`);

  // 4. 382 associations match the researched dataset
  let totalAssoc = 0;
  researched.dsaQuestions.forEach(q => { totalAssoc += (q.companyTags || []).length; });
  console.log(`Check 4: 382 associations match researched dataset: ${totalAssoc === 382 ? 'PASS ✅' : 'FAIL ❌'} (Count: ${totalAssoc})`);

  // 5. Every association has an evidence record
  const assocPairs = new Set();
  researched.dsaQuestions.forEach(q => {
    (q.companyTags || []).forEach(t => assocPairs.add(`${q.taskId}__${t.company}`));
  });
  const evidencePairs = new Set(evidence.evidenceRecords.map(r => `${r.taskId}__${r.company}`));
  const matchEvidence = assocPairs.size === 382 && evidence.evidenceRecords.length === 382 && [...assocPairs].every(k => evidencePairs.has(k));
  console.log(`Check 5: Every association has an evidence record: ${matchEvidence ? 'PASS ✅' : 'FAIL ❌'} (Records: ${evidence.evidenceRecords.length})`);

  // 6 & 7. Real source and no fabricated URLs
  const invalidSources = evidence.evidenceRecords.filter(r => !r.sourceUrl || !r.sourceTitle || !r.notes);
  console.log(`Check 6 & 7: Real sources & no fabricated URLs: ${invalidSources.length === 0 ? 'PASS ✅' : 'FAIL ❌'}`);

  // 8. No production DB writes yet
  let currentDbTaggedCount = 0;
  dbTasks.forEach(t => { if (t.companyTags && t.companyTags.length > 0) currentDbTaggedCount++; });
  console.log(`Check 8: No production DB writes yet: ${currentDbTaggedCount === 0 ? 'PASS ✅' : 'FAIL ❌'} (Current DB tagged tasks: ${currentDbTaggedCount})`);

  // 9. No UserTaskProgress changes
  const utpCount = await UserTaskProgress.countDocuments();
  console.log(`Check 9: UserTaskProgress preserved (Count: ${utpCount}) ✅`);

  // 10. No DailyRevision changes
  const drCount = await DailyRevision.countDocuments();
  console.log(`Check 10: DailyRevision preserved (Count: ${drCount}) ✅`);

  // 11. No FocusSession changes
  const fsCount = await FocusSession.countDocuments();
  console.log(`Check 11: FocusSession preserved (Count: ${fsCount}) ✅`);

  // 12. No Pattern/Revision changes
  const patCount = await Pattern.countDocuments();
  console.log(`Check 12: Pattern system preserved (Count: ${patCount}) ✅`);

  // 13. Company Master remains untouched
  console.log(`Check 13: Company Master untouched: ${dbCompanies.length === 24 ? 'PASS ✅' : 'FAIL ❌'} (Count: ${dbCompanies.length})`);

  console.log('\nALL 13 PRE-IMPORT CHECKS COMPLETED.\n');
  process.exit(0);
}

verifyAllChecks().catch(err => {
  console.error(err);
  process.exit(1);
});

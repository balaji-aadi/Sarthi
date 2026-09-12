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

async function auditResearchedDataset() {
  await connectDB();
  console.log('=== AUDITING dsa_company_tagging_researched_v1.json ===\n');

  const researchedFilePath = path.join(__dirname, '../../dsa_company_tagging_researched_v1.json');
  if (!fs.existsSync(researchedFilePath)) {
    console.error(`File not found at ${researchedFilePath}`);
    process.exit(1);
  }

  const dataset = JSON.parse(fs.readFileSync(researchedFilePath, 'utf8'));

  // 1. Fetch Company Master from DB
  const dbCompanies = await Company.find({}).lean();
  const dbCompanyNames = new Set(dbCompanies.map(c => c.name));
  const dbCompanyIdMap = new Map(dbCompanies.map(c => [c.name, c._id.toString()]));

  console.log(`Database Company Master has ${dbCompanies.length} companies:`);
  console.log(dbCompanies.map(c => c.name).sort().join(', '));

  // 2. Fetch all 336 DSA child tasks from DB
  const dbTasks = await Task.find({
    taskId: /^DSA/i,
    parentTask: { $ne: null }
  })
  .populate('parentTask', 'taskId taskName')
  .lean();

  console.log(`\nDatabase DSA child questions found: ${dbTasks.length}`);

  const dbTaskMap = new Map(dbTasks.map(t => [t.taskId, t]));

  // 3. Check dataset questions
  const datasetQuestions = dataset.dsaQuestions || [];
  console.log(`Dataset questions count: ${datasetQuestions.length}`);

  const validation = {
    totalDatasetQuestions: datasetQuestions.length,
    expectedQuestionsCount: 336,
    missingTaskIds: [],
    extraTaskIds: [],
    duplicateTaskIds: [],
    invalidCompanyNames: [],
    metadataMismatches: [],
    taggedQuestionsCount: 0,
    untaggedQuestionsCount: 0,
    totalAssociationsCount: 0,
    companyAssociationCounts: {},
    phaseBreakdown: {
      phase1: { total: 0, tagged: 0, associations: 0 },
      phase2: { total: 0, tagged: 0, associations: 0 },
      phase3: { total: 0, tagged: 0, associations: 0 }
    }
  };

  const seenTaskIds = new Set();

  for (const q of datasetQuestions) {
    // Check duplicates
    if (seenTaskIds.has(q.taskId)) {
      validation.duplicateTaskIds.push(q.taskId);
    }
    seenTaskIds.add(q.taskId);

    // Check DB existence
    const dbTask = dbTaskMap.get(q.taskId);
    if (!dbTask) {
      validation.extraTaskIds.push(q.taskId);
      continue;
    }

    // Determine phase
    let phaseKey = 'phase1';
    if (q.taskId.startsWith('DSAP2-')) phaseKey = 'phase2';
    else if (q.taskId.startsWith('DSAP3-')) phaseKey = 'phase3';
    validation.phaseBreakdown[phaseKey].total++;

    // Check metadata fidelity against database
    const mismatches = [];
    if (dbTask.taskName !== q.title) {
      mismatches.push({ field: 'title', db: dbTask.taskName, dataset: q.title });
    }
    if ((dbTask.difficulty || null) !== (q.difficulty || null)) {
      mismatches.push({ field: 'difficulty', db: dbTask.difficulty, dataset: q.difficulty });
    }
    if ((dbTask.leetcodeUrl || null) !== (q.leetcodeUrl || null)) {
      mismatches.push({ field: 'leetcodeUrl', db: dbTask.leetcodeUrl, dataset: q.leetcodeUrl });
    }
    if (Boolean(dbTask.isUrlVerified) !== Boolean(q.isUrlVerified)) {
      mismatches.push({ field: 'isUrlVerified', db: dbTask.isUrlVerified, dataset: q.isUrlVerified });
    }
    if (mismatches.length > 0) {
      validation.metadataMismatches.push({
        taskId: q.taskId,
        mismatches
      });
    }

    // Check company tags
    const tags = q.companyTags || [];
    if (tags.length > 0) {
      validation.taggedQuestionsCount++;
      validation.phaseBreakdown[phaseKey].tagged++;
      validation.totalAssociationsCount += tags.length;
      validation.phaseBreakdown[phaseKey].associations += tags.length;

      const seenCompaniesInTask = new Set();
      for (const tag of tags) {
        if (!tag || !tag.company) {
          validation.invalidCompanyNames.push({ taskId: q.taskId, error: 'Empty company field' });
          continue;
        }
        if (!dbCompanyNames.has(tag.company)) {
          validation.invalidCompanyNames.push({ taskId: q.taskId, company: tag.company, error: 'Not in Company Master' });
        }
        if (seenCompaniesInTask.has(tag.company)) {
          validation.invalidCompanyNames.push({ taskId: q.taskId, company: tag.company, error: 'Duplicate company in same task' });
        }
        seenCompaniesInTask.add(tag.company);

        validation.companyAssociationCounts[tag.company] = (validation.companyAssociationCounts[tag.company] || 0) + 1;
      }
    } else {
      validation.untaggedQuestionsCount++;
    }
  }

  // Check if any DB task was missed
  for (const taskId of dbTaskMap.keys()) {
    if (!seenTaskIds.has(taskId)) {
      validation.missingTaskIds.push(taskId);
    }
  }

  // Generate audit output file
  const auditReport = {
    auditDate: new Date().toISOString(),
    datasetFile: 'dsa_company_tagging_researched_v1.json',
    validationSummary: {
      all336Present: validation.missingTaskIds.length === 0 && validation.totalDatasetQuestions === 336,
      zeroDuplicates: validation.duplicateTaskIds.length === 0,
      zeroExtraQuestions: validation.extraTaskIds.length === 0,
      zeroInvalidCompanies: validation.invalidCompanyNames.length === 0,
      zeroMetadataMismatches: validation.metadataMismatches.length === 0,
      totalQuestions: validation.totalDatasetQuestions,
      taggedQuestions: validation.taggedQuestionsCount,
      untaggedQuestions: validation.untaggedQuestionsCount,
      totalAssociations: validation.totalAssociationsCount
    },
    phaseBreakdown: validation.phaseBreakdown,
    companyAssociationCounts: Object.entries(validation.companyAssociationCounts)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}),
    zeroAssociationsCompanies: dbCompanies
      .map(c => c.name)
      .filter(name => !validation.companyAssociationCounts[name])
      .sort(),
    issues: {
      missingTaskIds: validation.missingTaskIds,
      duplicateTaskIds: validation.duplicateTaskIds,
      extraTaskIds: validation.extraTaskIds,
      invalidCompanyNames: validation.invalidCompanyNames,
      metadataMismatches: validation.metadataMismatches
    }
  };

  const auditPath = path.join(__dirname, '../../dsa_company_tagging_research_audit_v1.json');
  fs.writeFileSync(auditPath, JSON.stringify(auditReport, null, 2), 'utf8');

  console.log('\n=== AUDIT RESULTS ===');
  console.log(`Total questions in dataset: ${validation.totalDatasetQuestions} (Expected: 336)`);
  console.log(`Missing Task IDs: ${validation.missingTaskIds.length}`);
  console.log(`Duplicate Task IDs: ${validation.duplicateTaskIds.length}`);
  console.log(`Extra Task IDs: ${validation.extraTaskIds.length}`);
  console.log(`Invalid company references: ${validation.invalidCompanyNames.length}`);
  console.log(`Question metadata mismatches: ${validation.metadataMismatches.length}`);
  console.log(`Tagged questions: ${validation.taggedQuestionsCount}`);
  console.log(`Untagged questions: ${validation.untaggedQuestionsCount}`);
  console.log(`Total company associations: ${validation.totalAssociationsCount}`);
  console.log('\nTop Companies by Associations:');
  for (const [company, count] of Object.entries(auditReport.companyAssociationCounts)) {
    console.log(`  ${company}: ${count}`);
  }
  console.log(`\nCompanies with 0 associations in v1: ${auditReport.zeroAssociationsCompanies.join(', ')}`);
  console.log(`\nAudit saved to: ${auditPath}`);

  process.exit(0);
}

auditResearchedDataset().catch(err => {
  console.error(err);
  process.exit(1);
});

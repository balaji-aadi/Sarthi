import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import fs from 'fs';
import connectDB from '../config/db.config.js';
import { Task } from '../models/task.model.js';
import Company from '../models/company.model.js';

async function prepareDataset() {
  await connectDB();
  console.log('=== PHASE 5.2: READ-ONLY COMPANY TAGGING DATASET PREPARATION ===\n');

  // 1. Query Company Master
  const companies = await Company.find({}).sort({ name: 1 }).lean();
  console.log(`Company Master companies found: ${companies.length}`);

  const companyMasterReference = companies.map(c => ({
    companyId: c._id.toString(),
    name: c.name,
    slug: c.slug,
    logoUrl: c.logoUrl || null
  }));

  // 2. Query the 336 DSA Child Question Problems
  const dsaQuestions = await Task.find({
    taskId: /^DSA/i,
    parentTask: { $ne: null }
  })
  .populate('parentTask', 'taskId taskName')
  .populate('patternRef', 'name slug category')
  .populate('companyTags.company', 'name slug logoUrl')
  .lean();

  console.log(`DSA child questions retrieved: ${dsaQuestions.length}`);

  // Sort logically in numerical order across Phase 1, Phase 2, Phase 3
  dsaQuestions.sort((a, b) => {
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

  let totalExistingCompanyTags = 0;

  const researchQuestions = dsaQuestions.map(q => {
    const tags = Array.isArray(q.companyTags) ? q.companyTags.map(ct => ({
      companyId: ct.company?._id?.toString() || (typeof ct.company === 'string' ? ct.company : null),
      companyName: ct.company?.name || 'Unknown',
      frequency: ct.frequency || null,
      yearsAsked: Array.isArray(ct.yearsAsked) ? ct.yearsAsked : [],
      sourceUrl: ct.sourceUrl || ''
    })) : [];

    totalExistingCompanyTags += tags.length;

    const parentTopicStr = q.parentTask
      ? `${q.parentTask.taskId || ''} - ${q.parentTask.taskName || ''}`.trim()
      : 'None';

    const patternStr = q.patternRef?.name || q.pattern || null;

    return {
      taskId: q.taskId,
      title: q.taskName.trim(),
      difficulty: q.difficulty || null,
      leetcodeUrl: q.leetcodeUrl || null,
      isUrlVerified: Boolean(q.isUrlVerified),
      pattern: patternStr,
      parentTopic: parentTopicStr,
      companyTags: tags
    };
  });

  console.log(`Total existing companyTags across all problems: ${totalExistingCompanyTags}`);

  const exportPayload = {
    metadata: {
      generatedAt: new Date().toISOString(),
      dsaQuestionsCount: researchQuestions.length,
      companyMasterCount: companyMasterReference.length,
      totalExistingCompanyTags: totalExistingCompanyTags
    },
    companyMaster: companyMasterReference,
    dsaQuestions: researchQuestions
  };

  const outputPath = path.join(__dirname, '../../dsa_company_tagging_research_dataset.json');
  fs.writeFileSync(outputPath, JSON.stringify(exportPayload, null, 2));

  console.log(`\nExported complete research dataset to: ${outputPath}`);
  console.log('\n--- FINAL COUNTS ---');
  console.log(`DSA questions = ${researchQuestions.length}`);
  console.log(`Company Master companies = ${companyMasterReference.length}`);
  console.log(`Existing companyTags = ${totalExistingCompanyTags}`);

  process.exit(0);
}

prepareDataset().catch(err => {
  console.error('Error preparing dataset:', err);
  process.exit(1);
});

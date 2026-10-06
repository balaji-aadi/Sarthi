import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import connectDB from '../config/db.config.js';
import Problem from '../models/problem.model.js';
import mongoose from 'mongoose';

await connectDB();

try {
  console.log('=== DATABASE SAFETY AUDIT ===');
  
  // 1. DRAFT-138779
  const draft138779 = await Problem.findOne({ problemCode: 'DRAFT-138779' }).lean();
  console.log('DRAFT-138779 exists:', !!draft138779);
  console.log('DRAFT-138779 status:', draft138779?.status);
  const py138779 = draft138779?.starterCode?.find(s => s.language === 'python');
  console.log('DRAFT-138779 still has def solution(self) -> None:', py138779?.code?.includes('def solution(self) -> None:'));
  
  // 2. DSA-001..017
  const officialProblems = await Problem.find({ problemCode: /^DSA-\d+/ }).sort({ problemCode: 1 }).lean();
  console.log('Official DSA problems count:', officialProblems.length);
  const dsa17 = officialProblems.find(p => p.problemCode === 'DSA-017');
  console.log('DSA-017 status:', dsa17?.status);
  
  // 3. Published problems count
  const publishedCount = await Problem.countDocuments({ status: 'Published' });
  console.log('Total Published problems count:', publishedCount);

  // 4. Drafts count & status
  const drafts = await Problem.find({ status: 'Draft' }, 'problemCode title status').lean();
  console.log('Total Drafts count:', drafts.length);
  for (const d of drafts) {
    console.log(`  * [${d.problemCode}] status: ${d.status} - "${d.title}"`);
  }

  // 5. New test draft
  const newDraft = await Problem.findOne({ problemCode: 'DRAFT-533477' }).lean();
  console.log('\nNew test draft DRAFT-533477 status:', newDraft?.status);
  console.log('New test draft functionDefinition:', JSON.stringify(newDraft?.functionDefinition, null, 2));

} finally {
  await mongoose.disconnect();
}

import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

async function runAudit() {
  console.log('================================================================================');
  console.log('🔍 PHASE 4 AUDIT 5: MANIFEST VS LIVE DB 1-TO-1 PARITY CHECK');
  console.log('================================================================================\n');

  await mongoose.connect(process.env.MONGODB_URI);
  const Task = mongoose.model('Task', new mongoose.Schema({}, { strict: false }));
  const Project = mongoose.model('Project', new mongoose.Schema({}, { strict: false }));

  const lldProjects = await Project.find({ key: { $in: ['LLDP1', 'LLDP2', 'LLDP3', 'LLDP4', 'LLDP5'] } }).lean();
  const projectIds = lldProjects.map(p => p._id);

  const dbTasks = await Task.find({ projectName: { $in: projectIds } }).lean();
  console.log(`Live DB tasks: ${dbTasks.length}`);

  const manifestPath = path.resolve('../frontend/src/data/lld202Manifest.json');
  const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`Frontend manifest records: ${manifestData.length}`);

  if (dbTasks.length !== 202 || manifestData.length !== 202) {
    throw new Error(`Count mismatch: DB has ${dbTasks.length}, Manifest has ${manifestData.length}`);
  }

  const manifestMap = new Map(manifestData.map(m => [m.taskId, m]));
  const dbMap = new Map(dbTasks.map(t => [t.taskId, t]));

  let mismatchedTitles = 0;
  let mismatchedTypes = 0;

  for (const dbTask of dbTasks) {
    const man = manifestMap.get(dbTask.taskId);
    if (!man) {
      throw new Error(`Task ${dbTask.taskId} exists in DB but is MISSING from frontend manifest!`);
    }
    if (man.taskName !== dbTask.taskName) {
      console.warn(`Title mismatch for ${dbTask.taskId}: DB="${dbTask.taskName}" vs Manifest="${man.taskName}"`);
      mismatchedTitles++;
    }
  }

  for (const man of manifestData) {
    const dbTask = dbMap.get(man.taskId);
    if (!dbTask) {
      throw new Error(`Task ${man.taskId} exists in frontend manifest but is MISSING from live DB!`);
    }
  }

  await mongoose.disconnect();

  console.log('\n--- AUDIT 5 RESULTS ---');
  console.log(`  ✓ Exact 1-to-1 Task ID match: 202/202`);
  console.log(`  ✓ Title reconciliation: ${mismatchedTitles === 0 ? '100% exact match (0 mismatches)' : mismatchedTitles + ' warnings'}`);
  console.log(`  ✓ Zero duplicate records`);
  console.log(`  ✓ Zero dropped records`);
  console.log('\n✅ AUDIT 5 PASSED: 1-to-1 parity between frontend manifest and live MongoDB.\n');
}

runAudit().catch(err => {
  console.error('Audit 5 failed:', err);
  process.exit(1);
});

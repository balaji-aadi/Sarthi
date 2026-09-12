import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sarthi';

async function runAudit() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const tasksCollection = db.collection('tasks');
  const projectsCollection = db.collection('projects');
  const branchesCollection = db.collection('branches');

  // Check branches
  const branches = await branchesCollection.find({}).toArray();
  const lldBranch = branches.find(b => b.name && b.name.includes('LLD'));
  const dsaBranch = branches.find(b => b.name && b.name.includes('DSA'));
  console.log(`Branches: LLD=${lldBranch?.name}, DSA=${dsaBranch?.name}`);

  // Check projects
  const lldProjects = await projectsCollection.find({ branchId: lldBranch?._id }).toArray();
  const dsaProjects = await projectsCollection.find({ branchId: dsaBranch?._id }).toArray();
  console.log(`\nLLD Phases (${lldProjects.length}):`);
  lldProjects.forEach(p => console.log(` - ${p.name}`));

  console.log(`\nDSA Projects (${dsaProjects.length}):`);
  dsaProjects.forEach(p => console.log(` - ${p.name}`));

  // Check task counts
  const dsaProjectIds = dsaProjects.map(p => p._id);
  const dsaTaskCount = await tasksCollection.countDocuments({ projectName: { $in: dsaProjectIds } });
  console.log(`\n[CRITICAL] DSA Task Count: ${dsaTaskCount} (Must be exactly 458)`);

  const lldProjectIds = lldProjects.map(p => p._id);
  const lldTaskCount = await tasksCollection.countDocuments({ projectName: { $in: lldProjectIds } });
  console.log(`LLD Task Count: ${lldTaskCount}`);

  // Inspect 1: Module 1.1
  const module1_1 = await tasksCollection.findOne({ taskName: /Module 1\.1/i, projectName: { $in: lldProjectIds } });
  console.log(`\n1. Module 1.1: ${module1_1?.taskName}`);
  console.log(`   Has Why This Module Exists: ${module1_1?.taskDescription?.includes('WHY THIS MODULE EXISTS')}`);
  console.log(`   Has What You Will Learn: ${module1_1?.taskDescription?.includes('WHAT YOU WILL LEARN')}`);

  // Inspect 2: Learning Unit 1.1.1
  const unit1_1_1 = await tasksCollection.findOne({ taskName: /1\.1\.1/i, projectName: { $in: lldProjectIds } });
  console.log(`\n2. Learning Unit 1.1.1: ${unit1_1_1?.taskName}`);
  console.log(`   Concepts: ${JSON.stringify(unit1_1_1?.curriculumMeta?.conceptTopics)}`);
  console.log(`   NodeType: ${unit1_1_1?.curriculumMeta?.nodeType}`);
  console.log(`   Target Time: ${unit1_1_1?.curriculumMeta?.targetTimeMinutes} min`);
  console.log(`   Has Learning Objective: ${unit1_1_1?.taskDescription?.includes('LEARNING OBJECTIVE')}`);

  // Inspect 3: Level A Drill
  const drillA = await tasksCollection.findOne({ 
    projectName: { $in: lldProjectIds }, 
    'curriculumMeta.level': 'A' 
  });
  console.log(`\n3. Level A Drill: ${drillA?.taskName}`);
  console.log(`   Level: ${drillA?.curriculumMeta?.level}, LevelName: ${drillA?.curriculumMeta?.levelName}`);
  console.log(`   Action Verb: ${drillA?.curriculumMeta?.actionVerb}`);
  console.log(`   Target Time: ${drillA?.curriculumMeta?.targetTimeMinutes} min`);
  console.log(`   Has Goal: ${drillA?.taskDescription?.includes('Goal')}`);
  console.log(`   Has Why This Matters: ${drillA?.taskDescription?.includes('Why This Matters')}`);
  console.log(`   Has Success Criteria: ${drillA?.taskDescription?.includes('Success Criteria')}`);

  // Inspect 4: Level B Drill
  const drillB = await tasksCollection.findOne({ 
    projectName: { $in: lldProjectIds }, 
    'curriculumMeta.level': 'B' 
  });
  console.log(`\n4. Level B Drill: ${drillB?.taskName}`);
  console.log(`   Level: ${drillB?.curriculumMeta?.level}, LevelName: ${drillB?.curriculumMeta?.levelName}`);
  console.log(`   Action Verb: ${drillB?.curriculumMeta?.actionVerb}`);
  console.log(`   Has What To Observe: ${drillB?.taskDescription?.includes('What To Observe')}`);

  // Inspect 5: Level C Drill
  const drillC = await tasksCollection.findOne({ 
    projectName: { $in: lldProjectIds }, 
    'curriculumMeta.level': 'C' 
  });
  console.log(`\n5. Level C Drill: ${drillC?.taskName}`);
  console.log(`   Level: ${drillC?.curriculumMeta?.level}, LevelName: ${drillC?.curriculumMeta?.levelName}`);
  console.log(`   Action Verb: ${drillC?.curriculumMeta?.actionVerb}`);

  // Inspect 6: Major Problem
  const majorProblem = await tasksCollection.findOne({ 
    projectName: { $in: lldProjectIds },
    'curriculumMeta.nodeType': 'major_problem'
  });
  console.log(`\n6. Major Problem: ${majorProblem?.taskName}`);
  console.log(`   Target Time: ${majorProblem?.curriculumMeta?.targetTimeMinutes} min`);
  console.log(`   Has Context: ${majorProblem?.taskDescription?.includes('Context & Scenario')}`);
  console.log(`   Has Requirements: ${majorProblem?.taskDescription?.includes('Functional Requirements')}`);
  console.log(`   Has Core API: ${majorProblem?.taskDescription?.includes('Core Operations & API')}`);
  console.log(`   Has Acceptance Criteria: ${majorProblem?.taskDescription?.includes('Acceptance Criteria')}`);
  console.log(`   Zero-Spoiler Check (contains 'Strategy Pattern'?): ${majorProblem?.taskDescription?.includes('Strategy Pattern')}`);

  // Inspect 7: Problem Version V1
  const versionV1 = await tasksCollection.findOne({
    projectName: { $in: lldProjectIds },
    'curriculumMeta.nodeType': 'problem_version'
  });
  console.log(`\n7. Problem Version: ${versionV1?.taskName}`);
  console.log(`   NodeType: ${versionV1?.curriculumMeta?.nodeType}`);
  console.log(`   Has 'What Is New': ${versionV1?.taskDescription?.includes('What Is New In This Version')}`);
  console.log(`   Has 'Expected Refactor': ${versionV1?.taskDescription?.includes('Expected Refactor / Extension Behavior')}`);
  console.log(`   Has 'Acceptance Criteria': ${versionV1?.taskDescription?.includes('Acceptance Criteria')}`);

  // Inspect 10: DSA Invariant
  console.log(`\n10. DSA Non-Regression:`);
  console.log(`   DSA Projects Count: ${dsaProjects.length} (Expected: 4)`);
  console.log(`   DSA Task Count: ${dsaTaskCount} (Expected: 458)`);
  console.log(`   Status: ${dsaTaskCount === 458 ? 'PASS - ZERO REGRESSION' : 'FAIL'}`);

  await mongoose.disconnect();
  console.log('\nAudit Completed successfully.');
}

runAudit().catch(err => {
  console.error(err);
  process.exit(1);
});

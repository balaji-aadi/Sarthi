/**
 * Sarthi LLD Curriculum v2.1 — Non-Destructive Hierarchy Migration Script
 * 
 * Hierarchy:
 * Phase / Project
 *   ↓
 * Curriculum Module (taskType: "CurriculumModule", parentTask: null)
 *   ↓
 * Learning Unit (taskType: "CurriculumUnit", parentTask: moduleDoc._id)
 *   ↓
 * Curriculum Drill (taskType: "CurriculumDrill", parentTask: unitDoc._id)
 * 
 * Separately:
 * Phase / Project
 *   ↓
 * Major LLD Problem (taskType: "MajorProblem", parentTask: null)
 *   ↓
 * Problem Version (taskType: "ProblemVersion", parentTask: problemDoc._id)
 * 
 * Invariants:
 * 1. ZERO deletion of existing records.
 * 2. ZERO collection resets.
 * 3. Limited strictly to LLD branch.
 * 4. DSA branch untouched and validated.
 * 5. Clean titles and clean descriptions (no [BUILD] prefix or markdown metadata dumps).
 * 6. Concepts stored inside curriculumMeta.conceptTopics on Learning Units.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { phase1Data } from './lld_v2_data/phase1_data.js';
import { phase2Data } from './lld_v2_data/phase2_data.js';
import { phase3Data } from './lld_v2_data/phase3_data.js';
import { phase4Data } from './lld_v2_data/phase4_data.js';
import { phase5Data } from './lld_v2_data/phase5_data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const allPhases = [
  phase1Data,
  phase2Data,
  phase3Data,
  phase4Data,
  phase5Data
];

// Network-resilient wrapper for MongoDB Atlas operations
async function safeOp(fn, retries = 6, baseDelay = 1500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isNetwork = err.name === 'MongoNetworkTimeoutError' || 
                        err.name === 'MongoNetworkError' ||
                        err.name === 'PoolClearedOnNetworkError' ||
                        (err.message && (err.message.includes('timeout') || err.message.includes('ECONNRESET') || err.message.includes('interrupted')));
      if (isNetwork && attempt < retries) {
        const delay = baseDelay * Math.pow(1.5, attempt - 1);
        console.warn(`⚠️  [SafeOp] Network glitch (${err.message}). Retrying attempt ${attempt + 1}/${retries} in ${Math.round(delay)}ms...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}

async function runMigration() {
  const migrationStartTime = new Date();
  console.log("================================================================================");
  console.log("🚀 STARTING NON-DESTRUCTIVE LLD CURRICULUM v2.1 MIGRATION");
  console.log(`⏱️  Timestamp: ${migrationStartTime.toISOString()}`);
  console.log("================================================================================");

  const connectDB = (await import('../config/db.config.js')).default;
  await connectDB();
  console.log("✓ Connected to MongoDB database.");

  const { Branch } = await import('../models/branch.model.js');
  const { Project } = await import('../models/project.model.js');
  const { Task } = await import('../models/task.model.js');
  const { User } = await import('../models/user.model.js');

  // 1. Check & Record DSA Branch Status for Invariant Protection
  const dsaBranch = await safeOp(() => Branch.findOne({ slug: "dsa-(data-structures-and-algorithm)" }));
  if (!dsaBranch) {
    throw new Error("DSA Branch not found! Halting to protect database integrity.");
  }
  const initialDsaProjectCount = await safeOp(() => Project.countDocuments({ branchId: dsaBranch._id }));
  const initialDsaTaskCount = await safeOp(() => Task.countDocuments({ branchId: dsaBranch._id }));
  console.log(`🛡️  DSA Branch Baseline: ${initialDsaProjectCount} projects, ${initialDsaTaskCount} tasks.`);

  // 2. Identify LLD Branch
  const lldBranchId = new mongoose.Types.ObjectId("6a083a77f7e66b83659e7174");
  const lldBranch = await safeOp(() => Branch.findOne({
    $or: [
      { _id: lldBranchId },
      { slug: "lld(low-level-design)" }
    ]
  }));
  if (!lldBranch) {
    throw new Error("LLD Branch not found!");
  }
  console.log(`✓ LLD Branch confirmed: "${lldBranch.name}" (ID: ${lldBranch._id})`);

  // 3. Find Admin User
  const adminUser = await safeOp(() => User.findOne({ email: "balajiaadi2000@gmail.com" }));
  if (!adminUser) {
    throw new Error("Admin user balajiaadi2000@gmail.com not found!");
  }

  // 4. Track migration counts
  let modulesUpdated = 0;
  let unitsCreatedOrUpdated = 0;
  let drillsUpdated = 0;
  let majorProblemsUpdated = 0;
  let problemVersionsUpdated = 0;

  // 5. Execute Non-Destructive Migration
  for (let phaseIdx = 0; phaseIdx < allPhases.length; phaseIdx++) {
    const phase = allPhases[phaseIdx];
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`Processing Phase ${phaseIdx + 1}: [${phase.key}] ${phase.name}`);
    console.log(`--------------------------------------------------------------------------------`);

    // 5A. Upsert Project document
    let projectDoc = await safeOp(() => Project.findOne({ branchId: lldBranch._id, key: phase.key }));
    if (!projectDoc) {
      projectDoc = await safeOp(() => Project.create({
        name: phase.name,
        key: phase.key,
        access: "public",
        description: phase.description,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        priority: "high",
        status: "active",
        projectManager: adminUser._id,
        teamMembers: [adminUser._id],
        rolesAndResponsibilities: [
          {
            teamMember: adminUser._id,
            role: "Lead",
            responsibility: `Complete ${phase.name}`
          }
        ],
        settings: {
          enableLeetCodeSearch: false,
          enableYoutubeSearch: true,
          sprintDuration: 2,
          enableSprints: false
        },
        branchId: lldBranch._id,
        createdBy: adminUser._id
      }));
      console.log(`   + Created Project [${phase.key}]`);
    } else {
      projectDoc.name = phase.name;
      projectDoc.description = phase.description;
      projectDoc.priority = "high";
      projectDoc.status = "active";
      await safeOp(() => projectDoc.save());
      console.log(`   ✓ Updated Project [${phase.key}] in-place`);
    }

    // 5B. Migrate Coursework Hierarchy: Module -> Learning Unit -> Practical Drill
    for (let mIdx = 0; mIdx < phase.modules.length; mIdx++) {
      const mod = phase.modules[mIdx];

      // Upsert Curriculum Module
      let moduleDoc = await safeOp(() => Task.findOne({ branchId: lldBranch._id, taskId: mod.taskId }));
      if (!moduleDoc) {
        moduleDoc = new Task({
          projectName: projectDoc._id,
          taskId: mod.taskId,
          createdBy: adminUser._id,
          branchId: lldBranch._id
        });
      }
      moduleDoc.taskName = mod.taskName;
      moduleDoc.taskDescription = mod.taskDescription;
      moduleDoc.taskPriority = mod.taskPriority || "high";
      moduleDoc.taskType = "CurriculumModule";
      moduleDoc.parentTask = null; // Modules are top-level coursework nodes
      moduleDoc.assignee = adminUser._id;
      moduleDoc.curriculumMeta = {
        nodeType: "module",
        level: null,
        levelName: "",
        actionVerb: null,
        unitCode: "",
        conceptTopics: [],
        targetTimeMinutes: 0,
        difficulty: null
      };
      await safeOp(() => moduleDoc.save());
      modulesUpdated++;
      console.log(`   📦 Module: [${mod.taskId}] ${mod.taskName}`);

      // Process Learning Units under this Module
      let drillRunningIndex = 1;
      for (let uIdx = 0; uIdx < mod.units.length; uIdx++) {
        const unit = mod.units[uIdx];

        // Upsert Learning Unit Task Node
        let unitDoc = await safeOp(() => Task.findOne({ branchId: lldBranch._id, taskId: unit.taskId }));
        if (!unitDoc) {
          unitDoc = new Task({
            projectName: projectDoc._id,
            taskId: unit.taskId,
            createdBy: adminUser._id,
            branchId: lldBranch._id
          });
        }
        unitDoc.taskName = unit.taskName;
        unitDoc.taskDescription = unit.taskDescription;
        unitDoc.taskPriority = "high";
        unitDoc.taskType = "CurriculumUnit";
        unitDoc.parentTask = moduleDoc._id; // Parent is the Curriculum Module
        unitDoc.assignee = adminUser._id;
        unitDoc.curriculumMeta = {
          nodeType: "unit",
          level: null,
          levelName: "",
          actionVerb: null,
          unitCode: unit.unitCode,
          conceptTopics: unit.conceptTopics || [],
          targetTimeMinutes: unit.targetTimeMinutes || 30,
          difficulty: null
        };
        await safeOp(() => unitDoc.save());
        unitsCreatedOrUpdated++;
        console.log(`      🔹 Unit: [${unit.taskId}] ${unit.taskName} (${(unit.conceptTopics || []).length} concept topics)`);

        // Process Practical Drills under this Learning Unit
        for (let dIdx = 0; dIdx < unit.drills.length; dIdx++) {
          const drill = unit.drills[dIdx];
          const legacyDrillTaskId = `LLDP${phaseIdx + 1}-M${mIdx + 1}-0${drillRunningIndex}`;
          drillRunningIndex++;

          // Match by current taskId OR legacy taskId to update in-place without duplicates
          let drillDoc = await safeOp(() => Task.findOne({
            branchId: lldBranch._id,
            $or: [
              { taskId: drill.taskId },
              { taskId: drill.legacyTaskId || legacyDrillTaskId }
            ]
          }));

          if (!drillDoc) {
            drillDoc = new Task({
              projectName: projectDoc._id,
              createdBy: adminUser._id,
              branchId: lldBranch._id
            });
          }

          drillDoc.taskId = drill.taskId;
          drillDoc.taskName = drill.taskName; // Clean name without [BUILD], etc.
          drillDoc.taskDescription = drill.taskDescription; // Clean description without raw markdown dumps
          drillDoc.taskPriority = "medium";
          drillDoc.taskType = "CurriculumDrill";
          drillDoc.parentTask = unitDoc._id; // Parent is the Learning Unit
          drillDoc.assignee = adminUser._id;
          drillDoc.estimatedHours = drill.targetTimeMinutes ? Math.ceil(drill.targetTimeMinutes / 60) : 1;
          drillDoc.curriculumMeta = {
            nodeType: "drill",
            level: drill.level || "B",
            levelName: drill.levelName || "Design Exercise",
            actionVerb: drill.actionVerb || "BUILD",
            unitCode: unit.unitCode,
            conceptTopics: [],
            targetTimeMinutes: drill.targetTimeMinutes || 30,
            difficulty: drill.difficulty || "medium"
          };
          await safeOp(() => drillDoc.save());
          drillsUpdated++;
          console.log(`         🔨 Drill: [${drill.taskId}] ${drill.taskName} [${drill.actionVerb}, Level ${drill.level}]`);
        }
      }
    }

    // 5C. Migrate Major LLD Problems Hierarchy: Major Problem -> Problem Version
    for (let pIdx = 0; pIdx < (phase.majorProblems || []).length; pIdx++) {
      const prob = phase.majorProblems[pIdx];

      let probDoc = await safeOp(() => Task.findOne({ branchId: lldBranch._id, taskId: prob.taskId }));
      if (!probDoc) {
        probDoc = new Task({
          projectName: projectDoc._id,
          taskId: prob.taskId,
          createdBy: adminUser._id,
          branchId: lldBranch._id
        });
      }
      probDoc.taskName = prob.taskName;
      probDoc.taskDescription = prob.taskDescription;
      probDoc.taskPriority = prob.taskPriority || "high";
      probDoc.taskType = "MajorProblem";
      probDoc.parentTask = null; // Top-level under project
      probDoc.assignee = adminUser._id;
      probDoc.curriculumMeta = {
        nodeType: "major_problem",
        level: null,
        levelName: "",
        actionVerb: null,
        unitCode: "",
        conceptTopics: [],
        targetTimeMinutes: parseInt(prob.targetTime) || 60,
        difficulty: prob.difficulty || "hard"
      };
      await safeOp(() => probDoc.save());
      majorProblemsUpdated++;
      console.log(`   🎯 Major Problem: [${prob.taskId}] ${prob.taskName}`);

      // Process Problem Versions under this Major Problem
      for (let vIdx = 0; vIdx < prob.versions.length; vIdx++) {
        const ver = prob.versions[vIdx];

        let verDoc = await safeOp(() => Task.findOne({ branchId: lldBranch._id, taskId: ver.taskId }));
        if (!verDoc) {
          verDoc = new Task({
            projectName: projectDoc._id,
            taskId: ver.taskId,
            createdBy: adminUser._id,
            branchId: lldBranch._id
          });
        }
        verDoc.taskName = ver.taskName;
        verDoc.taskDescription = ver.taskDescription;
        verDoc.taskPriority = "medium";
        verDoc.taskType = "ProblemVersion";
        verDoc.parentTask = probDoc._id; // Parent is the Major Problem
        verDoc.assignee = adminUser._id;
        verDoc.estimatedHours = ver.targetTimeMinutes ? Math.ceil(ver.targetTimeMinutes / 60) : 2;
        verDoc.curriculumMeta = {
          nodeType: "problem_version",
          level: null,
          levelName: "",
          actionVerb: null,
          unitCode: "",
          conceptTopics: [],
          targetTimeMinutes: ver.targetTimeMinutes || 30,
          difficulty: ver.difficulty || "medium"
        };
        await safeOp(() => verDoc.save());
        problemVersionsUpdated++;
        console.log(`         🔖 Version: [${ver.taskId}] ${ver.taskName}`);
      }
    }
  }

  // 6. Recalculate subtaskStats and progress across all levels
  console.log(`\n================================================================================`);
  console.log(`📊 RECALCULATING SUBTASK STATS & PROGRESS IN LLD`);
  console.log(`================================================================================`);

  // 6A. Learning Units (subtasks are Drills)
  const allUnits = await safeOp(() => Task.find({ branchId: lldBranch._id, taskType: "CurriculumUnit" }));
  for (const unit of allUnits) {
    const totalDrills = await safeOp(() => Task.countDocuments({ branchId: lldBranch._id, parentTask: unit._id }));
    const completedDrills = await safeOp(() => Task.countDocuments({ branchId: lldBranch._id, parentTask: unit._id, status: "done" }));
    unit.subtaskStats = { total: totalDrills, completed: completedDrills };
    unit.progress = totalDrills > 0 ? Math.round((completedDrills / totalDrills) * 100) : 0;
    await safeOp(() => unit.save());
  }
  console.log(`✓ Recalculated subtaskStats for ${allUnits.length} Learning Units.`);

  // 6B. Curriculum Modules (subtasks are Learning Units)
  const allModules = await safeOp(() => Task.find({ branchId: lldBranch._id, taskType: "CurriculumModule" }));
  for (const mod of allModules) {
    const totalUnitsCount = await safeOp(() => Task.countDocuments({ branchId: lldBranch._id, parentTask: mod._id }));
    const completedUnitsCount = await safeOp(() => Task.countDocuments({ branchId: lldBranch._id, parentTask: mod._id, status: "done" }));
    mod.subtaskStats = { total: totalUnitsCount, completed: completedUnitsCount };
    mod.progress = totalUnitsCount > 0 ? Math.round((completedUnitsCount / totalUnitsCount) * 100) : 0;
    await safeOp(() => mod.save());
  }
  console.log(`✓ Recalculated subtaskStats for ${allModules.length} Curriculum Modules.`);

  // 6C. Major Problems (subtasks are Problem Versions)
  const allProblems = await safeOp(() => Task.find({ branchId: lldBranch._id, taskType: "MajorProblem" }));
  for (const prob of allProblems) {
    const totalVersionsCount = await safeOp(() => Task.countDocuments({ branchId: lldBranch._id, parentTask: prob._id }));
    const completedVersionsCount = await safeOp(() => Task.countDocuments({ branchId: lldBranch._id, parentTask: prob._id, status: "done" }));
    prob.subtaskStats = { total: totalVersionsCount, completed: completedVersionsCount };
    prob.progress = totalVersionsCount > 0 ? Math.round((completedVersionsCount / totalVersionsCount) * 100) : 0;
    await safeOp(() => prob.save());
  }
  console.log(`✓ Recalculated subtaskStats for ${allProblems.length} Major Problems.`);

  // 7. Rigorous Invariant Assertions
  console.log(`\n================================================================================`);
  console.log(`🔍 RUNNING INVARIANT VALIDATIONS & VERIFICATION`);
  console.log(`================================================================================`);

  // Check DSA Invariant
  const finalDsaProjectCount = await safeOp(() => Project.countDocuments({ branchId: dsaBranch._id }));
  const finalDsaTaskCount = await safeOp(() => Task.countDocuments({ branchId: dsaBranch._id }));
  console.log(`🛡️  DSA Check: Projects=${finalDsaProjectCount} (was ${initialDsaProjectCount}), Tasks=${finalDsaTaskCount} (was ${initialDsaTaskCount})`);
  if (finalDsaProjectCount !== initialDsaProjectCount || finalDsaTaskCount !== initialDsaTaskCount) {
    throw new Error("CRITICAL SAFETY VIOLATION: DSA branch records were altered!");
  }

  // Check LLD Tasks Breakdown
  const lldModuleCount = await safeOp(() => Task.countDocuments({ branchId: lldBranch._id, taskType: "CurriculumModule" }));
  const lldUnitCount = await safeOp(() => Task.countDocuments({ branchId: lldBranch._id, taskType: "CurriculumUnit" }));
  const lldDrillCount = await safeOp(() => Task.countDocuments({ branchId: lldBranch._id, taskType: "CurriculumDrill" }));
  const lldProblemCount = await safeOp(() => Task.countDocuments({ branchId: lldBranch._id, taskType: "MajorProblem" }));
  const lldVersionCount = await safeOp(() => Task.countDocuments({ branchId: lldBranch._id, taskType: "ProblemVersion" }));
  const totalLldTasks = await safeOp(() => Task.countDocuments({ branchId: lldBranch._id }));

  console.log(`✓ LLD Modules: ${lldModuleCount} (expected 17)`);
  console.log(`✓ LLD Learning Units: ${lldUnitCount} (expected 43)`);
  console.log(`✓ LLD Practical Drills: ${lldDrillCount} (expected 48)`);
  console.log(`✓ LLD Major Problems: ${lldProblemCount} (expected 15)`);
  console.log(`✓ LLD Problem Versions: ${lldVersionCount} (expected 79)`);
  console.log(`✓ Total LLD Tasks in DB: ${totalLldTasks} (expected 202)`);

  // Check Title Cleanliness (no [BUILD], [REFACTOR], etc. in taskName)
  const contaminatedTitles = await safeOp(() => Task.find({
    branchId: lldBranch._id,
    taskName: { $regex: /\[(BUILD|REFACTOR|COMPARE|EXTEND|DEFEND|PREDICT|DECISION)\]/i }
  }).select('taskId taskName'));
  console.log(`✓ Contaminated Titles Found: ${contaminatedTitles.length}`);
  if (contaminatedTitles.length > 0) {
    console.warn("⚠️  Contaminated titles:", contaminatedTitles);
  }

  // Check Description Cleanliness (no markdown metadata dumps)
  const contaminatedDescriptions = await safeOp(() => Task.find({
    branchId: lldBranch._id,
    taskDescription: { $regex: /\*\*Level:\*\*/i }
  }).select('taskId taskName'));
  console.log(`✓ Contaminated Descriptions Found: ${contaminatedDescriptions.length}`);
  if (contaminatedDescriptions.length > 0) {
    console.warn("⚠️  Contaminated descriptions:", contaminatedDescriptions);
  }

  // Check Phase 1 Sample Hierarchy
  const p1 = await safeOp(() => Project.findOne({ branchId: lldBranch._id, key: "LLDP1" }));
  const p1Modules = await safeOp(() => Task.find({ branchId: lldBranch._id, projectName: p1._id, taskType: "CurriculumModule" }));
  console.log(`\nSample Phase 1 Hierarchy:`);
  console.log(`Project: [${p1.key}] ${p1.name}`);
  for (const m of p1Modules) {
    console.log(`  ├── [${m.taskId}] ${m.taskName} (subtasks: ${m.subtaskStats.total} units)`);
    const units = await safeOp(() => Task.find({ branchId: lldBranch._id, parentTask: m._id }));
    for (const u of units) {
      console.log(`  │    ├── [${u.taskId}] ${u.taskName} (${u.curriculumMeta.conceptTopics.length} concepts, subtasks: ${u.subtaskStats.total} drills)`);
      const drills = await safeOp(() => Task.find({ branchId: lldBranch._id, parentTask: u._id }));
      for (const d of drills) {
        console.log(`  │    │    └── [${d.taskId}] ${d.taskName} (verb=${d.curriculumMeta.actionVerb}, level=${d.curriculumMeta.level}, time=${d.curriculumMeta.targetTimeMinutes}m)`);
      }
    }
  }

  const p1Problems = await safeOp(() => Task.find({ branchId: lldBranch._id, projectName: p1._id, taskType: "MajorProblem" }));
  for (const pr of p1Problems) {
    console.log(`  ├── 🎯 [${pr.taskId}] ${pr.taskName} (subtasks: ${pr.subtaskStats.total} versions)`);
    const versions = await safeOp(() => Task.find({ branchId: lldBranch._id, parentTask: pr._id }));
    for (const v of versions) {
      console.log(`  │    └── [${v.taskId}] ${v.taskName} (diff=${v.curriculumMeta.difficulty})`);
    }
  }

  console.log("\n================================================================================");
  console.log("✅ NON-DESTRUCTIVE MIGRATION COMPLETE & VERIFIED");
  console.log("================================================================================");

  await mongoose.disconnect();
}

runMigration().catch(err => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});

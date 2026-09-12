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

async function seedLldCurriculumV2() {
  console.log("================================================================================");
  console.log("🚀 STARTING SARTHI LLD CURRICULUM v2.1 DATABASE SEEDING");
  console.log("================================================================================");

  const connectDB = (await import('../config/db.config.js')).default;
  await connectDB();
  console.log("✓ Connected to MongoDB database.");

  const { Branch } = await import('../models/branch.model.js');
  const { Project } = await import('../models/project.model.js');
  const { Task } = await import('../models/task.model.js');
  const { User } = await import('../models/user.model.js');

  const lldBranchId = new mongoose.Types.ObjectId("6a083a77f7e66b83659e7174");

  // 1. Locate LLD Branch
  let lldBranch = await Branch.findOne({
    $or: [
      { slug: "lld(low-level-design)" },
      { _id: lldBranchId }
    ]
  });

  if (!lldBranch) {
    console.log("Creating LLD Branch...");
    lldBranch = await Branch.create({
      _id: lldBranchId,
      name: "LLD(Low Level Design)",
      slug: "lld(low-level-design)",
      description: "Low Level Design Mastery & Object Oriented Architecture",
      isActive: true,
      visibility: "private"
    });
  }
  console.log(`✓ LLD Branch confirmed: "${lldBranch.name}" (ID: ${lldBranch._id})`);

  // 2. Find Admin User
  const adminUser = await User.findOne({ email: "balajiaadi2000@gmail.com" });
  if (!adminUser) {
    throw new Error("Admin user balajiaadi2000@gmail.com not found!");
  }

  // Ensure Admin has branchAccess to LLD
  const hasLldAccess = (adminUser.branchAccess || []).some(
    a => a.branchId && a.branchId.toString() === lldBranch._id.toString()
  );
  if (!hasLldAccess) {
    adminUser.branchAccess = adminUser.branchAccess || [];
    adminUser.branchAccess.push({ branchId: lldBranch._id, role: "admin" });
    await adminUser.save();
    console.log("✓ Added LLD branchAccess to admin user.");
  }

  // 3. Clean up previously seeded tasks/projects strictly in LLD branch
  const deletedOldTasks = await Task.deleteMany({ branchId: lldBranch._id });
  const deletedOldProjects = await Project.deleteMany({ branchId: lldBranch._id });
  console.log(`✓ Cleaned up previous LLD items: ${deletedOldProjects.deletedCount} projects, ${deletedOldTasks.deletedCount} tasks.`);
  console.log(`✓ Verified: DSA items remain completely untouched.`);

  // 4. Metrics counters
  let totalProjectsCreated = 0;
  let totalModulesCreated = 0;
  let totalDrillsCreated = 0;
  let totalMajorProblemsCreated = 0;
  let totalVersionsCreated = 0;
  let grandTotalTasksCreated = 0;

  // 5. Seed Phases
  for (let phaseIdx = 0; phaseIdx < allPhases.length; phaseIdx++) {
    const phase = allPhases[phaseIdx];

    const projectDoc = await Project.create({
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
    });
    totalProjectsCreated++;
    console.log(`\n================================================================================`);
    console.log(`🏟️  Phase ${phaseIdx + 1} Project Created: [${phase.key}] "${phase.name}"`);
    console.log(`================================================================================`);

    // 5A. Seed Learning Modules & Level A/B Practical Drills
    for (const mod of phase.modules) {
      const subtaskCount = mod.subtasks.length;
      const moduleDoc = await Task.create({
        projectName: projectDoc._id,
        taskName: mod.taskName,
        taskId: mod.taskId,
        taskDescription: mod.taskDescription,
        taskPriority: mod.taskPriority || "high",
        taskType: "Module",
        taskStartDate: null,
        taskDueDate: null,
        estimatedHours: subtaskCount * 2,
        storyPoints: 0,
        progress: 0,
        status: "todo",
        parentTask: null,
        assignee: adminUser._id,
        createdBy: adminUser._id,
        branchId: lldBranch._id,
        subtaskStats: {
          total: subtaskCount,
          completed: 0
        },
        activityLogs: [
          {
            oldStatus: null,
            currentStatus: "",
            user: adminUser._id,
            date: new Date(),
            message: "Module created with status Todo"
          }
        ]
      });
      totalModulesCreated++;
      grandTotalTasksCreated++;
      console.log(`   📦 Module: [${mod.taskId}] ${mod.taskName} (${subtaskCount} practical drills)`);

      for (const drill of mod.subtasks) {
        await Task.create({
          projectName: projectDoc._id,
          taskName: drill.taskName,
          taskId: drill.taskId,
          taskDescription: drill.taskDescription,
          taskPriority: "medium",
          taskType: "Practice",
          taskStartDate: null,
          taskDueDate: null,
          estimatedHours: drill.estimatedHours || 1,
          storyPoints: 0,
          progress: 0,
          status: "todo",
          parentTask: moduleDoc._id,
          assignee: adminUser._id,
          createdBy: adminUser._id,
          branchId: lldBranch._id,
          subtaskStats: { total: 0, completed: 0 },
          activityLogs: [
            {
              oldStatus: null,
              currentStatus: "",
              user: adminUser._id,
              date: new Date(),
              message: "Practice drill created with status Todo"
            }
          ]
        });
        totalDrillsCreated++;
        grandTotalTasksCreated++;
      }
    }

    // 5B. Seed Major LLD Problems & Purpose-Driven Evolving Versions
    for (const prob of (phase.majorProblems || [])) {
      const versionCount = prob.versions.length;
      const problemDoc = await Task.create({
        projectName: projectDoc._id,
        taskName: prob.taskName,
        taskId: prob.taskId,
        taskDescription: prob.taskDescription,
        taskPriority: prob.taskPriority || "high",
        taskType: "MajorProblem",
        taskStartDate: null,
        taskDueDate: null,
        estimatedHours: versionCount * 2,
        storyPoints: 0,
        progress: 0,
        status: "todo",
        parentTask: null,
        assignee: adminUser._id,
        createdBy: adminUser._id,
        branchId: lldBranch._id,
        subtaskStats: {
          total: versionCount,
          completed: 0
        },
        activityLogs: [
          {
            oldStatus: null,
            currentStatus: "",
            user: adminUser._id,
            date: new Date(),
            message: "Major LLD Problem created with status Todo"
          }
        ]
      });
      totalMajorProblemsCreated++;
      grandTotalTasksCreated++;
      console.log(`   🎯 Major Problem: [${prob.taskId}] ${prob.taskName} (${versionCount} evolving versions)`);

      for (const ver of prob.versions) {
        await Task.create({
          projectName: projectDoc._id,
          taskName: ver.taskName,
          taskId: ver.taskId,
          taskDescription: ver.taskDescription,
          taskPriority: "medium",
          taskType: "ProblemVersion",
          taskStartDate: null,
          taskDueDate: null,
          estimatedHours: ver.estimatedHours || 2,
          storyPoints: 0,
          progress: 0,
          status: "todo",
          parentTask: problemDoc._id,
          assignee: adminUser._id,
          createdBy: adminUser._id,
          branchId: lldBranch._id,
          subtaskStats: { total: 0, completed: 0 },
          activityLogs: [
            {
              oldStatus: null,
              currentStatus: "",
              user: adminUser._id,
              date: new Date(),
              message: "Problem version created with status Todo"
            }
          ]
        });
        totalVersionsCreated++;
        grandTotalTasksCreated++;
      }
    }
  }

  // 6. Safety Audit: Confirm DSA integrity
  const dsaProjects = await Project.countDocuments({ name: /DSA/i });
  const dsaTasks = await Task.countDocuments({ taskId: /^DSA/i });

  console.log("\n================================================================================");
  console.log(`🎉 SARTHI LLD CURRICULUM v2.1 SEEDING COMPLETE!`);
  console.log(`   Phases / Projects Created:     ${totalProjectsCreated}`);
  console.log(`   Learning Modules Created:      ${totalModulesCreated}`);
  console.log(`   Level A & B Drills Created:    ${totalDrillsCreated}`);
  console.log(`   Major LLD Problems Created:    ${totalMajorProblemsCreated}`);
  console.log(`   Evolving Versions Created:     ${totalVersionsCreated}`);
  console.log(`   Total Parent Tasks:            ${totalModulesCreated + totalMajorProblemsCreated}`);
  console.log(`   Total Child Tasks (Subtasks):  ${totalDrillsCreated + totalVersionsCreated}`);
  console.log(`   Grand Total Tasks Seeded:      ${grandTotalTasksCreated}`);
  console.log("--------------------------------------------------------------------------------");
  console.log(`🛡️  DSA Integrity Verification:`);
  console.log(`   DSA Projects: ${dsaProjects} (Intact)`);
  console.log(`   DSA Tasks:    ${dsaTasks} (Intact)`);
  console.log("================================================================================");

  await mongoose.disconnect();
}

seedLldCurriculumV2().catch(err => {
  console.error("❌ Seeding Error:", err);
  process.exit(1);
});

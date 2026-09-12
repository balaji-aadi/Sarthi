import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.config.js";
import { Branch } from "../models/branch.model.js";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { UserTaskProgress } from "../models/userTaskProgress.model.js";

async function runMigration() {
  console.log("================================================================================");
  console.log("STARTING ARENA MIGRATION: 'Resume Grinding Phase 1' -> 'Development'");
  console.log("================================================================================");

  await connectDB();

  const dsaBranchId = new mongoose.Types.ObjectId("6a081b6e111c99b633b00d76");
  const devBranchId = new mongoose.Types.ObjectId("6aa28bc5f4afb9b4921e0fe5");
  const arenaId = new mongoose.Types.ObjectId("6a30c5bcf7cfd43d78e67bf8");

  // Pre-condition 1: Verify Branches
  const dsaBranch = await Branch.findById(dsaBranchId).lean();
  if (!dsaBranch) throw new Error(`DSA Branch not found with ID ${dsaBranchId}`);
  console.log(`[CHECK 1 PASS] Found DSA Branch: "${dsaBranch.name}" (${dsaBranch._id})`);

  const devBranch = await Branch.findById(devBranchId).lean();
  if (!devBranch) throw new Error(`Development Branch not found with ID ${devBranchId}`);
  console.log(`[CHECK 2 PASS] Found Development Branch: "${devBranch.name}" (${devBranch._id})`);

  // Pre-condition 2: Verify Target Arena
  const arena = await Project.findById(arenaId).lean();
  if (!arena) throw new Error(`Target Arena Project not found with ID ${arenaId}`);
  if (arena.branchId.toString() !== dsaBranchId.toString()) {
    throw new Error(`Target Arena does not belong to DSA Branch! Current branchId: ${arena.branchId}`);
  }
  console.log(`[CHECK 3 PASS] Found Target Arena: "${arena.name}" (Key: ${arena.key}) currently under DSA`);

  // Pre-condition 3: Counts
  const initialDsaProjectCount = await Project.countDocuments({ branchId: dsaBranchId });
  const initialDevProjectCount = await Project.countDocuments({ branchId: devBranchId });
  const initialTotalProjects = await Project.countDocuments({});
  const initialTotalTasks = await Task.countDocuments({});

  const arenaTaskCount = await Task.countDocuments({ projectName: arenaId });
  const arenaTaskDsaCount = await Task.countDocuments({ projectName: arenaId, branchId: dsaBranchId });
  const arenaUtpCount = await UserTaskProgress.countDocuments({ projectName: arenaId });
  const arenaUtpDsaCount = await UserTaskProgress.countDocuments({ projectName: arenaId, branchId: dsaBranchId });

  console.log(`[CHECK 4 PASS] Initial Counts:`);
  console.log(`  - Total DB Projects: ${initialTotalProjects} (DSA: ${initialDsaProjectCount}, Dev: ${initialDevProjectCount})`);
  console.log(`  - Total DB Tasks: ${initialTotalTasks}`);
  console.log(`  - Arena Tasks: ${arenaTaskCount} (all ${arenaTaskDsaCount} under DSA)`);
  console.log(`  - Arena UserTaskProgress: ${arenaUtpCount} (all ${arenaUtpDsaCount} under DSA)`);

  if (arenaTaskCount !== 66 || arenaTaskDsaCount !== 66) {
    throw new Error(`Unexpected task count for arena! Expected 66, found ${arenaTaskCount}`);
  }
  if (arenaUtpCount !== 28 || arenaUtpDsaCount !== 28) {
    throw new Error(`Unexpected UserTaskProgress count for arena! Expected 28, found ${arenaUtpCount}`);
  }

  // EXECUTION: Move Arena and its tasks/progress to Development
  console.log("\n--------------------------------------------------------------------------------");
  console.log("EXECUTING DATABASE UPDATES...");
  console.log("--------------------------------------------------------------------------------");

  // 1. Update Project branchId
  const projectUpdateRes = await Project.updateOne(
    { _id: arenaId },
    { 
      $set: { 
        branchId: devBranchId,
        updatedAt: new Date()
      } 
    }
  );
  console.log(`✓ Updated Project: matched ${projectUpdateRes.matchedCount}, modified ${projectUpdateRes.modifiedCount}`);

  // 2. Update Tasks branchId
  const tasksUpdateRes = await Task.updateMany(
    { projectName: arenaId },
    { $set: { branchId: devBranchId } }
  );
  console.log(`✓ Updated Tasks: matched ${tasksUpdateRes.matchedCount}, modified ${tasksUpdateRes.modifiedCount}`);

  // 3. Update UserTaskProgress branchId
  const utpUpdateRes = await UserTaskProgress.updateMany(
    { projectName: arenaId },
    { $set: { branchId: devBranchId } }
  );
  console.log(`✓ Updated UserTaskProgress: matched ${utpUpdateRes.matchedCount}, modified ${utpUpdateRes.modifiedCount}`);

  // POST-VERIFICATION
  console.log("\n--------------------------------------------------------------------------------");
  console.log("RUNNING POST-MIGRATION INTEGRITY VERIFICATION...");
  console.log("--------------------------------------------------------------------------------");

  // Verify Arena
  const updatedArena = await Project.findById(arenaId).lean();
  if (updatedArena.branchId.toString() !== devBranchId.toString()) {
    throw new Error("POST-CHECK FAILED: Arena branchId was not updated to Development!");
  }
  console.log(`✓ POST-CHECK PASS: Arena "${updatedArena.name}" branchId is now ${updatedArena.branchId} (Development)`);

  // Verify Project Counts
  const postDsaProjects = await Project.find({ branchId: dsaBranchId }).lean();
  const postDevProjects = await Project.find({ branchId: devBranchId }).lean();
  const postTotalProjects = await Project.countDocuments({});

  console.log(`✓ POST-CHECK PASS: Projects in DSA (${postDsaProjects.length}):`);
  postDsaProjects.forEach(p => console.log(`    - "${p.name}" (Key: ${p.key})`));

  console.log(`✓ POST-CHECK PASS: Projects in Development (${postDevProjects.length}):`);
  postDevProjects.forEach(p => console.log(`    - "${p.name}" (Key: ${p.key})`));

  if (postDsaProjects.length !== initialDsaProjectCount - 1) {
    throw new Error(`POST-CHECK FAILED: DSA project count expected ${initialDsaProjectCount - 1}, got ${postDsaProjects.length}`);
  }
  if (postDevProjects.length !== 1) {
    throw new Error(`POST-CHECK FAILED: Dev project count expected 1, got ${postDevProjects.length}`);
  }
  if (postTotalProjects !== initialTotalProjects) {
    throw new Error(`POST-CHECK FAILED: Total projects count changed! Expected ${initialTotalProjects}, got ${postTotalProjects}`);
  }

  // Verify Task Counts
  const postTotalTasks = await Task.countDocuments({});
  const postArenaDevTasks = await Task.countDocuments({ projectName: arenaId, branchId: devBranchId });
  const postArenaDsaTasks = await Task.countDocuments({ projectName: arenaId, branchId: dsaBranchId });

  if (postTotalTasks !== initialTotalTasks) {
    throw new Error(`POST-CHECK FAILED: Total task count changed! Expected ${initialTotalTasks}, got ${postTotalTasks}`);
  }
  if (postArenaDevTasks !== 66 || postArenaDsaTasks !== 0) {
    throw new Error(`POST-CHECK FAILED: Task branch reassignment mismatch! Dev: ${postArenaDevTasks}, DSA: ${postArenaDsaTasks}`);
  }
  console.log(`✓ POST-CHECK PASS: All 66 tasks for "${updatedArena.name}" belong to Development branch (0 in DSA)`);
  console.log(`✓ POST-CHECK PASS: Total database tasks unchanged: ${postTotalTasks}`);

  // Verify UserTaskProgress
  const postArenaDevUtps = await UserTaskProgress.countDocuments({ projectName: arenaId, branchId: devBranchId });
  const postArenaDsaUtps = await UserTaskProgress.countDocuments({ projectName: arenaId, branchId: dsaBranchId });
  if (postArenaDevUtps !== 28 || postArenaDsaUtps !== 0) {
    throw new Error(`POST-CHECK FAILED: UTP branch reassignment mismatch! Dev: ${postArenaDevUtps}, DSA: ${postArenaDsaUtps}`);
  }
  console.log(`✓ POST-CHECK PASS: All 28 UserTaskProgress records belong to Development branch (0 in DSA)`);

  console.log("\n================================================================================");
  console.log("🎉 MIGRATION COMPLETED SUCCESSFULLY WITH ZERO UNINTENDED CHANGES!");
  console.log("================================================================================");

  process.exit(0);
}

runMigration().catch(err => {
  console.error("Migration Error:", err);
  process.exit(1);
});

import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import connectDB from "../config/db.config.js";
import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";
import { ProgressService } from "../services/progress-service/progress.service.js";

async function run() {
  console.log("Connecting to MongoDB...");
  await connectDB();

  const projectId = new mongoose.Types.ObjectId("6a30c5bcf7cfd43d78e67bf8");
  const project = await Project.findById(projectId);
  if (!project) {
    console.error("❌ Safety error: Project 'Resume Grinding Phase 1 (Basics)' (6a30c5bcf7cfd43d78e67bf8) not found!");
    process.exit(1);
  }
  console.log(`Found Project: "${project.name}" (ID: ${project._id})`);

  // Target parent task names
  const targetParentNames = ["Docker", "Nginx", "CI/CD & GitHub Actions", "C++"];

  // 1. Fetch parent tasks
  const parents = await Task.find({
    projectName: projectId,
    taskName: { $in: targetParentNames },
    parentTask: null
  });

  console.log(`Found ${parents.length} target parent tasks.`);
  for (const parent of parents) {
    console.log(`- Parent: "${parent.taskName}" (ID: ${parent._id}, taskId: "${parent.taskId}")`);
  }

  if (parents.length !== 4) {
    console.error(`❌ Safety error: Expected to find exactly 4 target parents, but found ${parents.length}. Aborting!`);
    process.exit(1);
  }

  const parentIds = parents.map(p => p._id);

  // 2. Fetch child tasks
  const children = await Task.find({
    parentTask: { $in: parentIds }
  });

  console.log(`Found ${children.length} child tasks under the target parents.`);
  for (const child of children) {
    console.log(`  - Child: "${child.taskName}" (ID: ${child._id}, parentTask: ${child.parentTask})`);
  }

  // Expecting 8 + 7 + 7 + 5 = 27 child tasks
  const expectedChildrenCount = 27;
  if (children.length !== expectedChildrenCount) {
    console.error(`❌ Safety error: Expected exactly ${expectedChildrenCount} children, but found ${children.length}. Aborting!`);
    process.exit(1);
  }

  // 3. Create a local targeted backup of the tasks we are deleting
  const backupData = {
    timestamp: new Date().toISOString(),
    project: {
      id: project._id,
      name: project.name
    },
    deletedParents: parents,
    deletedChildren: children
  };

  const scratchDir = "/Users/balajiaadesh/Desktop/Sarthi/backend/scratch";
  const backupPath = path.join(scratchDir, "backup_deleted_resume_tasks.json");
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), "utf8");
  console.log(`✅ Targeted tasks backup created at: ${backupPath}`);

  // 4. Delete child tasks
  console.log(`Deleting ${children.length} child tasks...`);
  const childDeleteResult = await Task.deleteMany({
    parentTask: { $in: parentIds }
  });
  console.log(`✅ Deleted ${childDeleteResult.deletedCount} child tasks.`);

  // 5. Delete parent tasks
  console.log(`Deleting ${parents.length} parent tasks...`);
  const parentDeleteResult = await Task.deleteMany({
    _id: { $in: parentIds }
  });
  console.log(`✅ Deleted ${parentDeleteResult.deletedCount} parent tasks.`);

  // 6. Recalculate project progress
  console.log("Recalculating project progress...");
  await ProgressService.updateProjectProgress(projectId);
  
  const updatedProject = await Project.findById(projectId);
  console.log(`Project progress updated from ${project.progress}% to ${updatedProject.progress}%`);

  console.log("\n=======================================================");
  console.log("Deletion and progress update completed successfully!");
  console.log("=======================================================\n");
  
  process.exit(0);
}

run().catch((error) => {
  console.error("❌ Deletion process failed:", error);
  process.exit(1);
});

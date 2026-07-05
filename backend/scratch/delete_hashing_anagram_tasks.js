import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import connectDB from "../config/db.config.js";
import { Task } from "../models/task.model.js";
import { ProgressService } from "../services/progress-service/progress.service.js";

async function run() {
  console.log("Connecting to MongoDB...");
  await connectDB();

  // Find parent task "Hashing & Anagram (STRINGS)"
  const parent = await Task.findOne({ taskName: "Hashing & Anagram (STRINGS)", parentTask: null });
  if (!parent) {
    console.error("❌ Safety error: Parent task 'Hashing & Anagram (STRINGS)' not found in database!");
    process.exit(1);
  }

  console.log(`Found Parent Task: "${parent.taskName}" (ID: ${parent._id}, Project: ${parent.projectName})`);

  // Find the target child tasks to delete
  const targetTaskNames = ["Check permutation", "Frequency sort"];
  const childrenToDelete = await Task.find({
    parentTask: parent._id,
    taskName: { $in: targetTaskNames }
  }).toArray ? await Task.find({
    parentTask: parent._id,
    taskName: { $in: targetTaskNames }
  }).toArray() : await Task.find({
    parentTask: parent._id,
    taskName: { $in: targetTaskNames }
  });

  console.log(`Found ${childrenToDelete.length} target child tasks to delete.`);
  for (const t of childrenToDelete) {
    console.log(`- "${t.taskName}" (ID: ${t._id}, TaskId: ${t.taskId}, Status: ${t.status})`);
  }

  if (childrenToDelete.length !== 2) {
    console.error("❌ Safety error: Expected to find exactly 2 target child tasks, but found " + childrenToDelete.length + ". Aborting!");
    process.exit(1);
  }

  // Define backup path
  const scratchDir = path.resolve("scratch");
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }
  const backupPath = path.join(scratchDir, "backup_deleted_hashing_anagram_tasks.json");

  // Save backup
  fs.writeFileSync(backupPath, JSON.stringify(childrenToDelete, null, 2), "utf8");
  console.log(`✅ Backup successfully saved to ${backupPath}`);

  // Delete target child tasks
  const deleteIds = childrenToDelete.map(t => t._id);
  console.log(`Deleting tasks with IDs:`, deleteIds);
  
  const deleteResult = await Task.deleteMany({ _id: { $in: deleteIds } });
  console.log(`✅ Successfully deleted ${deleteResult.deletedCount} tasks from the database.`);

  if (deleteResult.deletedCount !== 2) {
    console.error(`❌ Warning: Expected to delete 2 tasks, but deleted ${deleteResult.deletedCount}`);
  }

  // Update progress rollups
  console.log("Updating parent task progress and project progress...");
  await ProgressService.updateParentTaskProgress(parent._id);
  await ProgressService.updateProjectProgress(parent.projectName);

  // Fetch parent task again to verify progress and stats
  const updatedParent = await Task.findById(parent._id);
  console.log(`\nUpdated Parent Task Stats:`);
  console.log(`- Name: ${updatedParent.taskName}`);
  console.log(`- Progress: ${updatedParent.progress}%`);
  console.log(`- subtaskStats:`, updatedParent.subtaskStats);

  console.log("\nDeletion and update completed successfully!");
  process.exit(0);
}

run().catch((error) => {
  console.error("❌ Run failed:", error);
  process.exit(1);
});

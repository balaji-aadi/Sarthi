import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import connectDB from "../config/db.config.js";

async function run() {
  console.log("Connecting to MongoDB...");
  await connectDB();
  const db = mongoose.connection.db;

  const projectId = new mongoose.Types.ObjectId("69d77b7c6d3910f342f3762e");

  // 1. Fetch project document
  const project = await db.collection("projects").findOne({ _id: projectId });
  if (!project) {
    console.error("❌ Safety error: Project 'English Speaking Practice' (69d77b7c6d3910f342f3762e) not found!");
    process.exit(1);
  }
  console.log(`Found Project: "${project.name}" (ID: ${project._id}, Key: ${project.key})`);

  // 2. Fetch tasks belonging to this project
  const tasks = await db.collection("tasks").find({ projectName: projectId }).toArray();
  console.log(`Found ${tasks.length} tasks belonging to this project.`);

  if (tasks.length !== 30) {
    console.error(`❌ Safety error: Expected exactly 30 tasks, but found ${tasks.length}. Aborting deletion!`);
    process.exit(1);
  }

  // 3. Fetch focus sessions referencing these tasks
  const taskIds = tasks.map(t => t._id);
  const sessions = await db.collection("focussessions").find({ task: { $in: taskIds } }).toArray();
  console.log(`Found ${sessions.length} focus sessions referencing these tasks.`);

  // 4. Create local JSON backup
  const backupData = {
    timestamp: new Date().toISOString(),
    project,
    tasks,
    focusSessions: sessions
  };
  const scratchDir = "/Users/balajiaadesh/Desktop/Sarthi/backend/scratch";
  const backupPath = path.join(scratchDir, "backup_deleted_english_speaking_arena.json");
  
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), "utf8");
  console.log(`✅ Targeted backup created at: ${backupPath}`);

  // 5. Update focus sessions (nullify task reference to avoid dangling references)
  if (sessions.length > 0) {
    console.log(`Updating ${sessions.length} focus sessions...`);
    const updateResult = await db.collection("focussessions").updateMany(
      { task: { $in: taskIds } },
      { $set: { task: null } }
    );
    console.log(`✅ Successfully updated ${updateResult.modifiedCount} focus sessions.`);
  }

  // 6. Delete project
  console.log(`Deleting project: ${project.name}...`);
  const projectDeleteResult = await db.collection("projects").deleteOne({ _id: projectId });
  console.log(`✅ Successfully deleted project document. Deleted count: ${projectDeleteResult.deletedCount}`);

  // 7. Delete tasks
  console.log(`Deleting ${tasks.length} tasks...`);
  const tasksDeleteResult = await db.collection("tasks").deleteMany({ projectName: projectId });
  console.log(`✅ Successfully deleted tasks. Deleted count: ${tasksDeleteResult.deletedCount}`);

  console.log("\n=======================================================");
  console.log("English Speaking Practice Deletion Summary:");
  console.log(`- Project Deleted: ${projectDeleteResult.deletedCount === 1 ? "YES" : "NO"}`);
  console.log(`- Tasks Deleted: ${tasksDeleteResult.deletedCount}`);
  console.log(`- Focus Sessions Updated: ${sessions.length}`);
  console.log("=======================================================\n");

  process.exit(0);
}

run().catch((error) => {
  console.error("❌ Run failed:", error);
  process.exit(1);
});

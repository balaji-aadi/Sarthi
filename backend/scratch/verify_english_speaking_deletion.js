import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import connectDB from "../config/db.config.js";

async function run() {
  await connectDB();
  const db = mongoose.connection.db;

  const projectId = new mongoose.Types.ObjectId("69d77b7c6d3910f342f3762e");

  console.log("Verifying deletion status...");

  // 1. Verify Project Deletion
  const project = await db.collection("projects").findOne({ _id: projectId });
  console.log(`- Project (69d77b7c6d3910f342f3762e) exists? ${project ? "YES (FAILED)" : "NO (PASSED)"}`);

  // 2. Verify Tasks Deletion
  const tasksCount = await db.collection("tasks").countDocuments({ projectName: projectId });
  console.log(`- Remaining tasks for project 69d77b7c6d3910f342f3762e: ${tasksCount} (Expected: 0) -> ${tasksCount === 0 ? "PASSED" : "FAILED"}`);

  // 3. Verify Focus Sessions Updates
  const sessionIds = [
    new mongoose.Types.ObjectId("69e513d17803acf20dd5ed60"),
    new mongoose.Types.ObjectId("69e7b3c22699af81cb91db9a")
  ];
  const sessions = await db.collection("focussessions").find({ _id: { $in: sessionIds } }).toArray();
  console.log(`- Verified ${sessions.length} Focus Sessions:`);
  sessions.forEach(s => {
    console.log(`  Session ID: ${s._id} | task: ${s.task} (Expected: null) | taskName: "${s.taskName}" -> ${s.task === null ? "PASSED" : "FAILED"}`);
  });

  // 4. Verify Backup File
  const backupPath = "/Users/balajiaadesh/Desktop/Sarthi/backend/scratch/backup_deleted_english_speaking_arena.json";
  const backupExists = fs.existsSync(backupPath);
  console.log(`- Backup file exists at path? ${backupExists ? "YES (PASSED)" : "NO (FAILED)"}`);

  if (backupExists) {
    const backupContent = JSON.parse(fs.readFileSync(backupPath, "utf8"));
    console.log(`  - Backup timestamp: ${backupContent.timestamp}`);
    console.log(`  - Backed up project: ${backupContent.project ? backupContent.project.name : "NONE"}`);
    console.log(`  - Backed up tasks count: ${backupContent.tasks ? backupContent.tasks.length : 0}`);
    console.log(`  - Backed up focus sessions count: ${backupContent.focusSessions ? backupContent.focusSessions.length : 0}`);
  }

  process.exit(0);
}

run().catch(console.error);

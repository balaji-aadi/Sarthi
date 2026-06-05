import "dotenv/config";
import mongoose from "mongoose";
import { Task } from "../models/task.model.js";
import connectDB from "../config/db.config.js";

async function listAll() {
  await connectDB();
  const speakingParentId = "69e5139e075177f2937347d4";
  const writingParentId = "69e5139f075177f29373483b";

  const speakingTasks = await Task.find({ parentTask: speakingParentId }).sort({ taskName: 1 }).lean();
  const writingTasks = await Task.find({ parentTask: writingParentId }).sort({ taskName: 1 }).lean();

  console.log("Speaking tasks list (first 15):");
  speakingTasks.slice(0, 15).forEach(t => {
    console.log(`- ${t.taskName}: status=${t.status}, startDate=${t.taskStartDate ? t.taskStartDate.toISOString() : "null"}, dueDate=${t.taskDueDate ? t.taskDueDate.toISOString() : "null"}`);
  });

  console.log("\nWriting tasks list (first 15):");
  writingTasks.slice(0, 15).forEach(t => {
    console.log(`- ${t.taskName}: status=${t.status}, startDate=${t.taskStartDate ? t.taskStartDate.toISOString() : "null"}, dueDate=${t.taskDueDate ? t.taskDueDate.toISOString() : "null"}`);
  });

  console.log("\nSpeaking tasks list (last 15):");
  speakingTasks.slice(-15).forEach(t => {
    console.log(`- ${t.taskName}: status=${t.status}, startDate=${t.taskStartDate ? t.taskStartDate.toISOString() : "null"}, dueDate=${t.taskDueDate ? t.taskDueDate.toISOString() : "null"}`);
  });

  process.exit(0);
}

listAll();

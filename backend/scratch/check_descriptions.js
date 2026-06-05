import "dotenv/config";
import mongoose from "mongoose";
import { Task } from "../models/task.model.js";
import connectDB from "../config/db.config.js";

async function run() {
  await connectDB();
  const speakingParentId = "69e5139e075177f2937347d4";
  const writingParentId = "69e5139f075177f29373483b";

  const speakingTasks = await Task.find({ parentTask: speakingParentId }).sort({ taskName: 1 }).lean();
  const writingTasks = await Task.find({ parentTask: writingParentId }).sort({ taskName: 1 }).lean();

  console.log("=== Speaking Task Descriptions ===");
  speakingTasks.slice(0, 5).forEach(t => {
    console.log(`- ${t.taskName}: description="${t.taskDescription || ''}"`);
  });

  console.log("\n=== Writing Task Descriptions ===");
  writingTasks.slice(0, 5).forEach(t => {
    console.log(`- ${t.taskName}: description="${t.taskDescription || ''}"`);
  });

  process.exit(0);
}

run();

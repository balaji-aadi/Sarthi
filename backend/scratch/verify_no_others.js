import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.config.js";
import { Task } from "../models/task.model.js";

async function run() {
  await connectDB();
  const tasks = await Task.find({
    taskName: { $in: ["Frequency sort", "Check permutation"] }
  });

  console.log(`Verification: Found ${tasks.length} tasks in the whole database with target names.`);
  for (const t of tasks) {
    console.log(`- "${t.taskName}" (ID: ${t._id}, Parent ID: ${t.parentTask})`);
  }

  process.exit(0);
}
run().catch(console.error);

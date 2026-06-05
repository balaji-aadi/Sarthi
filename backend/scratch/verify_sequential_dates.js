import "dotenv/config";
import mongoose from "mongoose";
import { Task } from "../models/task.model.js";
import connectDB from "../config/db.config.js";

async function verify() {
  await connectDB();
  const speakingParentId = "69e5139e075177f2937347d4";

  const tasks = await Task.find({ parentTask: speakingParentId }).lean();
  
  // Sort tasks numerically by Day number extracted from taskName
  tasks.sort((a, b) => {
    const getDayNum = (name) => {
      if (name.includes("Final Day")) return 100;
      const match = name.match(/Day\s+(\d+)/i);
      return match ? parseInt(match[1]) : 0;
    };
    return getDayNum(a.taskName) - getDayNum(b.taskName);
  });

  console.log("=== Numerical List of Speaking Tasks (Days 1 to 15) ===");
  tasks.slice(0, 15).forEach(t => {
    console.log(`- ${t.taskName}: status=${t.status}, start=${t.taskStartDate ? t.taskStartDate.toISOString().split('T')[0] : "null"}, due=${t.taskDueDate ? t.taskDueDate.toISOString().split('T')[0] : "null"}, est=${t.estimatedHours}`);
  });

  console.log("\n=== Numerical List of Speaking Tasks (Days 95 to 100) ===");
  tasks.slice(94, 100).forEach(t => {
    console.log(`- ${t.taskName}: status=${t.status}, start=${t.taskStartDate ? t.taskStartDate.toISOString().split('T')[0] : "null"}, due=${t.taskDueDate ? t.taskDueDate.toISOString().split('T')[0] : "null"}, est=${t.estimatedHours}`);
  });

  process.exit(0);
}

verify();

import "dotenv/config";
import mongoose from "mongoose";
import { Task } from "../models/task.model.js";
import connectDB from "../config/db.config.js";

async function verify() {
  await connectDB();

  const speakingParentId = "69e5139e075177f2937347d4";
  const writingParentId = "69e5139f075177f29373483b";

  // Load all tasks
  const speakingTasks = await Task.find({ parentTask: speakingParentId }).lean();
  const writingTasks = await Task.find({ parentTask: writingParentId }).lean();

  console.log(`Speaking Tasks Count: ${speakingTasks.length}`);
  console.log(`Writing Tasks Count: ${writingTasks.length}`);

  let speakingFailures = 0;
  let writingFailures = 0;

  // Verify Speaking Tasks
  for (const t of speakingTasks) {
    const isDone = t.status === "done";
    const hasDesc = t.taskDescription && t.taskDescription.includes("Speak about");
    const hasCorrectEst = t.estimatedHours === 0.5;

    if (!hasDesc || !hasCorrectEst) {
      console.error(`Speaking failure: ${t.taskName} (status: ${t.status}, hasDesc: ${!!hasDesc}, description: "${t.taskDescription}", estHours: ${t.estimatedHours})`);
      speakingFailures++;
    }
  }

  // Verify Writing Tasks
  for (const t of writingTasks) {
    const isDone = t.status === "done";
    const hasDesc = t.taskDescription && t.taskDescription.includes("Write about");
    const hasCorrectEst = t.estimatedHours === 0.5;

    if (!hasDesc || !hasCorrectEst) {
      console.error(`Writing failure: ${t.taskName} (status: ${t.status}, hasDesc: ${!!hasDesc}, description: "${t.taskDescription}", estHours: ${t.estimatedHours})`);
      writingFailures++;
    }
  }

  // Sort numerically for verification log printouts
  const sortFunc = (a, b) => {
    const getDayNum = (name) => {
      if (name.includes("Final Day")) return 100;
      const match = name.match(/Day\s+(\d+)/i);
      return match ? parseInt(match[1]) : 0;
    };
    return getDayNum(a.taskName) - getDayNum(b.taskName);
  };

  speakingTasks.sort(sortFunc);
  writingTasks.sort(sortFunc);

  console.log("\n=== Verified Samples ===");
  for (let i = 0; i < 5; i++) {
    const st = speakingTasks[i];
    const wt = writingTasks[i];
    console.log(`- ${st.taskName}: ${st.taskDescription} (Status: ${st.status}, Date: ${st.taskStartDate ? st.taskStartDate.toISOString().split('T')[0] : "null"})`);
    console.log(`- ${wt.taskName}: ${wt.taskDescription} (Status: ${wt.status}, Date: ${wt.taskStartDate ? wt.taskStartDate.toISOString().split('T')[0] : "null"})`);
  }

  console.log(`\nValidation complete. Speaking Failures: ${speakingFailures}, Writing Failures: ${writingFailures}`);
  process.exit(0);
}

verify();

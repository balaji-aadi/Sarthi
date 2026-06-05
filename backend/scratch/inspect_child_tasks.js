import "dotenv/config";
import mongoose from "mongoose";
import { Task } from "../models/task.model.js";
import connectDB from "../config/db.config.js";

async function inspectChildren() {
  await connectDB();
  const speakingParentId = "69e5139e075177f2937347d4";
  const writingParentId = "69e5139f075177f29373483b";

  console.log("=== SPEAKING CHILDREN ===");
  const speakingTasks = await Task.find({ parentTask: speakingParentId }).lean();
  console.log(`Total children: ${speakingTasks.length}`);
  const firstFewSpeaking = speakingTasks.slice(0, 5);
  for (const t of firstFewSpeaking) {
    console.log(`- ${t.taskName} (status: ${t.status}, startDate: ${t.taskStartDate}, dueDate: ${t.taskDueDate}, estimatedHours: ${t.estimatedHours}, backlogHours: ${t.backlogEstimatedHours})`);
  }

  console.log("\n=== WRITING CHILDREN ===");
  const writingTasks = await Task.find({ parentTask: writingParentId }).lean();
  console.log(`Total children: ${writingTasks.length}`);
  const firstFewWriting = writingTasks.slice(0, 5);
  for (const t of firstFewWriting) {
    console.log(`- ${t.taskName} (status: ${t.status}, startDate: ${t.taskStartDate}, dueDate: ${t.taskDueDate}, estimatedHours: ${t.estimatedHours}, backlogHours: ${t.backlogEstimatedHours})`);
  }

  // Check if there are other english tasks in the backlog
  const allEnglishTasks = await Task.find({ projectName: "69d77b7c6d3910f342f3762e" }).lean();
  const notChildren = allEnglishTasks.filter(t => !t.parentTask);
  console.log(`\nAll English tasks: ${allEnglishTasks.length}`);
  console.log(`Without parents: ${notChildren.length}`);

  // Count by parent and status
  const parentsMap = {};
  for (const t of allEnglishTasks) {
    const parentKey = t.parentTask ? String(t.parentTask) : "none";
    if (!parentsMap[parentKey]) {
      parentsMap[parentKey] = { total: 0, status: {} };
    }
    parentsMap[parentKey].total++;
    parentsMap[parentKey].status[t.status] = (parentsMap[parentKey].status[t.status] || 0) + 1;
  }
  console.log("\nParent task statistics:", parentsMap);

  process.exit(0);
}

inspectChildren();

import "dotenv/config";
import mongoose from "mongoose";
import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";
import connectDB from "../config/db.config.js";

async function analyze() {
  await connectDB();
  const projectId = "69d77b7c6d3910f342f3762e";

  // Find all tasks in this project
  const tasks = await Task.find({ projectName: projectId }).lean();
  console.log(`Total tasks in English project: ${tasks.length}`);

  // Find tasks without parentTask (potential parent tasks or standalone tasks)
  const parents = tasks.filter(t => !t.parentTask);
  console.log(`\nPotential Parent/Standalone Tasks (${parents.length}):`);
  for (const p of parents) {
    const children = tasks.filter(t => String(t.parentTask) === String(p._id));
    console.log(`- ${p.taskName} (ID: ${p._id}, taskId: ${p.taskId}, status: ${p.status}, children count: ${children.length})`);
  }

  // Print statuses of all tasks
  const statusCounts = {};
  tasks.forEach(t => {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  });
  console.log("\nStatus distribution:", statusCounts);

  process.exit(0);
}

analyze();

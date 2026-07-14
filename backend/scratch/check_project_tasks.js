import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.config.js";
import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";

async function run() {
  await connectDB();
  const projectId = new mongoose.Types.ObjectId("6a30c5bcf7cfd43d78e67bf8");
  const project = await Project.findById(projectId);
  console.log(`Project: "${project.name}" (ID: ${project._id})`);
  console.log(`- Current Progress: ${project.progress}%`);
  
  const allTasks = await Task.find({ projectName: projectId });
  console.log(`Total tasks in project: ${allTasks.length}`);
  
  const parents = allTasks.filter(t => !t.parentTask);
  const children = allTasks.filter(t => t.parentTask);
  
  console.log(`- Parent tasks count: ${parents.length}`);
  console.log(`- Child tasks count: ${children.length}`);
  
  process.exit(0);
}

run().catch(console.error);

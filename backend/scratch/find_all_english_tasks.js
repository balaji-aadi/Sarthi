import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.config.js";

async function run() {
  await connectDB();
  const db = mongoose.connection.db;

  const projectId = new mongoose.Types.ObjectId("69d77b7c6d3910f342f3762e");

  // 1. Get the project details
  const project = await db.collection("projects").findOne({ _id: projectId });
  console.log("PROJECT DETAILS:");
  console.log(JSON.stringify(project, null, 2));

  // 2. Find all tasks with this project ID
  const tasks = await db.collection("tasks").find({ projectName: projectId }).toArray();
  console.log(`\nFound ${tasks.length} tasks in project "${project.name}" (${projectId}):`);

  // Log all tasks and their relations
  tasks.forEach((t, i) => {
    console.log(`${i+1}. [${t.status}] ${t.taskName} | ID: ${t._id} | parentTask: ${t.parentTask || 'NONE'}`);
  });

  // Let's also check if there are tasks with taskName containing "English" but under other project IDs
  const otherEnglishTasks = await db.collection("tasks").find({
    projectName: { $ne: projectId },
    taskName: /English/i
  }).toArray();
  console.log(`\nFound ${otherEnglishTasks.length} tasks matching "English" in OTHER projects:`);
  otherEnglishTasks.forEach(t => {
    console.log(`- ${t.taskName} | Project: ${t.projectName} | ID: ${t._id}`);
  });

  process.exit(0);
}

run().catch(console.error);

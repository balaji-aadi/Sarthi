import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.config.js";

async function run() {
  await connectDB();
  const db = mongoose.connection.db;

  console.log("Searching Projects...");
  const projects = await db.collection("projects").find({ name: /English/i }).toArray();
  projects.forEach(p => {
    console.log(`- Project: ${p.name} | ID: ${p._id} | Key: ${p.key}`);
  });

  console.log("\nSearching Epics...");
  const epics = await db.collection("epics").find({ name: /English/i }).toArray();
  epics.forEach(e => {
    console.log(`- Epic: ${e.name} | ID: ${e._id} | Project: ${e.project}`);
  });

  console.log("\nSearching Root Tasks (no parentTask)...");
  const rootTasks = await db.collection("tasks").find({
    taskName: /English/i,
    parentTask: null
  }).toArray();
  rootTasks.forEach(t => {
    console.log(`- Task: ${t.taskName} | ID: ${t._id} | Project: ${t.projectName} | Epic: ${t.epic} | taskId: ${t.taskId}`);
  });

  console.log("\nSearching all tasks that might have epic fields matching...");
  const tasksWithEpic = await db.collection("tasks").find({ epic: { $exists: true } }).toArray();
  console.log(`Found ${tasksWithEpic.length} tasks with an epic field.`);

  // Let's print unique epic IDs references from tasks
  const epicIdsInTasks = [...new Set(tasksWithEpic.map(t => String(t.epic)))];
  console.log("Unique epic IDs referenced in tasks:", epicIdsInTasks);

  process.exit(0);
}

run().catch(console.error);

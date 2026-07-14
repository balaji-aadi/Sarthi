import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.config.js";
import { Task } from "../models/task.model.js";

async function run() {
  await connectDB();
  const projectId = new mongoose.Types.ObjectId("6a30c5bcf7cfd43d78e67bf8");
  const parents = await Task.find({ projectName: projectId, parentTask: null });
  console.log("Parent Tasks:");
  for (const parent of parents) {
    const children = await Task.find({ parentTask: parent._id });
    console.log(`- ID: ${parent._id}, taskName: "${parent.taskName}", taskId: "${parent.taskId}", childrenCount: ${children.length}`);
  }
  process.exit(0);
}

run().catch(console.error);

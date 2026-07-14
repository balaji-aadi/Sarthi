import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.config.js";
import { Task } from "../models/task.model.js";
import { Note } from "../models/note.model.js";
import { FocusSession } from "../models/focusSession.model.js";

async function run() {
  await connectDB();
  const targetParentNames = ["Docker", "Nginx", "CI/CD & GitHub Actions", "C++"];
  const projectId = new mongoose.Types.ObjectId("6a30c5bcf7cfd43d78e67bf8");

  const parents = await Task.find({ projectName: projectId, taskName: { $in: targetParentNames } });
  
  console.log(`Found ${parents.length} parents to inspect.`);

  for (const parent of parents) {
    const children = await Task.find({ parentTask: parent._id });
    const allTaskIds = [parent._id, ...children.map(c => c._id)];

    const notesCount = await Note.countDocuments({
      $or: [
        { taskId: { $in: allTaskIds } },
        { taskIds: { $in: allTaskIds } }
      ]
    });

    const sessionsCount = await FocusSession.countDocuments({
      task: { $in: allTaskIds }
    });

    console.log(`\nParent: "${parent.taskName}" (ID: ${parent._id}, taskId: "${parent.taskId}")`);
    console.log(`- Children count: ${children.length}`);
    console.log(`- Referencing Notes count: ${notesCount}`);
    console.log(`- Referencing Focus Sessions count: ${sessionsCount}`);
  }

  process.exit(0);
}

run().catch(console.error);

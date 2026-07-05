import "dotenv/config";
import mongoose from "mongoose";
import { Task } from "../models/task.model.js";
import connectDB from "../config/db.config.js";

async function inspect() {
    await connectDB();
    const parentId = "69e75052c05bf5f0580b8085";

    const parent = await Task.findById(parentId).lean();
    console.log("=== PARENT TASK ===");
    console.log("ID:", parent._id);
    console.log("Title (taskHeading):", parent.taskHeading);
    console.log("Status:", parent.status);
    console.log("Progress:", parent.progress);
    console.log("SubtaskStats:", parent.subtaskStats);

    const children = await Task.find({ parentTask: parentId }).lean();
    console.log("\n=== CHILD TASKS ===");
    console.log("Total children found:", children.length);
    children.forEach((c, idx) => {
        console.log(`${idx + 1}. [${c.status}] ID: ${c._id}, Title: "${c.taskHeading || c.title}", Progress: ${c.progress}%, Parent ID: ${c.parentTask}`);
    });

    process.exit(0);
}

inspect();

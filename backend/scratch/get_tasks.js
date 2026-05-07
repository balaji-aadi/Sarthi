import "dotenv/config";
import mongoose from "mongoose";
import { Task } from "../models/task.model.js";
import connectDB from "../config/db.config.js";

async function getTasks() {
    await connectDB();
    const projectIds = ["69d7788e6d3910f342f371d9", "69d77b7c6d3910f342f3762e"];
    
    // Fetch all tasks for these projects
    const tasks = await Task.find({ 
        projectName: { $in: projectIds },
        status: { $in: ["todo", "backlog", "inprogress"] } // "remaining" usually means not done
    }).sort({ taskStartDate: 1 }).lean();

    console.log(JSON.stringify(tasks, null, 2));
    process.exit(0);
}

getTasks();

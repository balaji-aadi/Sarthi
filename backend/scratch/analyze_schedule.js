import "dotenv/config";
import mongoose from "mongoose";
import { Task } from "../models/task.model.js";
import connectDB from "../config/db.config.js";

async function analyzeSchedule() {
    await connectDB();
    const projectIds = ["69d7788e6d3910f342f371d9", "69d77b7c6d3910f342f3762e"];
    
    // Fetch all tasks
    const tasks = await Task.find({ 
        projectName: { $in: projectIds },
        status: { $in: ["todo", "backlog", "inprogress"] }
    }).sort({ taskStartDate: 1 }).lean();

    const parentTasks = tasks.filter(t => !t.parentTask);
    const childTasks = tasks.filter(t => t.parentTask);

    const topics = parentTasks.map(p => {
        const children = childTasks.filter(c => c.parentTask.toString() === p._id.toString());
        return {
            id: p._id,
            name: p.taskName,
            projectName: p.projectName,
            currentStart: p.taskStartDate,
            currentDue: p.taskDueDate,
            children: children.map(c => ({
                id: c._id,
                name: c.taskName,
                start: c.taskStartDate,
                due: c.taskDueDate
            }))
        };
    });

    console.log(JSON.stringify(topics, null, 2));
    process.exit(0);
}

analyzeSchedule();

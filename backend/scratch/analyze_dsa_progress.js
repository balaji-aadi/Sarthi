import "dotenv/config";
import mongoose from "mongoose";
import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";
import connectDB from "../config/db.config.js";

async function analyze() {
    await connectDB();
    const projectId = "69d7788e6d3910f342f371d9";

    const project = await Project.findById(projectId);
    console.log("=== PROJECT ===");
    console.log("Name:", project.name);
    console.log("Progress stored in Project model:", project.progress);

    // Fetch all tasks
    const allTasks = await Task.find({ projectName: projectId }).lean();
    console.log("\nTotal tasks in database for this project:", allTasks.length);

    const nonCompleted = allTasks.filter(t => t.status !== "done");
    console.log("Tasks not completed (status !== 'done'):", nonCompleted.length);
    if (nonCompleted.length > 0) {
        console.log("List of non-completed tasks:");
        nonCompleted.forEach(t => {
            console.log(`- [${t.status}] ID: ${t._id}, Title: "${t.taskHeading}", Parent ID: ${t.parentTask}, Progress: ${t.progress}%, Subtasks:`, t.subtaskStats);
        });
    }

    const non100Progress = allTasks.filter(t => t.progress !== 100);
    console.log("\nTasks with progress !== 100%:", non100Progress.length);
    if (non100Progress.length > 0) {
        console.log("List of tasks with < 100% progress:");
        non100Progress.forEach(t => {
            console.log(`- [${t.status}] ID: ${t._id}, Title: "${t.taskHeading}", Parent ID: ${t.parentTask}, Progress: ${t.progress}%, Subtasks:`, t.subtaskStats);
        });
    }

    // Check top-level tasks
    const topLevelTasks = allTasks.filter(t => !t.parentTask);
    console.log("\n=== TOP-LEVEL TASKS ===");
    topLevelTasks.forEach(t => {
        console.log(`- [${t.status}] "${t.taskHeading}" - Progress: ${t.progress}%, Subtasks completed:`, t.subtaskStats);
    });

    const sumProgress = topLevelTasks.reduce((sum, t) => sum + (t.progress || 0), 0);
    const avgProgress = topLevelTasks.length > 0 ? sumProgress / topLevelTasks.length : 0;
    console.log(`\nAverage progress of top-level tasks: ${avgProgress.toFixed(2)}% (rounded: ${Math.round(avgProgress)}%)`);

    process.exit(0);
}

analyze();

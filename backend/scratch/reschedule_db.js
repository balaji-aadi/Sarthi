import "dotenv/config";
import mongoose from "mongoose";
import { Task } from "../models/task.model.js";
import connectDB from "../config/db.config.js";

async function reschedule() {
    await connectDB();

    const dsaId = "69d7788e6d3910f342f371d9";
    const espId = "69d77b7c6d3910f342f3762e";

    console.log("Starting rescheduling process...");

    // 1. DSA Project Rescheduling
    await rescheduleDSA(dsaId);

    // 2. ESP Project Rescheduling
    await rescheduleESP(espId);

    console.log("Rescheduling completed successfully.");
    process.exit(0);
}

async function rescheduleDSA(projectId) {
    console.log("--- Rescheduling DSA ---");
    // Fetch all parent tasks (topics) that are not done
    const parentTasks = await Task.find({
        projectName: projectId,
        parentTask: null,
        status: { $in: ["todo", "backlog", "inprogress"] }
    }).sort({ taskStartDate: 1 });

    let currentRefDate = new Date("2026-05-12T00:00:00Z"); // May 12

    for (let i = 0; i < parentTasks.length; i++) {
        const parent = parentTasks[i];
        let newStart, newEnd;

        if (parent.taskName.includes("Kadane")) {
            // Kadane ends on May 12
            const originalDuration = parent.taskDueDate - parent.taskStartDate;
            newEnd = new Date("2026-05-12T00:00:00Z");
            newStart = new Date(newEnd.getTime() - originalDuration);
            console.log(`Setting Kadane's Algorithm to end on ${newEnd.toISOString()}`);
        } else {
            // Subsequent topics start after 2 days gap
            // Previous end date is stored in currentRefDate
            newStart = new Date(currentRefDate.getTime() + (1 + 2) * 24 * 60 * 60 * 1000); // 1 day after + 2 days gap
            const originalDuration = parent.taskDueDate - parent.taskStartDate;
            newEnd = new Date(newStart.getTime() + originalDuration);
            console.log(`Setting ${parent.taskName} to ${newStart.toISOString()} - ${newEnd.toISOString()}`);
        }

        const shift = newStart.getTime() - parent.taskStartDate.getTime();

        // Update Parent
        await Task.findByIdAndUpdate(parent._id, {
            taskStartDate: newStart,
            taskDueDate: newEnd
        });

        // Update Children
        const children = await Task.find({ parentTask: parent._id });
        for (const child of children) {
            const childNewStart = new Date(child.taskStartDate.getTime() + shift);
            const childNewDue = new Date(child.taskDueDate.getTime() + shift);
            await Task.findByIdAndUpdate(child._id, {
                taskStartDate: childNewStart,
                taskDueDate: childNewDue
            });
        }

        // Update ref date for next topic
        currentRefDate = newEnd;
    }
}

async function rescheduleESP(projectId) {
    console.log("--- Rescheduling ESP ---");
    const targetDate = new Date("2026-05-12T00:00:00Z");

    // Helper to shift a series
    const shiftSeries = async (pattern, startDay) => {
        const tasks = await Task.find({
            projectName: projectId,
            taskName: new RegExp(pattern, "i"),
            status: { $in: ["todo", "backlog", "inprogress"] }
        }).sort({ taskName: 1 });

        let shift = 0;
        let day17Found = false;

        for (const task of tasks) {
            if (task.taskName.includes(`Day ${startDay}`)) {
                shift = targetDate.getTime() - task.taskStartDate.getTime();
                day17Found = true;
            }

            if (day17Found) {
                const newStart = new Date(task.taskStartDate.getTime() + shift);
                const newDue = new Date(task.taskDueDate.getTime() + shift);
                await Task.findByIdAndUpdate(task._id, {
                    taskStartDate: newStart,
                    taskDueDate: newDue
                });
                console.log(`Updated ${task.taskName} to start on ${newStart.toISOString()}`);
            }
        }
    };

    await shiftSeries("Speaking Practice Day", 17);
    await shiftSeries("Writing Practice Day", 17);

    // Udisha Pronunciation
    const pronunciationTask = await Task.findOne({
        projectName: projectId,
        taskName: /Pronunciation/i
    });

    if (pronunciationTask) {
        const shift = targetDate.getTime() - pronunciationTask.taskStartDate.getTime();
        const newStart = new Date(pronunciationTask.taskStartDate.getTime() + shift);
        const newDue = new Date(pronunciationTask.taskDueDate.getTime() + shift);
        
        await Task.findByIdAndUpdate(pronunciationTask._id, {
            taskStartDate: newStart,
            taskDueDate: newDue
        });
        console.log(`Updated Pronunciation to start on ${newStart.toISOString()}`);

        // Shift siblings if any? User said "continue as like the streak"
        // Let's find other children of the same parent
        const siblings = await Task.find({
            parentTask: pronunciationTask.parentTask,
            _id: { $ne: pronunciationTask._id },
            taskStartDate: { $gt: pronunciationTask.taskStartDate }
        }).sort({ taskStartDate: 1 });

        for (const sibling of siblings) {
            const sNewStart = new Date(sibling.taskStartDate.getTime() + shift);
            const sNewDue = new Date(sibling.taskDueDate.getTime() + shift);
            await Task.findByIdAndUpdate(sibling._id, {
                taskStartDate: sNewStart,
                taskDueDate: sNewDue
            });
            console.log(`Updated sibling ${sibling.taskName} to start on ${sNewStart.toISOString()}`);
        }
    }
}

reschedule();

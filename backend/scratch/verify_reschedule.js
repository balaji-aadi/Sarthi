import "dotenv/config";
import mongoose from "mongoose";
import { Task } from "../models/task.model.js";
import connectDB from "../config/db.config.js";

async function verify() {
    await connectDB();
    
    const kadane = await Task.findOne({ taskName: /Kadane/i });
    console.log(`Kadane's Algorithm: ${kadane.taskStartDate.toISOString()} - ${kadane.taskDueDate.toISOString()}`);

    const nextDSA = await Task.findOne({ taskName: /String Matching/i });
    console.log(`String Matching: ${nextDSA.taskStartDate.toISOString()} - ${nextDSA.taskDueDate.toISOString()}`);

    const speaking17 = await Task.findOne({ taskName: /Speaking Practice Day 17/i });
    console.log(`Speaking Practice Day 17: ${speaking17.taskStartDate.toISOString()}`);

    const writing17 = await Task.findOne({ taskName: /Writing Practice Day 17/i });
    console.log(`Writing Practice Day 17: ${writing17.taskStartDate.toISOString()}`);

    const pronun = await Task.findOne({ taskName: /Pronunciation/i });
    console.log(`Pronunciation: ${pronun.taskStartDate.toISOString()}`);

    process.exit(0);
}

verify();

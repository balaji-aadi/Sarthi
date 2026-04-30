import mongoose from "mongoose";
import dotenv from "dotenv";
import { FocusSession } from "../models/focusSession.model.js";
import { PerformanceStat } from "../models/performanceStat.model.js";

dotenv.config();

const testDates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const sessions = await FocusSession.find({});
        sessions.forEach(s => {
            console.log(`FocusSession id: ${s._id}, date: ${s.date}, startTime: ${s.startTime}`);
        });
        
        const stats = await PerformanceStat.find({ entityType: 'user', period: 'daily' });
        stats.forEach(s => {
            console.log(`PerformanceStat id: ${s._id}, date: ${s.date}, hours: ${s.metrics?.hoursLogged}`);
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

testDates();

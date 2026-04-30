import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import { FocusSession } from "../models/focusSession.model.js";
import { PerformanceStat } from "../models/performanceStat.model.js";
import AnalyticsService from "../services/analytics-service/analytics.service.js";

dotenv.config();

const testFocusSync = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log("DB connected. Fetching focus sessions...");
        const sessions = await FocusSession.find({});
        console.log(`Found ${sessions.length} sessions`);
        
        // Let's check the date of the "yesterday" 4 hour session (Apr 29)
        const apr29Sessions = sessions.filter(s => s.date && new Date(s.date).getDate() === 29);
        console.log(`Found ${apr29Sessions.length} sessions for Apr 29`);
        
        const totalDuration = apr29Sessions.reduce((acc, s) => acc + s.duration, 0);
        console.log(`Total duration for Apr 29: ${totalDuration} minutes (${(totalDuration / 60).toFixed(2)} hours)`);
        
        // Let's check the PerformanceStat for Apr 29 daily
        const apr29Date = new Date("2026-04-29T00:00:00.000Z");
        
        const stats = await PerformanceStat.find({
            entityType: "user",
            period: "daily",
            date: { $gte: new Date("2026-04-29T00:00:00.000Z"), $lte: new Date("2026-04-29T23:59:59.000Z") }
        });
        console.log("Stats found for Apr 29 daily:");
        stats.forEach(s => {
            console.log(`User: ${s.entityId}, Date: ${s.date}, HoursLogged: ${s.metrics.hoursLogged}`);
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

testFocusSync();

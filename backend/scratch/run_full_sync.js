import mongoose from "mongoose";
import dotenv from "dotenv";
import AnalyticsService from "../services/analytics-service/analytics.service.js";

dotenv.config();

const runSync = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Connected. Starting full sync...");
        
        const result = await AnalyticsService.syncAllExistingData();
        console.log("Sync complete! Result:", result);
        
        process.exit(0);
    } catch (error) {
        console.error("Error during sync:", error);
        process.exit(1);
    }
};

runSync();

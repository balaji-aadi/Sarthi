import "dotenv/config";
import connectDB from "../config/db.config.js";
import { repairAllProgress } from "../services/progress-service/repairProgress.js";

async function run() {
    process.env.RUN_REPAIR = "true";
    console.log("Connecting to DB...");
    await connectDB();
    console.log("Starting repairAllProgress...");
    await repairAllProgress();
    console.log("Repair finished!");
    process.exit(0);
}

run();

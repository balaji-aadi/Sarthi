import "dotenv/config";
import connectDB from "../config/db.config.js";
import { ProgressService } from "../services/progress-service/progress.service.js";

async function test() {
    try {
        console.log("Connecting to DB...");
        await connectDB();
        
        console.log("Updating parent task 69e75052c05bf5f0580b8085 progress...");
        await ProgressService.updateParentTaskProgress("69e75052c05bf5f0580b8085");
        
        console.log("Updating project 69d7788e6d3910f342f371d9 progress...");
        await ProgressService.updateProjectProgress("69d7788e6d3910f342f371d9");
        
        console.log("Successfully ran updates!");
    } catch (e) {
        console.error("Error running updates:", e);
    }
    process.exit(0);
}

test();

import { Task } from "../../models/task.model.js";
import { Project } from "../../models/project.model.js";
import { ProgressService } from "./progress.service.js";

/**
 * One-time repair script to synchronize status and progress across all tasks and projects.
 * Fixes issues where "Done" tasks were stuck at 0% progress.
 * Enforced guard to avoid heavy collection scans and DB query thrashing on every dev server restart.
 */
export const repairAllProgress = async () => {
    // Only run if explicitly requested in environment variables.
    // This saves 10-20s of startup time and prevents MongoDB Atlas throttling on nodemon restarts.
    if (process.env.RUN_REPAIR !== "true") {
        console.log("[Repair] Skipping heavy database progress repair on startup. (Set RUN_REPAIR=true in .env to enable)");
        return;
    }

    console.log("[Repair] Starting progress repair cleanup...");
    try {
        // 1. Sync all "done" tasks to 100% progress
        const doneResult = await Task.updateMany(
            { status: "done", progress: { $ne: 100 } },
            { $set: { progress: 100 } }
        );
        console.log(`[Repair] Synchronized ${doneResult.modifiedCount} "done" tasks to 100% progress.`);

        // 2. Reset all "todo" tasks to 0% progress if they were inadvertently set
        const todoResult = await Task.updateMany(
            { status: "todo", progress: { $ne: 0 } },
            { $set: { progress: 0 } }
        );
        console.log(`[Repair] Reset ${todoResult.modifiedCount} "todo" tasks to 0% progress.`);

        // 3. Force update parent task rollups
        // Find all tasks that ARE parents
        const parents = await Task.distinct("parentTask", { parentTask: { $ne: null } });
        console.log(`[Repair] Re-rolling up progress for ${parents.length} parent tasks in parallel...`);
        
        // Execute updates in parallel to prevent sequential database roundtrip blocks
        await Promise.all(parents.map(parentId => 
            ProgressService.updateParentTaskProgress(parentId)
                .catch(err => console.error(`[Repair] Error rolling up progress for parent ${parentId}:`, err))
        ));

        // 4. Recalculate all Project progress
        const projects = await Project.find({});
        console.log(`[Repair] Recalculating overall progress for ${projects.length} projects in parallel...`);
        
        await Promise.all(projects.map(project => 
            ProgressService.updateProjectProgress(project._id)
                .catch(err => console.error(`[Repair] Error updating project progress for ${project._id}:`, err))
        ));

        console.log("[Repair] Progress repair cleanup completed successfully.");
    } catch (error) {
        console.error("[Repair] Critical error during progress repair:", error);
    }
};

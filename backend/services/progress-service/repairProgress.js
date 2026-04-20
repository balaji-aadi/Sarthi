import { Task } from "../../models/task.model.js";
import { Project } from "../../models/project.model.js";
import { ProgressService } from "./progress.service.js";

/**
 * One-time repair script to synchronize status and progress across all tasks and projects.
 * Fixes issues where "Done" tasks were stuck at 0% progress.
 */
export const repairAllProgress = async () => {
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
        console.log(`[Repair] Re-rolling up progress for ${parents.length} parent tasks...`);
        for (const parentId of parents) {
            await ProgressService.updateParentTaskProgress(parentId);
        }

        // 4. Recalculate all Project progress
        const projects = await Project.find({});
        console.log(`[Repair] Recalculating overall progress for ${projects.length} projects...`);
        for (const project of projects) {
            await ProgressService.updateProjectProgress(project._id);
        }

        console.log("[Repair] Progress repair cleanup completed successfully.");
    } catch (error) {
        console.error("[Repair] Critical error during progress repair:", error);
    }
};

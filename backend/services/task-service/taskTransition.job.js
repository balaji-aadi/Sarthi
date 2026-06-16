import cron from 'node-cron';
import { Task } from '../../models/task.model.js';
import mongoose from 'mongoose';

/**
 * Initializes the task status transition job.
 * Runs every hour to check for expired tasks.
 */
export const initTaskTransitionJob = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        console.log('[Cron] Running Task Transition Job...');
        await checkAndTransitionTasks();
    });

    // Run once on startup
    checkAndTransitionTasks();
};

import { ProgressService } from '../progress-service/progress.service.js';

/**
 * Finds tasks past their due date and moves them to backlog.
 */
export const checkAndTransitionTasks = async () => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        
        // Find tasks where:
        // 1. Due date is before today (meaning the deadline has passed)
        // 2. Status is not 'done' and not 'backlog'
        const tasksToTransition = await Task.find({
            taskDueDate: { $lt: startOfToday },
            status: { $nin: ['done', 'backlog', 'inprogress', 'hold'] }
        });

        if (tasksToTransition.length === 0) {
            return;
        }

        console.log(`[Cron] Transitioning ${tasksToTransition.length} tasks to backlog...`);

        for (const task of tasksToTransition) {
            const oldStatus = task.status;
            task.status = 'backlog';
            task.progress = Math.min(task.progress, 90); // Cap progress when backlogged? No, keep it.
            
            // Add activity log
            task.activityLogs.unshift({
                oldStatus: oldStatus,
                currentStatus: 'backlog',
                user: null, // System action
                date: new Date(),
                message: `Task automatically moved to Backlog due to expired due date (${task.taskDueDate.toLocaleDateString()})`,
            });

            await task.save();

            // Cascading Progress Updates for automatic transitions
            try {
                if (task.parentTask) await ProgressService.updateParentTaskProgress(task.parentTask);
                if (task.milestone) await ProgressService.updateMilestoneProgress(task.milestone);
                if (task.projectName) await ProgressService.updateProjectProgress(task.projectName);
                if (task.sprint) await ProgressService.updateSprintProgress(task.sprint);
            } catch (pErr) {
                console.error(`[Cron] Progress update error for task ${task._id}:`, pErr);
            }

            console.log(`[Cron] Task ${task.taskId || task._id} moved to backlog.`);
        }
    } catch (error) {
        console.error('[Cron] Error in task transition process:', error);
    }
};

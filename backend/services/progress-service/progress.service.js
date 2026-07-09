import { Task } from "../../models/task.model.js";
import { Milestone } from "../../models/milestone.model.js";
import { Project } from "../../models/project.model.js";

export const ProgressService = {
  /**
   * Recalculates the progress of a parent task based on its immediate children.
   * If the parent also has a parent, it recurses up.
   * @param {string} parentId 
   */
  async updateParentTaskProgress(parentId) {
    if (!parentId) return;

    // 1. Get all subtasks of this parent
    const subtasks = await Task.find({ parentTask: parentId });
    
    // 2. Calculate Stats
    const totalSubtasks = subtasks.length;
    const completedSubtasks = totalSubtasks > 0 ? subtasks.filter(t => t.status === 'done').length : 0;
    const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    // 3. Update Parent Task
    const parent = await Task.findByIdAndUpdate(
      parentId, 
      { 
        progress: progress,
        subtaskStats: {
            total: totalSubtasks,
            completed: completedSubtasks
        }
      },
      { new: true }
    );

    // 4. Recurse up if this parent also has a parent
    if (parent && parent.parentTask) {
        await this.updateParentTaskProgress(parent.parentTask);
    }
  },

  /**
   * Recalculates Milestone progress based on TOP-LEVEL tasks linked to it.
   * @param {string} milestoneId 
   */
  async updateMilestoneProgress(milestoneId) {
    if (!milestoneId) return;

    // Try top-level tasks first
    let tasks = await Task.find({ 
        milestone: milestoneId, 
        parentTask: null 
    });
    
    // If no top-level tasks, fallback to all tasks in milestone
    if (tasks.length === 0) {
        tasks = await Task.find({ milestone: milestoneId });
    }

    if (tasks.length === 0) return;

    const totalProgress = tasks.reduce((sum, task) => sum + (task.progress || 0), 0);
    const averageProgress = Math.round(totalProgress / tasks.length);

    await Milestone.findByIdAndUpdate(milestoneId, { progress: averageProgress });
  },

  /**
   * Recalculates Project progress based on TOP-LEVEL tasks.
   * @param {string} projectId 
   */
  async updateProjectProgress(projectId) {
      if (!projectId) return;

      // Try top-level tasks first
      let result = await Task.aggregate([
          { 
              $match: { 
                  projectName: new mongoose.Types.ObjectId(projectId),
                  parentTask: null 
              } 
          },
          {
              $group: {
                  _id: null,
                  avgProgress: { $avg: "$progress" }
              }
          }
      ]);

      if (result.length === 0) {
          // Fallback: If no top-level tasks, count ALL tasks for this project
          result = await Task.aggregate([
              { $match: { projectName: new mongoose.Types.ObjectId(projectId) } },
              { $group: { _id: null, avgProgress: { $avg: "$progress" } } }
          ]);
      }

      const projectProgress = result.length > 0 ? Math.round(result[0].avgProgress) : 0;
      
      const project = await Project.findById(projectId);
      if (project) {
          const updateData = { progress: projectProgress };
          if (projectProgress === 100) {
              updateData.status = "completed";
              updateData.completedAt = await this.getActualProjectCompletionDate(projectId);
          } else {
              if (project.status === "completed") {
                  updateData.status = "active";
              }
              updateData.completedAt = null;
          }
          await Project.findByIdAndUpdate(projectId, updateData);
      }
  },
  /**
   * Finds the actual completion date of a project by looking at the last status transition to "done"
   * in its tasks' activity logs, with robust fallbacks.
   * @param {string} projectId
   */
  async getActualProjectCompletionDate(projectId) {
      const { Task } = await import("../../models/task.model.js");
      const tasks = await Task.find({ projectName: projectId, status: "done" });
      
      let latestCompletionDate = null;
      
      for (const task of tasks) {
          // 1. Try to find the latest "done" log entry in activityLogs
          if (task.activityLogs && Array.isArray(task.activityLogs)) {
              for (const log of task.activityLogs) {
                  if (log.currentStatus === "done" && log.date) {
                      const logDate = new Date(log.date);
                      if (!latestCompletionDate || logDate > latestCompletionDate) {
                          latestCompletionDate = logDate;
                      }
                  }
              }
          }
      }
      
      // 2. If no done logs found, fallback to the latest leaf task updatedAt
      if (!latestCompletionDate) {
          const leafTasks = tasks.filter(t => !t.subtaskStats || !t.subtaskStats.total);
          if (leafTasks.length > 0) {
              const latestLeaf = leafTasks.reduce((latest, current) => {
                  return (!latest || current.updatedAt > latest.updatedAt) ? current : latest;
              }, null);
              if (latestLeaf) {
                  latestCompletionDate = latestLeaf.updatedAt;
              }
          }
      }
      
      // 3. Absolute fallback
      if (!latestCompletionDate && tasks.length > 0) {
          const latestTask = tasks.reduce((latest, current) => {
              return (!latest || current.updatedAt > latest.updatedAt) ? current : latest;
          }, null);
          latestCompletionDate = latestTask ? latestTask.updatedAt : null;
      }
      
      return latestCompletionDate || new Date();
  },
  /**
   * Recalculates Sprint progress based on TOP-LEVEL tasks.
   * @param {string} sprintId 
   */
  async updateSprintProgress(sprintId) {
      if (!sprintId) return;

      const result = await Task.aggregate([
          { 
              $match: { 
                  sprint: new mongoose.Types.ObjectId(sprintId),
                  parentTask: null 
              } 
          },
          {
              $group: {
                  _id: null,
                  avgProgress: { $avg: "$progress" }
              }
          }
      ]);

      const sprintProgress = result.length > 0 ? Math.round(result[0].avgProgress) : 0;
      
      // Need to import Sprint model dynamically or adding import at top
      // To avoid circular dependency issues if any, usually valid to import.
      // But let's check imports.
      // I need to add import { Sprint } from "../../models/sprint.model.js"; at the top.
      const { Sprint } = await import("../../models/sprint.model.js");
      await Sprint.findByIdAndUpdate(sprintId, { progress: sprintProgress });
  }
};

import mongoose from "mongoose";

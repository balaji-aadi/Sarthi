import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Task } from "../../models/task.model.js";
import { UserTaskProgress } from "../../models/userTaskProgress.model.js";
import { getAllStarterTemplates } from "../judge/lld/lldTemplateGenerator.js";
import { UniversalJudgeOrchestrator } from "../judge/orchestration/UniversalJudgeOrchestrator.js";

/**
 * Resolves a task by either MongoDB ObjectId or taskId (e.g. LLDP1-P1-V2).
 */
async function findTaskByIdOrTaskId(id) {
  const isObjId = mongoose.Types.ObjectId.isValid(id);
  const query = isObjId
    ? { $or: [{ _id: id }, { taskId: id }] }
    : { taskId: id };
  return Task.findOne(query).lean();
}

/**
 * GET /api/tasks/:id/lld-workspace
 * Returns full task context, starter templates, version timeline, and user progress.
 */
export const getLldWorkspaceContext = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await findTaskByIdOrTaskId(id);

  if (!task) {
    return res.status(404).json(new ApiError(404, `LLD Task "${id}" not found`));
  }

  const nodeType = task.curriculumMeta?.nodeType;
  const isExecutable = nodeType === "drill" || nodeType === "problem_version";
  const userId = req.user?._id;

  let parentProblem = null;
  let siblingVersions = [];
  let currentIndex = -1;
  let previousVersion = null;
  let nextVersion = null;
  let previousVersionCode = null;

  // Handle versioned problem context
  if (nodeType === "problem_version" && task.parentTask) {
    parentProblem = await Task.findById(task.parentTask)
      .select("_id taskId taskName taskDescription curriculumMeta")
      .lean();

    siblingVersions = await Task.find({
      parentTask: task.parentTask,
      taskType: "ProblemVersion"
    })
      .sort({ taskId: 1 })
      .select("_id taskId taskName curriculumMeta")
      .lean();

    currentIndex = siblingVersions.findIndex(
      (v) => v._id.toString() === task._id.toString() || v.taskId === task.taskId
    );

    if (currentIndex > 0) {
      previousVersion = siblingVersions[currentIndex - 1];
    }
    if (currentIndex >= 0 && currentIndex < siblingVersions.length - 1) {
      nextVersion = siblingVersions[currentIndex + 1];
    }

    // Attach user progress to sibling version timeline if authenticated
    if (userId) {
      const siblingProgressList = await UserTaskProgress.find({
        userId,
        taskId: { $in: siblingVersions.map((v) => v._id) }
      }).lean();

      const progressMap = new Map(
        siblingProgressList.map((p) => [p.taskId.toString(), p])
      );

      siblingVersions = siblingVersions.map((v) => {
        const prog = progressMap.get(v._id.toString());
        return {
          ...v,
          userStatus: prog?.status || "todo",
          hasCode: Boolean(prog?.lastSubmittedCode && Object.keys(prog.lastSubmittedCode).length > 0)
        };
      });

      // If previous version exists and has saved code, supply it for carry-forward choice
      if (previousVersion) {
        const prevProg = progressMap.get(previousVersion._id.toString());
        if (prevProg?.lastSubmittedCode) {
          previousVersionCode = prevProg.lastSubmittedCode;
        }
      }
    }
  }

  // Handle drill parent context (Unit)
  let parentUnit = null;
  if (nodeType === "drill" && task.parentTask) {
    parentUnit = await Task.findById(task.parentTask)
      .select("_id taskId taskName taskDescription curriculumMeta")
      .lean();
  }

  // Dynamic starter templates (non-prescriptive, or extracted from drill markdown if present)
  const starterTemplates = getAllStarterTemplates(task);

  // Current user's progress for this specific task
  let userProgress = null;
  if (userId) {
    const rawProgress = await UserTaskProgress.findOne({
      userId,
      taskId: task._id
    }).lean();

    if (rawProgress) {
      userProgress = {
        status: rawProgress.status,
        lastSubmittedCode: rawProgress.lastSubmittedCode || {},
        lastSubmission: rawProgress.lldSubmissions?.slice(-1)[0] || null,
        submissionsCount: rawProgress.lldSubmissions?.length || 0
      };
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        task,
        isExecutable,
        executionMode: isExecutable ? "DIRECT_PROGRAM" : "NONE",
        supportedLanguages: isExecutable ? ["cpp", "python", "java"] : [],
        defaultLanguage: "cpp",
        starterTemplates,
        parentProblem,
        parentUnit,
        versionContext: {
          isVersioned: nodeType === "problem_version",
          currentIndex,
          totalVersions: siblingVersions.length,
          previousVersion,
          nextVersion,
          previousVersionCode,
          allVersions: siblingVersions
        },
        userProgress
      },
      "LLD Workspace context retrieved successfully"
    )
  );
});

/**
 * POST /api/tasks/:id/lld-submit
 * Executes program via DIRECT_PROGRAM, records solve attempt, preserves code snapshot.
 * CRITICAL RULE: Exit 0 does NOT equal automatic problem completion.
 */
export const submitLldTaskProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { language, code } = req.body;

  if (!language || !code) {
    return res.status(400).json(new ApiError(400, "Language and code are required for submission"));
  }

  const task = await findTaskByIdOrTaskId(id);
  if (!task) {
    return res.status(404).json(new ApiError(404, `LLD Task "${id}" not found`));
  }

  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).json(new ApiError(401, "Authentication required to submit"));
  }

  // Execute Direct Program via Universal Judge Orchestrator
  const orchestratorResult = await UniversalJudgeOrchestrator.execute({
    executionMode: "DIRECT_PROGRAM",
    language,
    code,
    executionLimits: {
      timeLimitMs: 5000,
      memoryLimitMb: 256,
      maxOutputBytes: 65536
    }
  });

  // Record attempt in UserTaskProgress strictly scoped by (userId, taskId)
  // NEVER mutate the master Task document
  let progress = await UserTaskProgress.findOne({ userId, taskId: task._id });
  if (!progress) {
    progress = new UserTaskProgress({
      userId,
      taskId: task._id,
      projectName: task.projectName,
      branchId: task.branchId,
      status: "inprogress",
      taskStartDate: new Date()
    });
  } else if (progress.status === "todo") {
    progress.status = "inprogress";
  }

  if (!progress.lastSubmittedCode) {
    progress.lastSubmittedCode = new Map();
  }
  progress.lastSubmittedCode.set(language, code);

  if (!progress.lldSubmissions) {
    progress.lldSubmissions = [];
  }
  progress.lldSubmissions.push({
    language,
    code,
    status: orchestratorResult.status,
    executionTimeMs: orchestratorResult.executionTimeMs || 0,
    stdout: orchestratorResult.stdout || "",
    stderr: orchestratorResult.stderr || "",
    submittedAt: new Date()
  });

  // Note: We deliberately do NOT set progress.status = "done" or progress = 100
  // Process exit 0 means program executed cleanly, not that LLD architecture is certified complete.
  await progress.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        success: true,
        execution: orchestratorResult,
        status: orchestratorResult.status,
        message:
          orchestratorResult.status === "SUCCESS"
            ? "Execution Successful — Attempt Recorded"
            : `Execution Finished with Status: ${orchestratorResult.status}`,
        userProgress: {
          status: progress.status,
          submissionsCount: progress.lldSubmissions.length
        }
      },
      "LLD submission executed and recorded successfully"
    )
  );
});

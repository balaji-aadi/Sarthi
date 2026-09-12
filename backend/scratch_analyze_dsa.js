import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/db.config.js";
import { Project } from "./models/project.model.js";
import { Task } from "./models/task.model.js";
import fs from "fs";

async function analyzeDsaTasks() {
  await connectDB();

  const dsaProjects = await Project.find({
    $or: [
      { name: /dsa/i },
      { key: /dsa/i }
    ]
  }).lean();

  const dsaProjectIds = dsaProjects.map(p => p._id);
  const tasks = await Task.find({
    $or: [
      { projectName: { $in: dsaProjectIds } },
      { taskId: /^DSA/i }
    ]
  }).populate("parentTask", "taskName taskId").populate("projectName", "name key").lean();

  console.log(`Analyzing ${tasks.length} DSA tasks...`);

  let withParent = 0;
  let withoutParent = 0;
  let withDesc = 0;
  let withYoutube = 0;
  let withNotes = 0;
  let withAttachments = 0;
  let withCurriculumMeta = 0;
  let priorities = {};
  let statuses = {};
  let workTypes = {};
  let phases = {};

  let noTopicProblems = [];
  let problemsWithVideo = [];
  let problemsWithoutVideo = [];
  let problemsWithExternalUrl = [];
  let problemsWithoutExternalUrl = [];

  // Inspect problem records
  const inventory = [];

  for (const t of tasks) {
    const isParent = !t.parentTask;
    if (isParent) {
      withoutParent++;
    } else {
      withParent++;
    }

    if (t.taskDescription && t.taskDescription.trim().length > 0) withDesc++;
    if (t.youtubeUrl && t.youtubeUrl.trim().length > 0) withYoutube++;
    if (t.additionalNotes && t.additionalNotes.trim().length > 0) withNotes++;
    if (t.attachments && t.attachments.length > 0) withAttachments++;
    if (t.curriculumMeta && Object.keys(t.curriculumMeta).length > 0) withCurriculumMeta++;

    priorities[t.taskPriority] = (priorities[t.taskPriority] || 0) + 1;
    statuses[t.status] = (statuses[t.status] || 0) + 1;
    workTypes[t.taskType] = (workTypes[t.taskType] || 0) + 1;

    const projName = t.projectName?.name || "Unknown Project";
    phases[projName] = (phases[projName] || 0) + 1;

    // Check if description or additionalNotes has LeetCode link
    const textContent = `${t.taskDescription || ""} ${t.additionalNotes || ""}`;
    const leetcodeMatch = textContent.match(/https?:\/\/(?:www\.)?leetcode\.com[^\s"'>)]+/i);
    const leetcodeUrl = leetcodeMatch ? leetcodeMatch[0] : null;

    if (leetcodeUrl) {
      problemsWithExternalUrl.push(t.taskId);
    } else {
      problemsWithoutExternalUrl.push(t.taskId);
    }

    if (t.youtubeUrl) {
      problemsWithVideo.push(t.taskId);
    } else {
      problemsWithoutVideo.push(t.taskId);
    }

    if (!isParent && !t.parentTask) {
      noTopicProblems.push(t);
    }

    // Try to detect difficulty in text or taskName or curriculumMeta
    let diff = t.curriculumMeta?.difficulty || null;
    if (!diff) {
      const diffMatch = textContent.match(/difficulty\s*[:\-]?\s*(easy|medium|hard)/i) || t.taskName.match(/\b(easy|medium|hard)\b/i);
      if (diffMatch) diff = diffMatch[1];
    }

    inventory.push({
      _id: t._id,
      taskId: t.taskId,
      taskName: t.taskName,
      isTopicParent: isParent,
      phase: projName,
      parentTopic: t.parentTask ? (t.parentTask.taskName || t.parentTask.taskId) : "ROOT_TOPIC",
      status: t.status,
      priority: t.taskPriority,
      workType: t.taskType,
      estimatedHours: t.estimatedHours,
      hasDescription: !!(t.taskDescription && t.taskDescription.trim().length > 0),
      hasNotes: !!(t.additionalNotes && t.additionalNotes.trim().length > 0),
      youtubeUrl: t.youtubeUrl || null,
      leetcodeUrl: leetcodeUrl,
      attachmentsCount: t.attachments ? t.attachments.length : 0,
      detectedDifficulty: diff,
      hasCurriculumMeta: !!t.curriculumMeta?.nodeType
    });
  }

  const report = {
    totalDsaRecords: tasks.length,
    topicParentsCount: withoutParent,
    problemQuestionsCount: withParent,
    stats: {
      withDescription: withDesc,
      withYoutube: withYoutube,
      withAdditionalNotes: withNotes,
      withAttachments: withAttachments,
      withLeetCodeUrlInContent: problemsWithExternalUrl.length,
      withCurriculumMeta: withCurriculumMeta,
      priorities,
      statuses,
      workTypes,
      phases
    },
    inventorySummary: {
      totalProblemsWithVideo: problemsWithVideo.length,
      totalProblemsWithoutVideo: problemsWithoutVideo.length,
      totalProblemsWithExternalUrl: problemsWithExternalUrl.length,
      totalProblemsWithoutExternalUrl: problemsWithoutExternalUrl.length
    }
  };

  console.log("Audit Report Summary:", JSON.stringify(report, null, 2));

  fs.writeFileSync("./scratch/dsa_inventory.json", JSON.stringify(inventory, null, 2));
  fs.writeFileSync("./scratch/dsa_report.json", JSON.stringify(report, null, 2));
  console.log("Wrote ./scratch/dsa_inventory.json and ./scratch/dsa_report.json successfully");

  process.exit(0);
}

analyzeDsaTasks().catch(e => {
  console.error(e);
  process.exit(1);
});

import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.config.js";
import Problem from "../models/problem.model.js";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import Company from "../models/company.model.js";
import Topic from "../models/topic.model.js";
import Pattern from "../models/pattern.model.js";
import { DailyRevision } from "../models/dailyRevision.model.js";
import { UserTaskProgress } from "../models/userTaskProgress.model.js";
import { User } from "../models/user.model.js";
import { UserRole } from "../models/role.model.js";
import { FocusSession } from "../models/focusSession.model.js";

async function runForensicAudit() {
  await connectDB();
  console.log("Connected to MongoDB for Read-Only Forensic Audit.");

  const db = mongoose.connection.db;

  // 1. List all collections in MongoDB
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name).sort();
  console.log("=== ALL COLLECTIONS IN MONGODB ===");
  console.log(JSON.stringify(collectionNames, null, 2));

  // Check for any Mock-related collections
  const mockCollections = collectionNames.filter(name => /mock|assess|exam|test_attempt|quiz/i.test(name));
  console.log("=== MOCK-RELATED COLLECTIONS ===", mockCollections);

  // 2. Audit Problem Collection (Content Factory / CoreJudge Master)
  const totalProblems = await Problem.countDocuments();
  const statusCounts = await Problem.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  const typeCounts = await Problem.aggregate([
    { $group: { _id: "$problemType", count: { $sum: 1 } } }
  ]);

  console.log("\n=== PROBLEM COLLECTION METRICS ===");
  console.log("Total Problems:", totalProblems);
  console.log("Status Breakdown:", statusCounts);
  console.log("Type Breakdown:", typeCounts);

  // Check DSA-001 through DSA-017
  const dsaProblems = await Problem.find({
    problemCode: { $regex: /^DSA-0(0[1-9]|1[0-7])$/ }
  }).select("problemCode title status difficulty factoryMetadata.source factoryMetadata.validationReport.validationState updatedAt").sort({ problemCode: 1 }).lean();
  console.log(`\n=== DSA-001..DSA-017 VERIFICATION (Found: ${dsaProblems.length}) ===`);
  dsaProblems.forEach(p => {
    console.log(`  ${p.problemCode}: "${p.title}" | Status: ${p.status} | Diff: ${p.difficulty} | Val: ${p.factoryMetadata?.validationReport?.validationState} | UpdatedAt: ${p.updatedAt}`);
  });

  // Check DRAFT-138779 and DRAFT-533477
  const specificDrafts = await Problem.find({
    problemCode: { $in: ["DRAFT-138779", "DRAFT-533477"] }
  }).select("problemCode title status difficulty factoryMetadata.validationReport.validationState updatedAt").lean();
  console.log("\n=== SPECIFIC DRAFTS VERIFICATION ===");
  console.log(JSON.stringify(specificDrafts, null, 2));

  // All Drafts list
  const allDrafts = await Problem.find({ status: { $ne: "Published" } })
    .select("problemCode title status difficulty factoryMetadata.validationReport.validationState createdAt updatedAt")
    .sort({ createdAt: -1 })
    .lean();
  console.log(`\n=== ALL NON-PUBLISHED PROBLEMS/DRAFTS (Total: ${allDrafts.length}) ===`);
  allDrafts.forEach(d => {
    console.log(`  ${d.problemCode}: "${d.title}" | Status: ${d.status} | ValState: ${d.factoryMetadata?.validationReport?.validationState}`);
  });

  // 3. Audit Projects (Arenas)
  const projects = await Project.find({}).lean();
  console.log(`\n=== ALL PROJECTS (ARENAS) IN DB (Total: ${projects.length}) ===`);
  for (const p of projects) {
    const taskCount = await Task.countDocuments({ projectName: p._id });
    const parentCount = await Task.countDocuments({ projectName: p._id, parentTask: null });
    const childCount = await Task.countDocuments({ projectName: p._id, parentTask: { $ne: null } });
    console.log(`Project "${p.name}" (Key: ${p.key}, ID: ${p._id}): Status: ${p.status}, Total Tasks: ${taskCount} (Parents: ${parentCount}, Children: ${childCount})`);
  }

  // 4. Audit Tasks
  const totalTasks = await Task.countDocuments();
  const parentTasksCount = await Task.countDocuments({ parentTask: null });
  const childTasksCount = await Task.countDocuments({ parentTask: { $ne: null } });
  const tasksWithCompanyTags = await Task.countDocuments({ "companyTags.0": { $exists: true } });
  const tasksWithLeetcodeUrl = await Task.countDocuments({ leetcodeUrl: { $exists: true, $ne: "" } });
  const tasksWithYoutubeUrl = await Task.countDocuments({ youtubeUrl: { $exists: true, $ne: "" } });

  console.log("\n=== TASK COLLECTION METRICS ===");
  console.log("Total Tasks:", totalTasks);
  console.log("Parent Tasks (Patterns):", parentTasksCount);
  console.log("Child Tasks (Problems):", childTasksCount);
  console.log("Tasks with Company Tags:", tasksWithCompanyTags);
  console.log("Tasks with LeetCode URL:", tasksWithLeetcodeUrl);
  console.log("Tasks with YouTube URL:", tasksWithYoutubeUrl);

  // 5. Audit Companies
  const totalCompanies = await Company.countDocuments();
  const companiesList = await Company.find({}).select("name slug").sort({ name: 1 }).lean();
  console.log(`\n=== COMPANY COLLECTION (Total: ${totalCompanies}) ===`);
  console.log(companiesList.map(c => c.name).join(", "));

  // 6. Audit DailyRevision & UserTaskProgress
  const totalRevisions = await DailyRevision.countDocuments();
  const totalUserProgress = await UserTaskProgress.countDocuments();
  const progressWithHistory = await UserTaskProgress.countDocuments({ "solveHistory.0": { $exists: true } });
  const totalFocusSessions = await FocusSession.countDocuments();

  console.log("\n=== USER ACTIVITY & REVISION METRICS ===");
  console.log("Total DailyRevision records:", totalRevisions);
  console.log("Total UserTaskProgress records:", totalUserProgress);
  console.log("UserTaskProgress records with solveHistory:", progressWithHistory);
  console.log("Total FocusSession records:", totalFocusSessions);

  // 7. Audit Users & Roles
  const totalUsers = await User.countDocuments();
  const users = await User.find({}).select("email firstName lastName userRole").populate("userRole", "name").lean();
  console.log(`\n=== USERS (Total: ${totalUsers}) ===`);
  users.forEach(u => {
    console.log(`  User: ${u.email} (${u.firstName} ${u.lastName}), Role: ${u.userRole?.name || 'None'}`);
  });

  process.exit(0);
}

runForensicAudit().catch(err => {
  console.error("Forensic Audit Error:", err);
  process.exit(1);
});

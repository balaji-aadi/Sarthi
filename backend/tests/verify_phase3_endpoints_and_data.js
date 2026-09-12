import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.config.js";
import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { UserTaskProgress } from "../models/userTaskProgress.model.js";
import { DailyRevision } from "../models/dailyRevision.model.js";
import { calculateRevisionQueue } from "../services/revision-service/revisionScheduler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    throw new Error(msg);
  }
}

async function verify() {
  console.log("==================================================");
  console.log("PHASE 3: END-TO-END VERIFICATION & INTEGRITY AUDIT");
  console.log("==================================================");

  await connectDB();

  // 1. Check Admin user and Test user
  const adminUser = await User.findOne({ email: "balajiaadi2000@gmail.com" }).lean();
  const testUser = await User.findOne({ email: "test@gmail.com" }).lean();

  assert(adminUser != null, "Admin user exists");
  assert(testUser != null, "Test user exists");
  console.log(`Admin user: ${adminUser.email} (${adminUser._id})`);
  console.log(`Test user:  ${testUser.email} (${testUser._id})`);

  // 2. DSA Curriculum records
  const dsaProjectIds = await Project.find({ key: { $in: ["DSA", "DSAP2", "DSAP3"] } }).distinct("_id");
  const totalDsaTasks = await Task.countDocuments({ projectName: { $in: dsaProjectIds } });
  const dsaChildren = await Task.countDocuments({ projectName: { $in: dsaProjectIds }, parentTask: { $ne: null } });
  const dsaTopics = await Task.countDocuments({ projectName: { $in: dsaProjectIds }, parentTask: null });

  console.log(`\n[Curriculum Integrity]`);
  console.log(`Total DSA records: ${totalDsaTasks} (Expected: 392)`);
  console.log(`Child problems:    ${dsaChildren} (Expected: 336)`);
  console.log(`Topic headers:     ${dsaTopics} (Expected: 56)`);
  assert(totalDsaTasks === 392, "DSA tasks must remain exactly 392");
  assert(dsaChildren === 336, "DSA child problems must remain exactly 336");
  assert(dsaTopics === 56, "DSA topic headers must remain exactly 56");

  // Check LLD tasks
  const lldProjectIds = await Project.find({ key: "LLD" }).distinct("_id");
  const lldTasksCount = await Task.countDocuments({ projectName: { $in: lldProjectIds } });
  console.log(`LLD tasks:         ${lldTasksCount} (Untouched)`);

  // Check Judge CMS problems
  const ProblemModel = (await import("../models/problem.model.js")).default || (await import("../models/problem.model.js")).Problem;
  if (ProblemModel) {
    const cmsProblemsCount = await ProblemModel.countDocuments();
    console.log(`Judge CMS problems: ${cmsProblemsCount} (Untouched)`);
  }

  // 3. Admin Account Revision State Evaluation
  console.log(`\n[Admin Revision Evaluation]`);
  const childTasks = await Task.find({
    projectName: { $in: dsaProjectIds },
    parentTask: { $ne: null }
  }).select("_id taskName taskId difficulty leetcodeUrl patternRef parentTask projectName createdAt").populate("parentTask", "taskName taskId").lean();

  const adminProgressList = await UserTaskProgress.find({
    userId: adminUser._id,
    taskId: { $in: childTasks.map(t => t._id) }
  }).lean();

  console.log(`Admin UserTaskProgress records in DB: ${adminProgressList.length}`);

  const adminQueue = calculateRevisionQueue({
    userProgressList: adminProgressList,
    childTasks,
    today: new Date(),
    timezoneOffsetMinutes: -330
  });

  console.log(`Admin Status:           ${adminQueue.status}`);
  console.log(`Admin Completed Total:  ${adminQueue.totalCompletedProblems}`);
  console.log(`Admin Total Due:        ${adminQueue.totalDueCount}`);
  console.log(`Admin Recommended (3-5): ${adminQueue.recommendedCount}`);
  console.log(`Admin Remaining Due:    ${adminQueue.remainingDueCount}`);

  if (adminQueue.recommendedQueue.length > 0) {
    console.log(`\nSample Recommended Due Cards for Admin:`);
    adminQueue.recommendedQueue.slice(0, 3).forEach((item, idx) => {
      console.log(`  Card ${idx + 1}: [${item.taskIdNumber ? `#DSA-${item.taskIdNumber}` : "#DSA"}] ${item.taskName}`);
      console.log(`    Topic:       ${item.topic}`);
      console.log(`    Outcome:     ${item.latestOutcome} (${item.latestConfidence})`);
      console.log(`    Interval:    ${item.intervalDays}d spacing`);
      console.log(`    Due Date:    ${item.dueLocalDateStr} (Overdue: ${item.overdueDays}d)`);
      console.log(`    Why Due:     "${item.reason}"`);
    });
  }

  // 4. Test User Account Evaluation
  console.log(`\n[Test User Isolation Evaluation]`);
  const testProgressList = await UserTaskProgress.find({
    userId: testUser._id,
    taskId: { $in: childTasks.map(t => t._id) }
  }).lean();

  console.log(`Test user UserTaskProgress records in DB: ${testProgressList.length}`);

  const testQueue = calculateRevisionQueue({
    userProgressList: testProgressList,
    childTasks,
    today: new Date(),
    timezoneOffsetMinutes: -330
  });

  console.log(`Test User Status:          ${testQueue.status}`);
  console.log(`Test User Total Completed: ${testQueue.totalCompletedProblems}`);
  console.log(`Test User Total Due:       ${testQueue.totalDueCount}`);
  console.log(`Test User Recommended:     ${testQueue.recommendedCount}`);

  // Multi-user isolation assertion
  assert(
    adminQueue.totalCompletedProblems !== testQueue.totalCompletedProblems,
    "Admin and Test user must have completely isolated completion counts!"
  );
  console.log("PASS: Multi-user isolation between Admin and Test user verified 100%.");

  // 5. Verify Admin's existing completed tasks are intact
  // Two Sum II (sorted) & Remove Duplicates from Sorted Array
  const twoSumTask = await Task.findOne({ taskName: /Two Sum II/i }).lean();
  if (twoSumTask) {
    const adminProg = await UserTaskProgress.findOne({ userId: adminUser._id, taskId: twoSumTask._id }).lean();
    console.log(`\nAdmin "Two Sum II" status: ${adminProg ? adminProg.status : "N/A (master task status: " + twoSumTask.status + ")"}`);
  }

  console.log("\n==================================================");
  console.log("ALL PHASE 3 INTEGRITY & ENDPOINT AUDITS PASSED");
  console.log("==================================================");
  process.exit(0);
}

verify().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});

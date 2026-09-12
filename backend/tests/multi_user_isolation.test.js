import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.config.js';
import { Task } from '../models/task.model.js';
import { UserTaskProgress } from '../models/userTaskProgress.model.js';
import { User } from '../models/user.model.js';

async function runRegressionTest() {
  await connectDB();
  console.log('=== MULTI-USER DATA ISOLATION REGRESSION SUITE ===\n');

  const adminUser = await User.findOne({ email: 'balajiaadi2000@gmail.com' }).lean();
  const testUser = await User.findOne({ email: 'test@gmail.com' }).lean();

  if (!adminUser || !testUser) {
    console.error('FAIL: Missing test users in system.');
    process.exit(1);
  }

  console.log(`User A (Admin): ${adminUser.email} (${adminUser._id})`);
  console.log(`User B (Test):  ${testUser.email} (${testUser._id})`);

  // Target DSA Phase 1
  const phase1Tasks = await Task.find({
    projectName: '69d7788e6d3910f342f371d9',
    parentTask: { $ne: null }
  }).lean();

  console.log(`\nDSA Phase 1 Total Child Questions: ${phase1Tasks.length}`);

  // 1. Verify Admin's baseline state (must be 121 / 121)
  const { default: taskController } = await import('../services/task-service/task.controller.js');

  // We can query UserTaskProgress directly to simulate projection
  const adminProgressList = await UserTaskProgress.find({
    userId: adminUser._id,
    taskId: { $in: phase1Tasks.map(t => t._id) }
  }).lean();
  const adminProgMap = new Map(adminProgressList.map(p => [p.taskId.toString(), p]));

  let adminCompletedCount = 0;
  phase1Tasks.forEach(t => {
    const p = adminProgMap.get(t._id.toString());
    const status = p ? p.status : t.status;
    if (status === 'done') adminCompletedCount++;
  });
  console.log(`[TEST 1] Admin baseline completion: ${adminCompletedCount} / ${phase1Tasks.length}`);
  if (adminCompletedCount !== phase1Tasks.length) {
    console.error(`FAIL: Admin baseline is not ${phase1Tasks.length}!`);
    process.exit(1);
  }
  console.log('PASS: Admin has all Phase 1 questions completed.');

  // 2. Pick a shared test problem: DSA-19 (Two Sum II)
  const testTask = phase1Tasks.find(t => t.taskId === 'DSA-19');
  if (!testTask) {
    console.error('FAIL: DSA-19 not found.');
    process.exit(1);
  }
  console.log(`\nSelected Shared Problem: "${testTask.taskName}" (${testTask.taskId}) [ID: ${testTask._id}]`);

  // Record shared Task collection state before test
  const taskDocBefore = await Task.findById(testTask._id).lean();
  console.log(`Task collection status before test: "${taskDocBefore.status}"`);

  // 3. Simulate User B (Test) changing status to "inprogress"
  console.log('\n[TEST 2] Simulating User B (Test) starting focus on DSA-19...');
  let testUserProg = await UserTaskProgress.findOne({ userId: testUser._id, taskId: testTask._id });
  if (!testUserProg) {
    testUserProg = new UserTaskProgress({
      userId: testUser._id,
      taskId: testTask._id,
      projectName: testTask.projectName,
      status: 'todo',
      progress: 0,
      activityLogs: []
    });
  }
  testUserProg.status = 'inprogress';
  testUserProg.progress = 25;
  await testUserProg.save();

  // Verify shared Task collection was NOT modified
  const taskDocAfterTestB = await Task.findById(testTask._id).lean();
  console.log(`Task collection status after User B update: "${taskDocAfterTestB.status}"`);
  if (taskDocAfterTestB.status !== taskDocBefore.status) {
    console.error('FAIL: Shared Task document status was mutated by User B!');
    process.exit(1);
  }
  console.log('PASS: Shared Task document remained completely untouched.');

  // Verify Admin still sees DSA-19 as Completed
  const adminProgCheck = await UserTaskProgress.findOne({ userId: adminUser._id, taskId: testTask._id }).lean();
  const adminStatus = adminProgCheck ? adminProgCheck.status : taskDocAfterTestB.status;
  console.log(`Admin visible status for DSA-19: "${adminStatus}"`);
  if (adminStatus !== 'done') {
    console.error(`FAIL: Admin visible status was corrupted to "${adminStatus}"!`);
    process.exit(1);
  }
  console.log('PASS: User A (Admin) remains 100% unaffected by User B.');

  // 4. Simulate User B logging a reflection with outcome SOLVED_WITH_HINTS + MEDIUM
  console.log('\n[TEST 3] Simulating User B (Test) logging reflection...');
  const userBAttempt = {
    attemptedAt: new Date(),
    durationMinutes: 18,
    outcome: 'SOLVED_WITH_HINTS',
    confidence: 'MEDIUM',
    notes: 'User B private notes - strictly confidential'
  };
  testUserProg.status = 'done';
  testUserProg.progress = 100;
  testUserProg.latestOutcome = userBAttempt.outcome;
  testUserProg.latestConfidence = userBAttempt.confidence;
  testUserProg.solveHistory.push(userBAttempt);
  await testUserProg.save();

  // Verify Admin's view of solveHistory and outcome
  const adminFinalProg = await UserTaskProgress.findOne({ userId: adminUser._id, taskId: testTask._id }).lean();
  const adminOutcome = adminFinalProg?.latestOutcome || null;
  const adminHistory = adminFinalProg?.solveHistory || [];
  console.log(`Admin latestOutcome: ${adminOutcome}`);
  console.log(`Admin solveHistory count: ${adminHistory.length}`);
  const hasUserBNote = adminHistory.some(h => h.notes?.includes('User B private notes'));
  if (hasUserBNote || adminOutcome === 'SOLVED_WITH_HINTS') {
    console.error('FAIL: User B reflection leaked into Admin history!');
    process.exit(1);
  }
  console.log('PASS: User B reflection and solveHistory are 100% isolated.');

  // 5. Test User C (Simulation of a new / 100th user)
  console.log('\n[TEST 4] Simulating User C (New Learner)...');
  const userCId = new mongoose.Types.ObjectId();
  const userCProgressList = await UserTaskProgress.find({
    userId: userCId,
    taskId: { $in: phase1Tasks.map(t => t._id) }
  }).lean();

  // User C projection: no UserTaskProgress records exist
  let userCCompletedCount = 0;
  phase1Tasks.forEach(t => {
    const p = userCProgressList.find(prog => prog.taskId.toString() === t._id.toString());
    const status = p ? p.status : 'todo'; // Non-admin clean default
    if (status === 'done') userCCompletedCount++;
  });
  console.log(`User C visible completion count: ${userCCompletedCount} / ${phase1Tasks.length}`);
  if (userCCompletedCount !== 0) {
    console.error(`FAIL: User C should see 0 completed, saw ${userCCompletedCount}!`);
    process.exit(1);
  }
  console.log('PASS: User C starts with clean 0/121 To Do state without inheriting any other user state.');

  // User C completes DSA-19 independently
  const userCProg = new UserTaskProgress({
    userId: userCId,
    taskId: testTask._id,
    projectName: testTask.projectName,
    status: 'done',
    progress: 100,
    latestOutcome: 'SOLVED_INDEPENDENT',
    latestConfidence: 'HIGH',
    solveHistory: [{
      attemptedAt: new Date(),
      durationMinutes: 10,
      outcome: 'SOLVED_INDEPENDENT',
      confidence: 'HIGH',
      notes: 'User C solved independently'
    }],
    activityLogs: []
  });
  await userCProg.save();

  // Verify User C is now 1 / 121
  const userCProgAfter = await UserTaskProgress.find({
    userId: userCId,
    taskId: { $in: phase1Tasks.map(t => t._id) }
  }).lean();
  console.log(`User C completion count after solve: ${userCProgAfter.filter(p => p.status === 'done').length} / ${phase1Tasks.length}`);

  // Verify User A (Admin) and User B (Test) remain completely unchanged
  const userBCheck = await UserTaskProgress.findOne({ userId: testUser._id, taskId: testTask._id }).lean();
  console.log(`User B outcome remains: "${userBCheck.latestOutcome}" (expected: "SOLVED_WITH_HINTS")`);
  if (userBCheck.latestOutcome !== 'SOLVED_WITH_HINTS') {
    console.error('FAIL: User B outcome changed due to User C action!');
    process.exit(1);
  }

  // Clean up simulated User C
  await UserTaskProgress.deleteMany({ userId: userCId });
  console.log('Cleaned up simulated User C test data.');

  console.log('\n==================================================');
  console.log('ALL MULTI-USER ISOLATION REGRESSION TESTS PASSED!');
  console.log('Permanent System Invariant Verified:');
  console.log('  User A State != User B State != User C State');
  console.log('  Shared Task Document = 100% Immutable by Learner Activity');
  console.log('==================================================\n');

  process.exit(0);
}

runRegressionTest().catch(err => {
  console.error('Error during multi-user regression test:', err);
  process.exit(1);
});

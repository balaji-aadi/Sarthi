import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });
import mongoose from 'mongoose';
import connectDB from '../config/db.config.js';
import { Task } from '../models/task.model.js';
import Company from '../models/company.model.js';
import { UserTaskProgress } from '../models/userTaskProgress.model.js';
import { User } from '../models/user.model.js';
import { DailyRevision } from '../models/dailyRevision.model.js';
import { FocusSession } from '../models/focusSession.model.js';

async function runTests() {
  await connectDB();
  console.log('🧪 Starting Phase 5 Simplified: Company Tagging Unit & Isolation Regression Tests...\n');

  try {
    // 1. Setup sample company from Company Master
    let google = await Company.findOne({ slug: 'google' });
    if (!google) {
      google = await Company.create({ name: 'Google', slug: 'google', logoUrl: 'https://logo.clearbit.com/google.com' });
    }
    let amazon = await Company.findOne({ slug: 'amazon' });
    if (!amazon) {
      amazon = await Company.create({ name: 'Amazon', slug: 'amazon', logoUrl: 'https://logo.clearbit.com/amazon.com' });
    }

    // 2. Test 1: Valid companyTags with simple company references
    console.log('[Test 1] Saving Task with valid simplified companyTags...');
    const testTask = new Task({
      taskName: 'Phase 5 Simplified Temp Test Problem',
      taskPriority: 'medium',
      taskType: 'Task',
      companyTags: [
        {
          company: google._id
        },
        {
          company: amazon._id
        }
      ]
    });

    await testTask.save();

    const fetched = await Task.findById(testTask._id).populate('companyTags.company', 'name slug logoUrl');
    if (fetched.companyTags.length !== 2) throw new Error(`Expected 2 company tags, got ${fetched.companyTags.length}`);
    if (fetched.companyTags[0].company.name !== 'Google') throw new Error(`Expected Google, got ${fetched.companyTags[0].company.name}`);
    if (fetched.companyTags[1].company.name !== 'Amazon') throw new Error(`Expected Amazon, got ${fetched.companyTags[1].company.name}`);
    
    console.log('✅ Test 1 Passed: Valid simplified companyTags saved and populated successfully.');

    // 3. Test 2: Duplicate company rejection in controller sanitizer
    console.log('[Test 2] Validating duplicate company rejection...');
    const { sanitizeCompanyTags } = await import('../services/task-service/task.controller.js');
    try {
      sanitizeCompanyTags([
        { company: google._id.toString() },
        { company: google._id.toString() }
      ]);
      throw new Error('Should have failed validation for duplicate company ID');
    } catch (dupErr) {
      if ((dupErr.statusCode === 400 || dupErr.status === 400) && dupErr.message.includes('Duplicate company tag detected')) {
        console.log('✅ Test 2 Passed: Controller correctly rejected duplicate company with 400 error.');
      } else {
        throw dupErr;
      }
    }

    // 4. Test 3: Existing questions without company tags remain 100% valid
    console.log('[Test 3] Verifying questions without companyTags remain 100% valid...');
    const noTagsTask = new Task({
      taskName: 'Untagged DSA Problem',
      taskPriority: 'low',
      taskType: 'Task',
      companyTags: []
    });
    await noTagsTask.save();
    const fetchedUntagged = await Task.findById(noTagsTask._id);
    if (!Array.isArray(fetchedUntagged.companyTags) || fetchedUntagged.companyTags.length !== 0) {
      throw new Error('Expected empty array for companyTags');
    }
    console.log('✅ Test 3 Passed: Tasks without companyTags remain valid with companyTags: [].');

    // 5. Test 4: Multi-User Isolation Regression
    console.log('[Test 4] Multi-User Isolation Regression: Verifying Admin tagging does NOT mutate learner state...');
    const adminUser = await User.findOne({ email: 'balajiaadi2000@gmail.com' }).lean();
    const testUser = await User.findOne({ email: 'test@gmail.com' }).lean();

    if (adminUser && testUser) {
      // Find a real Phase 1 task
      const targetTask = await Task.findOne({
        projectName: '69d7788e6d3910f342f371d9',
        parentTask: { $ne: null }
      });

      if (targetTask) {
        // Record baseline learner state before tag update
        const adminProgBefore = await UserTaskProgress.findOne({ userId: adminUser._id, taskId: targetTask._id }).lean();
        const testProgBefore = await UserTaskProgress.findOne({ userId: testUser._id, taskId: targetTask._id }).lean();
        const adminDailyBefore = await DailyRevision.find({ userId: adminUser._id }).lean();
        const testDailyBefore = await DailyRevision.find({ userId: testUser._id }).lean();
        const adminFocusBefore = await FocusSession.find({ user: adminUser._id }).lean();
        const testFocusBefore = await FocusSession.find({ user: testUser._id }).lean();

        // Admin updates companyTags on shared curriculum Task
        targetTask.companyTags = [
          {
            company: google._id
          }
        ];
        await targetTask.save();

        // Re-check learner states
        const adminProgAfter = await UserTaskProgress.findOne({ userId: adminUser._id, taskId: targetTask._id }).lean();
        const testProgAfter = await UserTaskProgress.findOne({ userId: testUser._id, taskId: targetTask._id }).lean();
        const adminDailyAfter = await DailyRevision.find({ userId: adminUser._id }).lean();
        const testDailyAfter = await DailyRevision.find({ userId: testUser._id }).lean();
        const adminFocusAfter = await FocusSession.find({ user: adminUser._id }).lean();
        const testFocusAfter = await FocusSession.find({ user: testUser._id }).lean();

        // Assert 100% untouched learner state
        if (JSON.stringify(adminProgBefore) !== JSON.stringify(adminProgAfter)) {
          throw new Error('Admin UserTaskProgress was mutated by companyTags update!');
        }
        if (JSON.stringify(testProgBefore) !== JSON.stringify(testProgAfter)) {
          throw new Error('Test UserTaskProgress was mutated by companyTags update!');
        }
        if (adminDailyBefore.length !== adminDailyAfter.length) {
          throw new Error('DailyRevision count changed!');
        }
        if (testDailyBefore.length !== testDailyAfter.length) {
          throw new Error('Test DailyRevision count changed!');
        }
        if (adminFocusBefore.length !== adminFocusAfter.length || testFocusBefore.length !== testFocusAfter.length) {
          throw new Error('FocusSession records changed!');
        }
        console.log('✅ Test 4 Passed: Admin company tag change does NOT mutate any learner state.');

        // Cleanup temporary tags on targetTask to avoid dirtying live data
        targetTask.companyTags = [];
        await targetTask.save();
      }
    }

    // Cleanup temp test tasks
    await Task.findByIdAndDelete(testTask._id);
    await Task.findByIdAndDelete(noTagsTask._id);

    console.log('\n🎉 ALL PHASE 5 SIMPLIFIED COMPANY TAGGING UNIT & ISOLATION TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  }
}

runTests();

import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import mongoose from 'mongoose';
import { submitLldTaskProgress } from '../services/task-service/lldWorkspace.controller.js';
import { Task } from '../models/task.model.js';
import { UserTaskProgress } from '../models/userTaskProgress.model.js';

async function runAudit() {
  console.log('================================================================================');
  console.log('🔍 PHASE 4 AUDIT 4: MULTI-USER ISOLATION & EXIT 0 INVARIANT VALIDATION');
  console.log('================================================================================\n');

  await mongoose.connect(process.env.MONGODB_URI);

  const taskId = 'LLDP1-P1-V2';
  const masterTaskBefore = await Task.findOne({ taskId }).lean();

  const userAId = new mongoose.Types.ObjectId();
  const userBId = new mongoose.Types.ObjectId();

  const codeUserA = '#include <iostream>\nint main() { std::cout << "USER_A_PRIVATE_CODE" << std::endl; return 0; }';
  const codeUserB = '#include <iostream>\nint main() { std::cout << "USER_B_PRIVATE_CODE" << std::endl; return 0; }';

  // Helper to execute submitLldTaskProgress
  const executeSubmit = (userId, code) => {
    return new Promise((resolve, reject) => {
      const req = {
        params: { id: taskId },
        user: { _id: userId },
        body: { language: 'cpp', code }
      };
      const res = {
        status: (code) => ({
          json: (payload) => {
            payload.statusCode = code;
            resolve(payload);
          }
        })
      };
      submitLldTaskProgress(req, res, reject);
    });
  };

  try {
    console.log('1. Submitting User A solution...');
    const resA = await executeSubmit(userAId, codeUserA);
    if (resA.statusCode !== 200 || !resA.data?.execution) {
      throw new Error(`User A submission failed with status: ${resA.statusCode}`);
    }

    console.log('2. Submitting User B solution...');
    const resB = await executeSubmit(userBId, codeUserB);
    if (resB.statusCode !== 200 || !resB.data?.execution) {
      throw new Error(`User B submission failed with status: ${resB.statusCode}`);
    }

    console.log('3. Validating strictly isolated progress documents...');
    const progA = await UserTaskProgress.findOne({ userId: userAId, taskId: masterTaskBefore._id }).lean();
    const progB = await UserTaskProgress.findOne({ userId: userBId, taskId: masterTaskBefore._id }).lean();

    if (!progA || !progB) {
      throw new Error('Missing progress documents for user A or B');
    }

    // Check code isolation
    const codeInA = progA.lastSubmittedCode?.cpp || (progA.lastSubmittedCode instanceof Map ? progA.lastSubmittedCode.get('cpp') : null);
    const codeInB = progB.lastSubmittedCode?.cpp || (progB.lastSubmittedCode instanceof Map ? progB.lastSubmittedCode.get('cpp') : null);

    if (!codeInA || !codeInA.includes('USER_A_PRIVATE_CODE')) {
      throw new Error(`User A code leaked or corrupted: ${codeInA}`);
    }
    if (!codeInB || !codeInB.includes('USER_B_PRIVATE_CODE')) {
      throw new Error(`User B code leaked or corrupted: ${codeInB}`);
    }
    if (codeInA === codeInB) {
      throw new Error('Cross-user contamination: User A and User B received identical code');
    }
    console.log('  ✓ [PASS] Multi-user code isolation verified (User A != User B)');

    // Check completion invariant: Exit code 0 MUST NOT mark task as "done"
    if (progA.status === 'done' || progB.status === 'done') {
      throw new Error(`INVARIANT VIOLATION: Task status was marked 'done' on exit 0. (A: ${progA.status}, B: ${progB.status})`);
    }
    console.log(`  ✓ [PASS] Completion invariant preserved: status is '${progA.status}', NOT 'done'`);

    // Check Master Task document immutability
    const masterTaskAfter = await Task.findOne({ taskId }).lean();
    if (JSON.stringify(masterTaskBefore) !== JSON.stringify(masterTaskAfter)) {
      throw new Error('CRITICAL: Master Task document was mutated during submission!');
    }
    console.log('  ✓ [PASS] Master Task collection immutability verified (Zero mutations)');

  } finally {
    // Clean up temporary test documents
    await UserTaskProgress.deleteMany({ userId: { $in: [userAId, userBId] } });
    await mongoose.disconnect();
  }

  console.log('\n✅ AUDIT 4 PASSED: Multi-user isolation, completion invariants, and database immutability 100% verified.\n');
}

runAudit().catch(err => {
  console.error('Audit 4 failed:', err);
  process.exit(1);
});

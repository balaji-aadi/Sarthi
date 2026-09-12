import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import mongoose from 'mongoose';
import { getLldWorkspaceContext } from '../services/task-service/lldWorkspace.controller.js';

async function runAudit() {
  console.log('================================================================================');
  console.log('🔍 PHASE 4 AUDIT 2: WORKSPACE CONTEXT & STARTER TEMPLATES ACROSS PHASES');
  console.log('================================================================================\n');

  await mongoose.connect(process.env.MONGODB_URI);

  // Pick representative tasks from each phase
  const sampleTasks = [
    { phase: 'P1 Drill', taskId: 'LLDP1-D1.1.1', expectedType: 'drill' },
    { phase: 'P1 Version', taskId: 'LLDP1-P1-V2', expectedType: 'problem_version' },
    { phase: 'P2 Drill', taskId: 'LLDP2-D2.1.1', expectedType: 'drill' },
    { phase: 'P2 Version', taskId: 'LLDP2-P1-V1', expectedType: 'problem_version' },
    { phase: 'P3 Drill', taskId: 'LLDP3-D3.1.1', expectedType: 'drill' },
    { phase: 'P3 Version', taskId: 'LLDP3-P1-V1', expectedType: 'problem_version' },
    { phase: 'P4 Drill', taskId: 'LLDP4-D4.1.1', expectedType: 'drill' },
    { phase: 'P4 Version', taskId: 'LLDP4-P1-V1', expectedType: 'problem_version' },
    { phase: 'P5 Drill', taskId: 'LLDP5-D5.1.1', expectedType: 'drill' }
  ];

  let passed = 0;

  for (const sample of sampleTasks) {
    const req = { params: { id: sample.taskId }, user: null };
    const responseData = await new Promise((resolve, reject) => {
      const res = {
        status: (code) => ({
          json: (payload) => {
            payload.statusCode = code;
            resolve(payload);
          }
        })
      };
      getLldWorkspaceContext(req, res, reject);
    });

    if (responseData?.statusCode !== 200 || !responseData?.data) {
      throw new Error(`Failed to load workspace context for ${sample.taskId}: status ${responseData?.statusCode}`);
    }

    const { task, isExecutable, executionMode, starterTemplates, versionContext } = responseData.data;

    if (!isExecutable || executionMode !== 'DIRECT_PROGRAM') {
      throw new Error(`Invalid execution mode for ${sample.taskId}: ${executionMode}`);
    }

    if (!starterTemplates.cpp || !starterTemplates.java || !starterTemplates.python) {
      throw new Error(`Missing starter templates in one or more languages for ${sample.taskId}`);
    }

    // Verify student-owned main() presence
    if (!starterTemplates.cpp.includes('main()')) {
      throw new Error(`C++ starter template missing main() for ${sample.taskId}`);
    }
    if (!starterTemplates.java.includes('main(')) {
      throw new Error(`Java starter template missing main() for ${sample.taskId}`);
    }

    console.log(`  ✓ [PASS] [${sample.phase}] ${sample.taskId}: ${task.taskName.slice(0, 45)}...`);
    console.log(`     Templates: C++ (${starterTemplates.cpp.length}b), Java (${starterTemplates.java.length}b), Python (${starterTemplates.python.length}b)`);
    if (sample.expectedType === 'problem_version') {
      console.log(`     Version Timeline: V${versionContext.currentIndex + 1} of ${versionContext.totalVersions}`);
    }

    passed++;
  }

  await mongoose.disconnect();
  console.log(`\n✅ AUDIT 2 PASSED: All ${passed}/${sampleTasks.length} representative tasks loaded full DIRECT_PROGRAM workspace context cleanly.\n`);
}

runAudit().catch(err => {
  console.error('Audit 2 failed:', err);
  process.exit(1);
});

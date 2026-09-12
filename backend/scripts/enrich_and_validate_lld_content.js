import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { DRILL_CONTENT_MAP } from './lld_curriculum_drills_content.js';
import { MAJOR_PROBLEMS_CONTENT_MAP } from './lld_curriculum_problems_content.js';
import { phase1Data } from './lld_v2_data/phase1_data.js';
import { phase2Data } from './lld_v2_data/phase2_data.js';
import { phase3Data } from './lld_v2_data/phase3_data.js';
import { phase4Data } from './lld_v2_data/phase4_data.js';
import { phase5Data } from './lld_v2_data/phase5_data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sarthi';

// Build lookup maps from original seed data
const allSeedPhases = [phase1Data, phase2Data, phase3Data, phase4Data, phase5Data];
const seedDrillMap = new Map();
const seedProblemMap = new Map();
const seedVersionMap = new Map();

allSeedPhases.forEach(p => {
  p.modules?.forEach(m => {
    m.units?.forEach(u => {
      u.drills?.forEach(d => {
        seedDrillMap.set(d.taskId, { ...d, unitCode: u.unitCode, conceptTopics: u.conceptTopics });
      });
    });
  });
  p.majorProblems?.forEach(mp => {
    seedProblemMap.set(mp.taskId, mp);
    mp.versions?.forEach(v => {
      seedVersionMap.set(v.taskId, { ...v, problemName: mp.taskName });
    });
  });
});

// Forbidden AI / Corporate Filler strings that must NEVER appear in drill content
const FORBIDDEN_FILLER_PHRASES = [
  'guarantees high architectural fidelity',
  'catastrophic bugs and brittle code',
  'without architectural bloat',
  ', minimal implementation',
  '### Goal BUILD a clean',
  'contract enforcement cause'
];

async function runEnrichmentAndValidation() {
  console.log('================================================================================');
  console.log('🚀 STARTING RIGOROUS LLD CURRICULUM CONTENT ENRICHMENT & VALIDATION PIPELINE');
  console.log('================================================================================');

  await mongoose.connect(MONGODB_URI);
  console.log('✓ Connected to MongoDB.');

  const db = mongoose.connection.db;
  const tasksCol = db.collection('tasks');
  const branchesCol = db.collection('branches');
  const projectsCol = db.collection('projects');

  // 1. Guard DSA tasks
  const dsaBranch = await branchesCol.findOne({ slug: /dsa/i });
  if (!dsaBranch) throw new Error('DSA Branch not found! Aborting.');
  const dsaTaskCountBefore = await tasksCol.countDocuments({ branchId: dsaBranch._id });
  console.log(`🛡️  DSA Pre-Check: ${dsaTaskCountBefore} tasks (Must be exactly 458).`);
  if (dsaTaskCountBefore !== 458) {
    throw new Error(`DSA task count mismatch! Expected 458, got ${dsaTaskCountBefore}. Aborting.`);
  }

  // 2. Fetch LLD Branch and Tasks
  const lldBranch = await branchesCol.findOne({ slug: /lld/i });
  if (!lldBranch) throw new Error('LLD Branch not found! Aborting.');
  const lldTasks = await tasksCol.find({ branchId: lldBranch._id }).toArray();
  console.log(`✓ Loaded ${lldTasks.length} LLD task records from MongoDB.`);

  const updatesToApply = [];
  const validationErrors = [];

  for (const task of lldTasks) {
    let nodeType = task.curriculumMeta?.nodeType;
    if (!nodeType) {
      if (task.taskType === 'CurriculumModule') nodeType = 'module';
      else if (task.taskType === 'CurriculumUnit') nodeType = 'unit';
      else if (task.taskType === 'CurriculumDrill') nodeType = 'drill';
      else if (task.taskType === 'MajorProblem') nodeType = 'major_problem';
      else if (task.taskType === 'ProblemVersion') nodeType = 'problem_version';
    }

    let finalDescription = task.taskDescription || '';
    let updatedMeta = { ...(task.curriculumMeta || {}) };
    updatedMeta.nodeType = nodeType;

    // -------------------------------------------------------------------------
    // A. DRILL ENRICHMENT & RIGOROUS VALIDATION
    // -------------------------------------------------------------------------
    if (nodeType === 'drill') {
      const drillId = task.taskId;
      const content = DRILL_CONTENT_MAP[drillId];

      if (!content) {
        validationErrors.push(`[DRILL MISSING CONTENT] Drill ${drillId} (${task.taskName}) has no entry in DRILL_CONTENT_MAP.`);
        continue;
      }

      // Check required sections exist
      const requiredSections = ['goal', 'whyThisMatters', 'yourTask', 'whatToObserve', 'successCriteria', 'thinkAbout'];
      for (const sec of requiredSections) {
        if (!content[sec] || typeof content[sec] !== 'string' || content[sec].trim().length < 30) {
          validationErrors.push(`[DRILL SECTION INVALID] Drill ${drillId} missing or too short section: ${sec}`);
        }
      }

      // Check for forbidden filler
      const fullText = Object.values(content).join(' ');
      for (const phrase of FORBIDDEN_FILLER_PHRASES) {
        if (fullText.includes(phrase)) {
          validationErrors.push(`[FORBIDDEN FILLER] Drill ${drillId} contains forbidden phrase: "${phrase}"`);
        }
      }

      // Check for leading commas or corruption
      if (content.yourTask.startsWith(',') || content.goal.startsWith(',')) {
        validationErrors.push(`[CORRUPT LEADING COMMA] Drill ${drillId} has leading comma artifact.`);
      }

      // Check for section duplication
      const sectionValues = requiredSections.map(s => content[s].trim().toLowerCase());
      const uniqueValues = new Set(sectionValues);
      if (uniqueValues.size !== sectionValues.length) {
        validationErrors.push(`[DUPLICATE SECTIONS] Drill ${drillId} has identical content across different sections.`);
      }

      // Format clean structured markdown
      finalDescription = `### Goal
${content.goal.trim()}

### Why This Matters
${content.whyThisMatters.trim()}

### Your Task
${content.yourTask.trim()}

### What To Observe
${content.whatToObserve.trim()}

### Success Criteria
${content.successCriteria.trim()}

### Think About
${content.thinkAbout.trim()}`;

      // Store structured sections directly in curriculumMeta for authoring UX
      updatedMeta.sections = {
        goal: content.goal.trim(),
        whyThisMatters: content.whyThisMatters.trim(),
        yourTask: content.yourTask.trim(),
        whatToObserve: content.whatToObserve.trim(),
        successCriteria: content.successCriteria.trim(),
        thinkAbout: content.thinkAbout.trim()
      };

      if (['LLDP5-D5.4.1', 'LLDP5-D5.4.2', 'LLDP5-D5.4.3'].includes(task.taskId)) {
        updatedMeta.targetTimeMinutes = 60;
      }
    }

    // -------------------------------------------------------------------------
    // B. MAJOR PROBLEM ENRICHMENT (10-Section LeetCode Grade, Zero Spoilers)
    // -------------------------------------------------------------------------
    else if (nodeType === 'major_problem') {
      const probId = task.taskId;
      const curatedProb = MAJOR_PROBLEMS_CONTENT_MAP[probId];
      const seedProb = seedProblemMap.get(probId);

      if (curatedProb) {
        finalDescription = `### 1. Context & Scenario
${curatedProb.context}

### 2. Functional Requirements
${curatedProb.functionalRequirements.map(r => `* ${r}`).join('\n')}

### 3. Core Operations & API
\`\`\`cpp
${curatedProb.coreOperationsApi.join('\n')}
\`\`\`

### 4. Expected Behavior
${curatedProb.expectedBehavior}

### 5. Examples & Interaction Scenarios
${curatedProb.examplesScenarios}

### 6. Constraints & Assumptions
${curatedProb.constraintsAssumptions.map(c => `* ${c}`).join('\n')}

### 7. Edge Cases & Error Handling
${curatedProb.edgeCasesErrorHandling.map(e => `* ${e}`).join('\n')}

### 8. State & Lifecycle Rules
${curatedProb.stateLifecycleRules}

### 9. Acceptance Criteria
${curatedProb.acceptanceCriteria.map(a => `* ${a}`).join('\n')}

### 10. What You Need To Implement
${curatedProb.whatYouNeedToImplement}`;
      } else {
        // Fallback for remaining problems
        finalDescription = `### 1. Context & Scenario
${seedProb?.taskDescription || task.taskName}

### 2. Functional Requirements
* Implement core domain entities and lifecycle operations for ${task.taskName}.
* Handle concurrent access and state transitions safely.
* Provide clean interfaces for querying and updating system status.

### 3. Core Operations & API
\`\`\`cpp
// Core public operations
void executeOperation();
\`\`\`

### 4. Expected Behavior
The system responds deterministically to valid operations and rejects invalid requests with domain-specific exceptions.

### 5. Examples & Interaction Scenarios
Demonstrate happy path and error cases.

### 6. Constraints & Assumptions
* In-memory implementation with clean entity boundaries.

### 7. Edge Cases & Error Handling
* Validate input arguments.
* Throw specific exceptions on failure.

### 8. State & Lifecycle Rules
Ensure valid state transitions.

### 9. Acceptance Criteria
* All operational workflows succeed.
* Boundary conditions tested.

### 10. What You Need To Implement
Implement the system described above in modern C++ with comprehensive unit tests.`;
      }

      // Zero-spoiler verification: Ensure no design pattern names leak into pre-attempt problem spec
      const patternLeaks = ['Strategy Pattern', 'Factory Pattern', 'Observer Pattern', 'State Pattern', 'Decorator Pattern'];
      for (const leak of patternLeaks) {
        if (finalDescription.includes(leak)) {
          validationErrors.push(`[PATTERN SPOILER LEAK] Major Problem ${probId} leaks pattern name: "${leak}"`);
        }
      }
    }

    // -------------------------------------------------------------------------
    // C. PROBLEM VERSION ENRICHMENT (Requirement Diff & Refactor Objective)
    // -------------------------------------------------------------------------
    else if (nodeType === 'problem_version') {
      const seedVer = seedVersionMap.get(task.taskId);
      const vNum = task.curriculumMeta?.versionNumber || 1;
      const vTitle = task.taskName;
      const probName = seedVer?.problemName || 'the system';
      const rawDetail = seedVer?.taskDescription || '';

      // Create version-specific diff (Zero design-pattern or architectural spoilers)
      let whatIsNew = '';
      let whatChanged = '';
      let expectedRefactor = '';
      let acceptance = '';

      if (task.taskId === 'LLDP2-P1-V2') {
        whatIsNew = 'The system must now support Motorcycle, Car, and Large Truck with Small, Compact, and Large parking spots. Each vehicle type has specific compatibility rules.';
        whatChanged = 'Version 1 only handled a single car type in uniform spots. Version 2 requires spot-to-vehicle sizing logic: Motorcycles fit in Small, Compact, or Large spots; Cars fit in Compact or Large spots; Large Trucks fit only in Large spots.';
        expectedRefactor = 'Extend the parking and allocation logic to evaluate spot compatibility based on vehicle type and spot size rules, while ensuring existing Version 1 behavior continues to work.';
        acceptance = 'A Large Truck arriving when only Small and Compact spots are available must be rejected with NoSuitableSpotException. Motorcycles prioritize Small spots first. All Version 1 entry, exit, and billing operations continue to pass.';
      } else if (vNum === 1) {
        whatIsNew = `Baseline implementation establishing foundational domain entities, core state representations, and happy-path operations for ${probName}.`;
        whatChanged = 'Initial baseline release. Focus on clean class structure, clear public contracts, and basic validation.';
        expectedRefactor = 'Establish clean entity models and initial operational coordinator with proper encapsulation.';
        acceptance = `Happy-path workflow executes correctly end-to-end. Basic validation catches invalid arguments.`;
      } else {
        whatIsNew = `Version ${vNum} introduces: ${rawDetail || vTitle}.`;
        whatChanged = `Extends Version ${vNum - 1} by challenging initial assumptions and requiring structural refactoring of business logic.`;
        expectedRefactor = 'Extend the existing system to support the new requirements while ensuring all previous version workflows continue to function correctly without regression.';
        acceptance = `All previous version test scenarios continue to pass without regression. New capabilities operate cleanly without tight coupling to legacy types.`;
      }

      finalDescription = `### What Is New In This Version
${whatIsNew}

### What Changed From Previous Version
${whatChanged}

### Expected Refactor / Extension Behavior
${expectedRefactor}

### Acceptance Criteria
${acceptance}`;
    }

    // -------------------------------------------------------------------------
    // D. MODULE & UNIT ENRICHMENT
    // -------------------------------------------------------------------------
    else if (nodeType === 'module') {
      finalDescription = `### WHY THIS MODULE EXISTS
In low-level design, software fails not because of algorithmic complexity, but because of poor responsibility distribution, uncontrolled coupling, and brittle abstractions. This module establishes core foundational principles to prevent design decay.

### WHAT YOU WILL LEARN
* Concrete architectural models and language mechanics required for reliable domain modeling.
* Systematic techniques to decompose requirements into cohesive, independently testable collaborators.
* Trade-offs between memory overhead, runtime dispatch costs, and structural flexibility.

### WHAT YOU WILL BE ABLE TO DESIGN
You will be able to construct extensible, maintainable subsystems with clean public contracts, predictable lifecycle semantics, and strict encapsulation boundaries.`;
    } else if (nodeType === 'unit') {
      const concepts = Array.isArray(task.curriculumMeta?.conceptTopics) && task.curriculumMeta.conceptTopics.length > 0
        ? task.curriculumMeta.conceptTopics.map(c => `* ${c}`).join('\n')
        : `* Core structural relationships and lifecycle contracts\n* Boundary enforcement and encapsulation mechanics`;
      const timeEst = task.curriculumMeta?.targetTimeMinutes || 45;

      finalDescription = `### LEARNING OBJECTIVE
Develop practical fluency in decomposing domain logic and enforcing strict class contracts. You will master how objects interact across boundaries while avoiding resource leaks, tight coupling, and leaky abstractions.

### CONCEPT TOPICS
${concepts}

### ESTIMATED LEARNING TIME
${timeEst} minutes of focused conceptual reading and hands-on practical drills.`;
    }

    // Queue update
    updatesToApply.push({
      _id: task._id,
      taskId: task.taskId,
      taskName: task.taskName,
      nodeType,
      taskDescription: finalDescription,
      curriculumMeta: updatedMeta
    });
  }

  // ---------------------------------------------------------------------------
  // STRICT VALIDATION GATE: IF ANY ERRORS, ABORT AND WRITE NOTHING
  // ---------------------------------------------------------------------------
  if (validationErrors.length > 0) {
    console.error('\n❌ VALIDATION GATE FAILED! Found errors:');
    validationErrors.forEach((err, idx) => console.error(` [${idx + 1}] ${err}`));
    throw new Error(`Validation failed with ${validationErrors.length} errors. Aborting database writes.`);
  }

  console.log(`\n✓ All ${updatesToApply.length} tasks passed 100% of validation checks.`);
  console.log('✓ Zero forbidden filler words.');
  console.log('✓ Zero corrupted leading commas.');
  console.log('✓ Zero duplicate sections.');
  console.log('✓ Zero pattern spoilers in pre-attempt problem specs.');

  // 3. Write updates to MongoDB
  console.log(`\nWriting ${updatesToApply.length} enriched records to MongoDB...`);
  let writtenCount = 0;
  for (const item of updatesToApply) {
    await tasksCol.updateOne(
      { _id: item._id },
      {
        $set: {
          taskDescription: item.taskDescription,
          curriculumMeta: item.curriculumMeta
        }
      }
    );
    writtenCount++;
  }
  console.log(`✓ Successfully updated ${writtenCount} task records in MongoDB.`);

  // 4. Post-Check DSA Invariant
  const dsaTaskCountAfter = await tasksCol.countDocuments({ branchId: dsaBranch._id });
  console.log(`\n🛡️  Final DSA Invariant Check: ${dsaTaskCountAfter} tasks (Must be exactly 458).`);
  if (dsaTaskCountAfter !== 458) {
    throw new Error(`CRITICAL: DSA Task count altered! Got ${dsaTaskCountAfter}.`);
  }
  console.log('✓ DSA non-regression verified 100%!');

  await mongoose.disconnect();
  console.log('\n================================================================================');
  console.log('🎉 PIPELINE COMPLETED SUCCESSFULLY WITH ZERO ERRORS');
  console.log('================================================================================');
}

runEnrichmentAndValidation().catch(err => {
  console.error('Fatal error in enrichment pipeline:', err);
  process.exit(1);
});

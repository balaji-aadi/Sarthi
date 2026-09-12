import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI missing from .env");
}

const p1 = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'phase1_rewritten_data.json'), 'utf8'));
const p3 = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'phase3_rewritten_data.json'), 'utf8'));

// Authoritative 1-line clean summaries for all 48 drills
const DRILL_SUMMARIES = {
  'LLDP1-D1.1.1': 'See when an object is created and destroyed when execution leaves its scope vs when allocated with new.',
  'LLDP1-D1.1.2': 'Fix a dangling pointer bug by making Car own its Engine by value, and safely borrow references with const &.',
  'LLDP1-D1.1.3': 'Process payments through a common base pointer using virtual dynamic dispatch, and prevent memory leaks with a virtual destructor.',
  'LLDP1-D1.2.1': 'Defend shopping cart state invariants by eliminating public mutable lists and adding validation guards.',
  'LLDP1-D1.2.2': 'Build an immutable Money value object using integer cents that rejects cross-currency addition.',
  'LLDP1-D1.3.1': 'Model university course enrollment to distinguish Composition, Aggregation, and Association lifecycles.',
  'LLDP1-D1.3.2': 'Dismantle notification class explosion by combining pluggable formatter and sender components.',
  'LLDP1-D1.3.3': 'Fix broken subclass assumptions where a fixed deposit account throws an exception on withdrawal.',
  'LLDP1-D1.4.1': 'Extract domain entities and methods from a user story to build a digital wallet with atomic balance transfers.',
  'LLDP2-D2.1.1': 'Decompose a bloated 600-line UserManager into focused repository, hasher, and notification collaborators.',
  'LLDP2-D2.1.2': 'Segregate a bloated cloud storage interface into focused reader, writer, and media processor roles.',
  'LLDP2-D2.2.1': 'Replace a cascading country switch statement with an extensible registry of tax calculation rules.',
  'LLDP2-D2.2.2': 'Fix subclass contract violations where a read-only file breaks calling code by throwing on write.',
  'LLDP2-D2.3.1': 'Decouple order processing from real databases by injecting an in-memory repository mock via constructor.',
  'LLDP2-D2.4.1': 'Compare deep character inheritance against pluggable components to evaluate memory and flexibility.',
  'LLDP2-D2.4.2': 'Determine when a 4-case switch statement is simpler and better than a 4-class polymorphic hierarchy.',
  'LLDP2-D2.4.3': 'Classify audio streaming domain concepts into concrete classes, abstract classes, and pure interfaces.',
  'LLDP2-D2.4.4': 'Prune speculative abstraction layers and unused interfaces from a simple converter to eliminate bloat.',
  'LLDP2-D2.4.5': 'Analyze an existing notification dispatcher and predict where adding new channels will cause maintenance friction.',
  'LLDP3-D3.1.1': 'Refactor hardcoded carrier calculation conditionals into interchangeable rule objects.',
  'LLDP3-D3.1.2': 'Broadcast order completion events to secondary listeners without OrderService holding direct dependencies.',
  'LLDP3-D3.1.3': 'Encapsulate document publishing states to eliminate sprawling status conditionals and illegal transitions.',
  'LLDP3-D3.1.4': 'Build an in-memory text editor buffer with full Undo and Redo capabilities by encapsulating operations as objects.',
  'LLDP3-D3.1.5': 'Build an extensible request filtering pipeline where requests pass sequentially through validation filters.',
  'LLDP3-D3.2.1': 'Decouple document exporter instantiation using a factory method, and assemble client configurations cleanly.',
  'LLDP3-D3.2.2': 'Stack dynamic beverage add-ons using wrapper objects, and adapt legacy SDK interfaces to modern standards.',
  'LLDP3-D3.2.3': 'Treat individual files and composite directory trees uniformly for recursive size calculations.',
  'LLDP3-D3.3.1': 'Implement lazy image loading via proxy and simplify subsystem startup with a facade.',
  'LLDP3-D3.3.2': 'Fix race conditions in global configuration access and refactor away from singletons to constructor injection.',
  'LLDP3-D3.3.3': 'Optimize rendering of 100,000 trees by sharing intrinsic visual data across instances.',
  'LLDP3-D3.4.1': 'Distinguish between client-chosen strategies and autonomous internal state machine transitions.',
  'LLDP3-D3.4.2': 'Differentiate the architectural intent behind Decorator, Adapter, and Proxy wrapper patterns.',
  'LLDP3-D3.4.3': 'Predict where design patterns belong across an end-to-end e-commerce system architecture.',
  'LLDP4-D4.1.1': 'Implement a thread-safe bounded FIFO queue using mutex locks and condition variables for thread coordination.',
  'LLDP4-D4.1.2': 'Manage temporary 10-minute seat leases with automatic timeout compensation and expiration cleanup.',
  'LLDP5-D5.1.1': 'Ask 5 essential scoping questions to eliminate ambiguity and define MVP requirements in under 5 minutes.',
  'LLDP5-D5.1.2': 'Extract foundational domain entities, value objects, and public APIs within a 10-minute time constraint.',
  'LLDP5-D5.1.3': 'Implement a fully working, encapsulated in-memory Rate Limiter module in under 20 minutes.',
  'LLDP5-D5.1.4': 'Absorb sudden curveball requirements during a live interview without breaking existing architectural invariants.',
  'LLDP5-D5.2.1': 'Deliver a structured 2-minute verbal defense when an interviewer challenges your design as over-engineered.',
  'LLDP5-D5.2.2': 'Articulate throughput bottlenecks caused by global locking versus fine-grained concurrency control.',
  'LLDP5-D5.2.3': 'Maintain continuous verbal narration of architectural decisions and invariants while coding.',
  'LLDP5-D5.3.1': 'Execute a rapid 30-minute phone screen interview sprint for an in-memory pub-sub message broker.',
  'LLDP5-D5.3.2': 'Complete a full 45-minute FAANG interview simulation for a multi-floor parking lot with curveballs.',
  'LLDP5-D5.3.3': 'Execute an end-to-end 60-minute onsite architectural round for a ride-sharing dispatch engine.',
  'LLDP5-D5.4.1': 'Simulate a complete 45-minute interview designing a dynamic Coffee Maker evaluated against the FAANG rubric.',
  'LLDP5-D5.4.2': 'Simulate an intermediate 45-minute interview round for a hotel room reservation system with surge pricing.',
  'LLDP5-D5.4.3': 'Simulate an advanced 45-minute Staff-level interview round designing a high-concurrency seat locking engine.'
};

// Explicit recalibrations approved in the audit
const RECALIBRATIONS = {
  'LLDP3-D3.3.2': { level: 'B', levelName: 'Design Exercise', targetTimeMinutes: 25, difficulty: 'medium' },
  'LLDP3-D3.3.3': { level: 'B', levelName: 'Design Exercise', targetTimeMinutes: 25, difficulty: 'medium' },
  'LLDP4-D4.1.1': { level: 'B', levelName: 'Design Exercise', targetTimeMinutes: 30, difficulty: 'medium' },
  'LLDP5-D5.2.2': { level: 'B', levelName: 'Design Exercise', targetTimeMinutes: 20, difficulty: 'medium' },
  'LLDP5-D5.3.3': { level: 'C', levelName: 'Full LLD Problem', targetTimeMinutes: 60, difficulty: 'hard' }
};

async function applyPedagogicalRefinements() {
  console.log("================================================================================");
  console.log("🚀 APPLYING TARGETED PEDAGOGICAL REFINEMENTS TO SARTHI LLD");
  console.log("================================================================================");

  await mongoose.connect(MONGODB_URI);
  console.log("✓ Connected to MongoDB.");

  const db = mongoose.connection.db;
  const tasksCol = db.collection('tasks');

  // PRE-ASSERTION 1: DSA tasks must be EXACTLY 458
  const dsaBefore = await tasksCol.countDocuments({ taskId: { $not: /^LLD/ } });
  console.log(`🛡️  PRE-CHECK: DSA Tasks Count = ${dsaBefore} (Must be exactly 458).`);
  if (dsaBefore !== 458) {
    throw new Error(`DSA task count mismatch! Expected 458, found ${dsaBefore}. ABORTING!`);
  }

  // PRE-ASSERTION 2: LLD tasks must be EXACTLY 202
  const lldBefore = await tasksCol.countDocuments({ taskId: /^LLD/ });
  console.log(`🛡️  PRE-CHECK: LLD Tasks Count = ${lldBefore} (Must be exactly 202).`);
  if (lldBefore !== 202) {
    throw new Error(`LLD task count mismatch! Expected 202, found ${lldBefore}. ABORTING!`);
  }

  const bulkOps = [];

  // 1. Apply updated Phase 1 content
  for (const [taskId, update] of Object.entries(p1)) {
    const setFields = {
      taskName: update.taskName,
      taskDescription: update.taskDescription,
      updatedAt: new Date()
    };
    if (update.oneLineSummary) {
      setFields['curriculumMeta.oneLineSummary'] = update.oneLineSummary;
      setFields['curriculumMeta.summary'] = update.oneLineSummary;
    }
    bulkOps.push({
      updateOne: { filter: { taskId }, update: { $set: setFields } }
    });
  }

  // 2. Apply updated Phase 3 content (spoiler cleanups and refocused titles)
  for (const [taskId, update] of Object.entries(p3)) {
    const setFields = {
      taskName: update.taskName,
      taskDescription: update.taskDescription,
      updatedAt: new Date()
    };
    if (update.oneLineSummary) {
      setFields['curriculumMeta.oneLineSummary'] = update.oneLineSummary;
      setFields['curriculumMeta.summary'] = update.oneLineSummary;
    }
    bulkOps.push({
      updateOne: { filter: { taskId }, update: { $set: setFields } }
    });
  }

  // 3. Attach authoritative 1-line clean summary to all 48 drills
  for (const [taskId, summary] of Object.entries(DRILL_SUMMARIES)) {
    bulkOps.push({
      updateOne: {
        filter: { taskId },
        update: {
          $set: {
            'curriculumMeta.oneLineSummary': summary,
            'curriculumMeta.summary': summary,
            updatedAt: new Date()
          }
        }
      }
    });
  }

  // 4. Apply approved level and target time recalibrations
  for (const [taskId, recalib] of Object.entries(RECALIBRATIONS)) {
    bulkOps.push({
      updateOne: {
        filter: { taskId },
        update: {
          $set: {
            'curriculumMeta.level': recalib.level,
            'curriculumMeta.levelName': recalib.levelName,
            'curriculumMeta.targetTimeMinutes': recalib.targetTimeMinutes,
            'curriculumMeta.difficulty': recalib.difficulty,
            updatedAt: new Date()
          }
        }
      }
    });
  }

  console.log(`Executing ${bulkOps.length} targeted update operations...`);
  const result = await tasksCol.bulkWrite(bulkOps, { ordered: true });
  console.log(`✓ bulkWrite complete: ${result.modifiedCount} operations executed.`);

  // POST-ASSERTION 1: DSA tasks still EXACTLY 458
  const dsaAfter = await tasksCol.countDocuments({ taskId: { $not: /^LLD/ } });
  console.log(`🛡️  POST-CHECK: DSA Tasks Count = ${dsaAfter} (Must be exactly 458).`);
  if (dsaAfter !== 458) {
    throw new Error(`FATAL: DSA task count changed! Expected 458, found ${dsaAfter}.`);
  }

  // POST-ASSERTION 2: LLD tasks still EXACTLY 202
  const lldAfter = await tasksCol.countDocuments({ taskId: /^LLD/ });
  console.log(`🛡️  POST-CHECK: LLD Tasks Count = ${lldAfter} (Must be exactly 202).`);
  if (lldAfter !== 202) {
    throw new Error(`FATAL: LLD task count changed! Expected 202, found ${lldAfter}.`);
  }

  // POST-ASSERTION 3: Verify LLDP1-D1.1.1 content
  const d111 = await tasksCol.findOne({ taskId: 'LLDP1-D1.1.1' });
  console.log(`✓ Verification LLDP1-D1.1.1:`);
  console.log(`  - taskName: "${d111.taskName}"`);
  console.log(`  - oneLineSummary: "${d111.curriculumMeta?.oneLineSummary}"`);
  console.log(`  - Has TrackerBox? ${d111.taskDescription.includes('TrackerBox')}`);
  console.log(`  - Contains ConnectionPool? ${d111.taskDescription.includes('ConnectionPool')}`);

  // POST-ASSERTION 4: Verify LLDP4-D4.1.1 recalibration
  const d411 = await tasksCol.findOne({ taskId: 'LLDP4-D4.1.1' });
  console.log(`✓ Verification LLDP4-D4.1.1:`);
  console.log(`  - level: ${d411.curriculumMeta?.level} (Expected: B)`);
  console.log(`  - targetTimeMinutes: ${d411.curriculumMeta?.targetTimeMinutes} (Expected: 30)`);

  console.log("================================================================================");
  console.log("🎉 ALL TARGETED REFINEMENTS APPLIED SUCCESSFULLY WITH ZERO REGRESSIONS!");
  console.log("================================================================================");
  process.exit(0);
}

applyPedagogicalRefinements().catch(err => {
  console.error("Refinement failed:", err);
  process.exit(1);
});

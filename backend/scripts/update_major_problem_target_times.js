/**
 * Updates realistic target times for all 15 Major LLD Problems in Sarthi database.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const updates = [
  // Phase 1
  { taskId: "LLDP1-P1", targetTimeMinutes: 75, reason: "Medium hardware state machine & exact change logic" },
  { taskId: "LLDP1-P2", targetTimeMinutes: 60, reason: "Foundation grid-based game engine & O(1) win logic" },
  { taskId: "LLDP1-P3", targetTimeMinutes: 60, reason: "Foundation resource consumption & recipe composition" },
  { taskId: "LLDP1-P4", targetTimeMinutes: 75, reason: "Medium catalog multiplicity, loan policies & reservation queue" },

  // Phase 2
  { taskId: "LLDP2-P1", targetTimeMinutes: 90, reason: "Multi-floor spot allocation, dynamic fee strategy & EV charging" },
  { taskId: "LLDP2-P2", targetTimeMinutes: 90, reason: "Hardware peripherals, state-driven session & cassette dispensing" },
  { taskId: "LLDP2-P3", targetTimeMinutes: 90, reason: "Fleet catalog, temporal date conflict resolution & one-way dropoff" },

  // Phase 3
  { taskId: "LLDP3-P1", targetTimeMinutes: 90, reason: "Multi-car bank controller, LOOK/SCAN dispatch & door sensor invariants" },
  { taskId: "LLDP3-P2", targetTimeMinutes: 90, reason: "Multi-currency split strategies & min-cash-flow graph debt simplification" },
  { taskId: "LLDP3-P3", targetTimeMinutes: 60, reason: "Foundation turn-based board game engine & extensible jump cells" },
  { taskId: "LLDP3-P4", targetTimeMinutes: 75, reason: "Channel decorators, user preference pipeline & provider failover" },

  // Phase 4
  { taskId: "LLDP4-P1", targetTimeMinutes: 120, reason: "High-concurrency temporal seat locking, TTL lease & payment timeout" },
  { taskId: "LLDP4-P2", targetTimeMinutes: 120, reason: "Spatial proximity matching, timed dispatch cascade & surge multiplier" },
  { taskId: "LLDP4-P3", targetTimeMinutes: 105, reason: "Full piece hierarchy, path obstruction, special moves & check scanner" },
  { taskId: "LLDP4-P4", targetTimeMinutes: 120, reason: "Multi-sided marketplace, cart invariants & multi-actor event tracking" }
];

async function updateMajorProblemTimes() {
  console.log("================================================================================");
  console.log("⏱️  UPDATING REALISTIC TARGET TIMES FOR 15 MAJOR LLD PROBLEMS");
  console.log("================================================================================");

  const connectDB = (await import('../config/db.config.js')).default;
  await connectDB();

  const { Branch } = await import('../models/branch.model.js');
  const { Task } = await import('../models/task.model.js');

  const lldBranch = await Branch.findOne({ slug: "lld(low-level-design)" });
  if (!lldBranch) {
    throw new Error("LLD Branch not found!");
  }

  for (const item of updates) {
    const task = await Task.findOne({ branchId: lldBranch._id, taskId: item.taskId });
    if (!task) {
      console.warn(`⚠️  Task ${item.taskId} not found!`);
      continue;
    }

    task.curriculumMeta = task.curriculumMeta || {};
    task.curriculumMeta.targetTimeMinutes = item.targetTimeMinutes;
    task.estimatedHours = Math.ceil(item.targetTimeMinutes / 60);

    // Also update target time line in taskDescription if present
    if (task.taskDescription) {
      task.taskDescription = task.taskDescription.replace(
        /\* \*\*Target Time:\*\* \d+ minutes/g,
        `* **Target Time:** ${item.targetTimeMinutes} minutes`
      );
    }

    await task.save();
    console.log(`✓ [${item.taskId}] ${task.taskName} -> ${item.targetTimeMinutes} mins (${item.reason})`);
  }

  console.log("\n--- VERIFICATION ---");
  const verified = await Task.find({ branchId: lldBranch._id, taskType: "MajorProblem" }).sort({ taskId: 1 });
  for (const p of verified) {
    console.log(`- ${p.taskId}: "${p.taskName}" -> ${p.curriculumMeta?.targetTimeMinutes} mins (est: ${p.estimatedHours}h)`);
  }

  await mongoose.disconnect();
  console.log("================================================================================");
  console.log("✅ ALL 15 MAJOR LLD PROBLEMS UPDATED SUCCESSFULLY");
  console.log("================================================================================");
}

updateMajorProblemTimes().catch(err => {
  console.error("Update failed:", err);
  process.exit(1);
});

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
const p2 = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'phase2_rewritten_data.json'), 'utf8'));
const p3 = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'phase3_rewritten_data.json'), 'utf8'));
const p4 = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'phase4_rewritten_data.json'), 'utf8'));
const p5 = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'phase5_rewritten_data.json'), 'utf8'));

const allRewrittenData = { ...p1, ...p2, ...p3, ...p4, ...p5 };

async function applyRewrite() {
  console.log("================================================================================");
  console.log("🚀 COMMENCING SARTHI LLD v2.1 DATABASE SYNCHRONIZATION");
  console.log("================================================================================");

  await mongoose.connect(MONGODB_URI);
  console.log("✓ Connected to MongoDB.");

  const db = mongoose.connection.db;
  const tasksCol = db.collection('tasks');

  // PRE-ASSERTION 1: DSA tasks must be EXACTLY 458
  const dsaCountBefore = await tasksCol.countDocuments({ taskId: { $not: /^LLD/ } });
  console.log(`🛡️  PRE-CHECK: DSA Tasks Count = ${dsaCountBefore} (Must be exactly 458).`);
  if (dsaCountBefore !== 458) {
    throw new Error(`DSA task count mismatch! Expected 458, found ${dsaCountBefore}. ABORTING!`);
  }

  // PRE-ASSERTION 2: LLD tasks must be EXACTLY 202
  const lldCountBefore = await tasksCol.countDocuments({ taskId: /^LLD/ });
  console.log(`🛡️  PRE-CHECK: LLD Tasks Count = ${lldCountBefore} (Must be exactly 202).`);
  if (lldCountBefore !== 202) {
    throw new Error(`LLD task count mismatch! Expected 202, found ${lldCountBefore}. ABORTING!`);
  }

  // Apply atomic bulk update for all 202 LLD records
  const bulkOps = [];
  for (const [taskId, update] of Object.entries(allRewrittenData)) {
    const setFields = {
      taskName: update.taskName,
      taskDescription: update.taskDescription,
      updatedAt: new Date()
    };

    bulkOps.push({
      updateOne: {
        filter: { taskId },
        update: { $set: setFields }
      }
    });
  }

  console.log(`Executing bulkWrite for ${bulkOps.length} updates...`);
  const result = await tasksCol.bulkWrite(bulkOps, { ordered: true });
  console.log(`✓ bulkWrite complete: ${result.modifiedCount} documents modified.`);

  // POST-ASSERTION 1: DSA tasks still EXACTLY 458
  const dsaCountAfter = await tasksCol.countDocuments({ taskId: { $not: /^LLD/ } });
  console.log(`🛡️  POST-CHECK: DSA Tasks Count = ${dsaCountAfter} (Must be exactly 458).`);
  if (dsaCountAfter !== 458) {
    throw new Error(`FATAL: DSA task count changed! Expected 458, found ${dsaCountAfter}.`);
  }

  // POST-ASSERTION 2: LLD tasks still EXACTLY 202
  const lldCountAfter = await tasksCol.countDocuments({ taskId: /^LLD/ });
  console.log(`🛡️  POST-CHECK: LLD Tasks Count = ${lldCountAfter} (Must be exactly 202).`);
  if (lldCountAfter !== 202) {
    throw new Error(`FATAL: LLD task count changed! Expected 202, found ${lldCountAfter}.`);
  }

  // POST-ASSERTION 3: Verify no null/empty descriptions
  const emptyLld = await tasksCol.countDocuments({ taskId: /^LLD/, $or: [{ taskDescription: "" }, { taskDescription: { $exists: false } }] });
  if (emptyLld > 0) {
    throw new Error(`FATAL: ${emptyLld} LLD tasks have empty descriptions!`);
  }

  console.log("================================================================================");
  console.log("🎉 SUCCESS: ALL 202 LLD RECORDS SUCCESSFULLY REWRITTEN AND SYNCHRONIZED!");
  console.log("================================================================================");
  process.exit(0);
}

applyRewrite().catch(err => {
  console.error("Database sync failed:", err);
  process.exit(1);
});

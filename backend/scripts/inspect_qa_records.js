import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sarthi';

async function inspectRecords() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB Atlas.");

        const db = mongoose.connection.db;
        const tasksCol = db.collection('tasks');

        const targets = [
            { query: { taskId: "LLDP1-D1.1.1" }, label: "1. Stack vs Heap Allocation & Lifetime" },
            { query: { taskId: "LLDP1-D1.1.3" }, label: "2. Dynamic Method Dispatch & Virtual Destructors" },
            { query: { taskId: "LLDP1-D1.2.1" }, label: "3. Shopping Cart Invariants (Defending State Invariants in Shopping Cart)" },
            { query: { taskId: "LLDP5-D5.4.1" }, label: "4. Level C Drill: Foundation Tier Full Mock Simulation" },
            { query: { taskId: "LLDP2-P1" }, label: "5. Parking Lot Major Problem (Problem 5 — Design a Multi-Floor Parking Lot)" },
            { query: { taskId: "LLDP2-P1-V2" }, label: "6. Parking Lot Version 2 (Version 2: Vehicle & Spot Multiplicity)" }
        ];

        for (const target of targets) {
            const task = await tasksCol.findOne(target.query);
            console.log("\n================================================================================");
            console.log(`INSPECTING: ${target.label}`);
            console.log("================================================================================");
            if (!task) {
                console.log("NOT FOUND!");
                continue;
            }
            console.log(`Task ID: ${task.taskId}`);
            console.log(`Task Name: ${task.taskName}`);
            console.log(`Node Type: ${task.curriculumMeta?.nodeType}`);
            console.log(`Action Verb: ${task.curriculumMeta?.actionVerb}`);
            console.log(`Level: ${task.curriculumMeta?.level}`);
            console.log(`Difficulty: ${task.curriculumMeta?.difficulty}`);
            console.log(`Target Time: ${task.curriculumMeta?.targetTimeMinutes} mins`);
            console.log(`Concept Topics: ${(task.curriculumMeta?.conceptTopics || []).join(', ')}`);
            console.log("\n--- CONTENT / SECTIONS ---");
            console.log(task.taskDescription);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error inspecting records:", err);
        process.exit(1);
    }
}

inspectRecords();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const PARENT_TASK_ID = '6a30c5bef7cfd43d78e67c36';

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Task = mongoose.connection.collection('tasks');
        const tasks = await Task.find({
            parentTask: new mongoose.Types.ObjectId(PARENT_TASK_ID)
        }).sort({ taskId: 1 }).toArray();

        console.log(`Found ${tasks.length} subtasks.`);
        tasks.forEach((t) => {
            console.log(`Task ID: ${t.taskId}`);
            console.log(`Name: ${t.taskName}`);
            console.log(`Description: ${t.taskDescription}`);
            console.log(`Notes: ${t.additionalNotes}`);
            console.log('-'.repeat(45));
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();

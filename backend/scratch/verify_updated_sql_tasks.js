import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const PARENT_TASK_ID = '6a30c5bef7cfd43d78e67c36';

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Task = mongoose.connection.collection('tasks');

        // 1. Verify Parent Task
        const parent = await Task.findOne({ _id: new mongoose.Types.ObjectId(PARENT_TASK_ID) });
        if (!parent) {
            console.error('❌ FAILED: Parent task not found!');
            process.exit(1);
        }
        console.log('✅ Parent Task Found:', parent.taskName);
        if (parent.taskName !== "SQL & Database Design (5-Day Plan)") {
            console.error(`❌ FAILED: Parent task name is "${parent.taskName}" instead of "SQL & Database Design (5-Day Plan)"`);
            process.exit(1);
        }
        if (parent.subtaskStats.total !== 25) {
            console.error(`❌ FAILED: Parent subtaskStats.total is ${parent.subtaskStats.total} instead of 25`);
            process.exit(1);
        }
        console.log('✅ Parent name and subtask count are correct.');

        // 2. Verify Old Tasks are deleted
        const oldTasks = await Task.find({
            taskId: { $in: ['RGB-32', 'RGB-33', 'RGB-34', 'RGB-35', 'RGB-36', 'RGB-37', 'RGB-38', 'RGB-39'] }
        }).toArray();
        if (oldTasks.length > 0) {
            console.error(`❌ FAILED: Found ${oldTasks.length} old subtasks that should have been deleted!`);
            process.exit(1);
        }
        console.log('✅ Old subtasks successfully deleted.');

        // 3. Verify New Tasks are inserted correctly
        const newTasks = await Task.find({
            parentTask: new mongoose.Types.ObjectId(PARENT_TASK_ID)
        }).sort({ taskId: 1 }).toArray();

        if (newTasks.length !== 25) {
            console.error(`❌ FAILED: Found ${newTasks.length} subtasks under parent instead of 25!`);
            process.exit(1);
        }
        console.log('✅ Correct count of new subtasks (25) verified.');

        let hasError = false;
        newTasks.forEach((t, i) => {
            const expectedId = `RGB-${72 + i}`;
            if (t.taskId !== expectedId) {
                console.error(`❌ FAILED: Expected taskId ${expectedId}, got ${t.taskId}`);
                hasError = true;
            }
            if (t.youtubeUrl !== "") {
                console.error(`❌ FAILED: Expected empty youtubeUrl for ${t.taskId}, got "${t.youtubeUrl}"`);
                hasError = true;
            }
            // Check dates are strictly between 2026-07-01 and 2026-07-05
            const startDateStr = t.taskStartDate.toISOString().split('T')[0];
            const dueDateStr = t.taskDueDate.toISOString().split('T')[0];
            if (startDateStr < '2026-07-01' || startDateStr > '2026-07-05') {
                console.error(`❌ FAILED: Task ${t.taskId} start date is out of range: ${startDateStr}`);
                hasError = true;
            }
            if (dueDateStr < '2026-07-01' || dueDateStr > '2026-07-05') {
                console.error(`❌ FAILED: Task ${t.taskId} due date is out of range: ${dueDateStr}`);
                hasError = true;
            }
        });

        if (hasError) {
            process.exit(1);
        }

        console.log('✅ All 25 subtasks verified successfully with correct IDs, empty youtubeUrl, and start/due dates within range!');
        console.log('First subtask example:', JSON.stringify(newTasks[0], null, 2));
        console.log('Last subtask example:', JSON.stringify(newTasks[24], null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Verification error:', err);
        process.exit(1);
    }
};

verify();

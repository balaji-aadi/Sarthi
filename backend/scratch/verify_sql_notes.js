import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const PARENT_TASK_ID = '6a30c5bef7cfd43d78e67c36';
const USER_ID = '6993047f16e85ff3e4efd9a3';

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Task = mongoose.connection.collection('tasks');
        const Note = mongoose.connection.collection('notes');

        const childTasks = await Task.find({
            parentTask: new mongoose.Types.ObjectId(PARENT_TASK_ID)
        }).sort({ taskId: 1 }).toArray();

        console.log(`Checking ${childTasks.length} child tasks...`);

        let errors = 0;
        let verifiedCount = 0;

        for (const task of childTasks) {
            // Verify additionalNotes is untouched
            if (task.additionalNotes && task.additionalNotes !== '') {
                console.error(`❌ Error: Task ${task.taskId} additionalNotes is populated: "${task.additionalNotes}"`);
                errors++;
            }

            // Verify linked note in notes collection
            const note = await Note.findOne({
                taskId: task._id,
                userId: new mongoose.Types.ObjectId(USER_ID)
            });

            if (!note) {
                console.error(`❌ Error: No note found in notes collection for Task ${task.taskId} (ID: ${task._id})`);
                errors++;
            } else {
                console.log(`✅ Verified note for Task ${task.taskId}: "${note.title}" (Content length: ${note.content.length})`);
                verifiedCount++;
            }
        }

        console.log('\n--- VERIFICATION SUMMARY ---');
        if (errors === 0) {
            console.log(`✅ Success: All ${verifiedCount} SQL & Database Design task notes verified in notes collection.`);
            console.log('✅ Success: All tasks additionalNotes fields remained clean/empty.');
            process.exit(0);
        } else {
            console.error(`❌ Failure: Found ${errors} validation errors.`);
            process.exit(1);
        }
    } catch (err) {
        console.error('Verification error:', err);
        process.exit(1);
    }
};

run();

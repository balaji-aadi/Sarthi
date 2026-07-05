import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Task = mongoose.connection.collection('tasks');
        const tasks = await Task.find({ taskId: /^RGB-/ }).toArray();
        let maxNum = 0;
        tasks.forEach(t => {
            const num = parseInt(t.taskId.split('-')[1]);
            if (num > maxNum) {
                maxNum = num;
            }
        });
        console.log('Max RGB task ID suffix:', maxNum);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();

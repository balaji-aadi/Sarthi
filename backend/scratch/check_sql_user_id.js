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
        const Task = mongoose.connection.collection('tasks');
        const parent = await Task.findOne({ _id: new mongoose.Types.ObjectId('6a30c5bef7cfd43d78e67c36') });
        console.log('Parent Task details:');
        console.log('createdBy:', parent?.createdBy);
        console.log('assignee:', parent?.assignee);

        const firstChild = await Task.findOne({ parentTask: parent?._id });
        console.log('\nFirst Child details:');
        console.log('createdBy:', firstChild?.createdBy);
        console.log('assignee:', firstChild?.assignee);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();

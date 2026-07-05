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

        const Project = mongoose.connection.collection('projects');
        const Task = mongoose.connection.collection('tasks');

        const projects = await Project.find({ name: /Resume Grinding/i }).toArray();
        console.log('Projects matching Resume Grinding:', projects.map(p => ({ id: p._id, name: p.name, key: p.key })));

        if (projects.length > 0) {
            const projectId = projects[0]._id;
            const parentTasks = await Task.find({ projectName: projectId, parentTask: null }).toArray();
            console.log('Parent Tasks:');
            for (const pt of parentTasks) {
                console.log(`- ${pt.taskName} (${pt.taskId}) - ID: ${pt._id}`);
                const children = await Task.find({ parentTask: pt._id }).toArray();
                console.log(`  Children count: ${children.length}`);
                children.forEach(c => {
                    console.log(`    * ${c.taskName} (${c.taskId}) - Date: ${c.taskStartDate ? c.taskStartDate.toISOString().split('T')[0] : 'No Date'}`);
                });
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Connection error:', error);
        process.exit(1);
    }
};

const taskSchema = new mongoose.Schema({}, { strict: false });
const Task = mongoose.model('Task', taskSchema, 'tasks');

const run = async () => {
    await connectDB();
    
    const tasks = await Task.find({
        title: { $regex: /English (Speaking|Writing) Practice/i }
    });
    
    console.log(`Found ${tasks.length} tasks matching the titles.`);
    tasks.forEach(t => {
        console.log(`Task ID: ${t._id}, Title: "${t.title}", Parent Task ID: ${t.parentTask}`);
    });
    
    process.exit(0);
};

run();

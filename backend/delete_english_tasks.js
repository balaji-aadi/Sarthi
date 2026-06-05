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

const taskSchema = new mongoose.Schema({
    taskName: String,
    parentTask: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }
}, { strict: false });
const Task = mongoose.model('Task', taskSchema, 'tasks');

const findChildrenRecursively = async (parentIds, allIds = new Set()) => {
    if (!parentIds || parentIds.length === 0) return Array.from(allIds);
    
    parentIds.forEach(id => allIds.add(id.toString()));
    
    const children = await Task.find({ parentTask: { $in: parentIds } });
    const childIds = children.map(c => c._id);
    
    if (childIds.length > 0) {
        return findChildrenRecursively(childIds, allIds);
    }
    
    return Array.from(allIds);
};

const run = async () => {
    await connectDB();
    
    const rootTasks = await Task.find({
        taskName: { $regex: /English (Speaking|Writing) Practice/i }
    });
    
    console.log(`Found ${rootTasks.length} root tasks.`);
    
    const rootIds = rootTasks.map(t => t._id);
    
    const allTaskIdsToDelete = await findChildrenRecursively(rootIds);
    
    console.log(`Found a total of ${allTaskIdsToDelete.length} tasks (including children) to delete.`);
    
    const result = await Task.deleteMany({ _id: { $in: allTaskIdsToDelete } });
    
    console.log(`Successfully deleted ${result.deletedCount} tasks.`);
    
    process.exit(0);
};

run();

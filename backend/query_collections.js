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

const run = async () => {
    await connectDB();
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(collections.map(c => c.name));
    
    // Check epic collection
    const epicSchema = new mongoose.Schema({}, { strict: false });
    const Epic = mongoose.model('Epic', epicSchema, 'epics');
    
    const epics = await Epic.find({
        title: { $regex: /English/i }
    });
    console.log(`Found ${epics.length} epics matching 'English'`);
    epics.forEach(e => console.log(`Epic ID: ${e._id}, Title: ${e.title}`));

    process.exit(0);
};

run();

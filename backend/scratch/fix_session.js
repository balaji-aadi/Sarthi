import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGODB_URI;

// Models
const focusSessionSchema = new mongoose.Schema({
    user: mongoose.Schema.Types.ObjectId,
    duration: Number,
    date: Date,
    taskName: String
}, { collection: 'focussessions' });

const FocusSession = mongoose.model('FocusSession', focusSessionSchema);

async function run() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const start = new Date('2026-04-01T00:00:00Z');
    const end = new Date('2026-04-30T23:59:59Z');

    const sessions = await FocusSession.find({
        date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    console.log(`Found ${sessions.length} sessions in April`);
    sessions.forEach(s => {
        console.log(`Date: ${s.date.toISOString()} | Duration: ${s.duration} mins | Task: ${s.taskName}`);
    });

    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});

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

        const Note = mongoose.connection.collection('notes');
        const notes = await Note.find({}).limit(5).toArray();

        console.log(`Found ${notes.length} notes:`);
        notes.forEach((n) => {
            console.log(JSON.stringify(n, null, 2));
            console.log('='.repeat(50));
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();

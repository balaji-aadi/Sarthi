import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read manifest
const manifestPath = path.resolve(__dirname, '../lld_tasks_manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

console.log(`Loaded manifest with ${manifest.length} tasks.`);

// We will build clean, handcrafted, beginner-first definitions for:
// - Modules
// - Units (10 sections: Problem, Small Example, Pain, Simple Idea, Technical Words, Why in LLD, Try It, Change Requirement, What It Taught Us, Can You Explain It?)
// - Drills (14 LeetCode-style sections)
// - Major Problems (10 LeetCode-style sections, zero spoilers)
// - Problem Versions (6 sections + post-attempt design review)

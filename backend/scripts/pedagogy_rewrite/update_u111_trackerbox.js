/**
 * Sarthi LLD — Clean up Unit 1.1.1: Replace ConnectionPool with TrackerBox
 * 
 * Satisfies:
 * 1. Consistent TrackerBox throughout:
 *    TrackerBox("StackBox")
 *    TrackerBox* b = new TrackerBox("HeapBox");
 *    Zero ConnectionPool anywhere.
 * 2. Structure: What is it? -> Why does it matter? -> Tiny C++ Example -> What should I notice? -> Practice
 * 3. Technically accurate theory:
 *    - local objects have automatic lifetime tied to scope
 *    - new creates an object with dynamic lifetime
 *    - when directly managing a dynamically allocated object, delete releases it
 *    - RAII ties resource cleanup to object lifetime
 * 4. Section 5 renamed to "Remember This" (Key Concepts)
 * 5. Experiment presented as:
 *    Step 1 — Automatic lifetime
 *    Step 2 — Dynamic lifetime
 *    Step 3 — Explicitly release
 *    with each C++ snippet rendered as a real code block.
 * 6. Guided discovery pedagogy preserved (no premature conclusions).
 * 7. Frozen curriculum counts preserved (202 LLD, 458 DSA).
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const U111_NEW_DESCRIPTION = `### Concept Notes: Object Lifetime & Resource Management
**What is it?**
In C++, local objects have an automatic lifetime tied directly to the scope \`{ ... }\` where they are created. When an object is created with \`new\`, it has a dynamic lifetime that persists in memory until \`delete\` is explicitly called.

**Why does it matter?**
Tying resource management (files, network connections, memory) directly to object lifetime ensures that cleanup occurs predictably and automatically when execution leaves scope, eliminating memory leaks and dangling pointers.

**Tiny C++ Example:**
\`\`\`cpp
// Automatic lifetime: destroyed deterministically when scope exits
{
    TrackerBox a("StackBox");
} // a.~TrackerBox() runs here automatically!

// Dynamic lifetime: persists in memory beyond the current block
TrackerBox* b = new TrackerBox("HeapBox");
delete b; // Destruction only happens when delete is explicitly executed
\`\`\`

**What should I notice?**
Notice that the local \`StackBox\` requires no manual cleanup instruction—its lifetime is governed by the curly braces \`{ ... }\`. The dynamic \`HeapBox\` remains active in memory until \`delete b\` is explicitly called.

→ Practice observing deterministic destruction and lifetime in the following drill.

### 1. What Are We Trying To Solve?
When your program creates data in memory, how do you make sure that resources get cleaned up automatically when you are done, instead of remaining allocated indefinitely?

### 2. See It With a Small Example
Observe these two distinct ways of creating an object:

Way 1 (Automatic Lifetime):
\`\`\`cpp
{
    TrackerBox a("StackBox"); // Created directly inside braces
} // As soon as execution leaves this closing brace, StackBox is automatically destroyed.
\`\`\`

Way 2 (Dynamic Lifetime):
\`\`\`cpp
TrackerBox* b = new TrackerBox("HeapBox"); // Created with "new"
// When execution leaves this scope, the pointer variable disappears,
// BUT HeapBox in memory is STILL ALIVE until explicitly deleted!
delete b; // Now HeapBox is destroyed.
\`\`\`

### 3. What Is Going Wrong?
If you allocate objects dynamically with \`new\` and forget to release them, your system gradually leaks memory until resources are exhausted. Conversely, if an object is destroyed while other components are still using it, your program will access invalid memory and crash.

### 4. The Simple Idea
Let the curly braces \`{ ... }\` govern the lifecycle. When an object lives directly inside a local scope, C++ guarantees that when execution leaves that block, the object's destructor runs deterministically and frees its resources.

### 5. Remember This
- **Automatic Lifetime**: Local objects whose storage and destruction are tied to the enclosing \`{ ... }\` block.
- **Dynamic Lifetime**: Objects requested with \`new\` whose lifetime continues until explicitly released with \`delete\`.
- **Destructor**: A special member function (like \`~TrackerBox()\`) called automatically when an object reaches the end of its lifetime.
- **RAII**: Resource Acquisition Is Initialization—the architectural principle where acquiring a resource is tied directly to the lifetime of an object.

### 6. Why This Matters in LLD
In production low-level design, database connections, locks, and open files must never be leaked. Knowing who owns an object and what scope governs its lifetime eliminates memory leaks and dangling pointers.

### 7. Guided Experiment: Object Lifetime in Action

#### Step 1 — Automatic Lifetime
Create a local instance inside curly braces:
\`\`\`cpp
{
    TrackerBox a("StackBox");
}
\`\`\`
Observe when the destructor executes relative to the closing brace.

#### Step 2 — Dynamic Lifetime
Create an object dynamically using \`new\`:
\`\`\`cpp
TrackerBox* b = new TrackerBox("HeapBox");
\`\`\`
Observe whether the destructor executes if you exit the block without calling \`delete\`.

#### Step 3 — Explicitly Release
Explicitly release the dynamically allocated object:
\`\`\`cpp
delete b;
\`\`\`
Observe the exact point in execution when the destructor runs.

### 8. What To Observe
Notice that you never had to write manual cleanup code for the local object—the closing curly brace guaranteed safety. With dynamic lifetime, cleanup requires an explicit \`delete\` or an ownership wrapper.

### 9. Can You Explain It?
Can you explain to a colleague why a local object created inside \`{ ... }\` cleans itself up automatically, while an object created with \`new\` persists until \`delete\` is executed?`;

async function updateU111() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);

  const taskSchema = new mongoose.Schema({
    taskId: String,
    taskName: String,
    taskDescription: String
  }, { strict: false });

  const Task = mongoose.model('Task', taskSchema);

  const u = await Task.findOne({ taskId: 'LLDP1-U1.1.1' });
  if (!u) {
    console.error('LLDP1-U1.1.1 not found!');
    process.exit(1);
  }

  u.taskDescription = U111_NEW_DESCRIPTION;
  await u.save();
  console.log('Successfully updated LLDP1-U1.1.1 with TrackerBox!');

  // Verify no ConnectionPool remains across entire database
  const staleTasks = await Task.find({ taskDescription: /ConnectionPool/ });
  console.log(`\nRemaining tasks in DB containing ConnectionPool: ${staleTasks.length}`);
  staleTasks.forEach(t => console.log('Stale task:', t.taskId, t.taskName));

  // Verify frozen counts
  const totalTasks = await Task.countDocuments();
  const dsaCount = await Task.countDocuments({ taskId: { $not: /^LLD/ } });
  const lldCount = await Task.countDocuments({ taskId: /^LLD/ });

  console.log('\n--- Curriculum Counts ---');
  console.log(`Total Tasks: ${totalTasks} (Expected: 660)`);
  console.log(`DSA Tasks:   ${dsaCount} (Expected: 458)`);
  console.log(`LLD Tasks:   ${lldCount} (Expected: 202)`);

  if (staleTasks.length === 0 && dsaCount === 458 && lldCount === 202) {
    console.log('>>> 100% CLEAN: Zero ConnectionPool in DB, all counts frozen! <<<');
  }

  await mongoose.disconnect();
}

updateU111().catch(err => {
  console.error('Failed to update U111:', err);
  process.exit(1);
});

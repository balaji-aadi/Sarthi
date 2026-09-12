import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../lld_tasks_manifest.json'), 'utf8'));
const p1 = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'phase1_rewritten_data.json'), 'utf8'));
const p2 = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'phase2_rewritten_data.json'), 'utf8'));
const p3 = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'phase3_rewritten_data.json'), 'utf8'));
const p4 = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'phase4_rewritten_data.json'), 'utf8'));
const p5 = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'phase5_rewritten_data.json'), 'utf8'));

const allData = { ...p1, ...p2, ...p3, ...p4, ...p5 };

const FORBIDDEN_FILLERS = [
  'guarantees high architectural fidelity',
  'catastrophic bugs and brittle code',
  'without architectural bloat',
  ', minimal implementation',
  '### Goal BUILD a clean'
];

let totalPass = 0;
let errors = [];

for (const task of manifest) {
  const authored = allData[task.taskId];
  if (!authored) {
    errors.push(`[MISSING TASK] ${task.taskId} missing authored content.`);
    continue;
  }

  const desc = authored.taskDescription || '';
  const name = authored.taskName || '';

  if (desc.trim().length < 50) {
    errors.push(`[TOO SHORT] ${task.taskId} description too short: ${desc.length} chars.`);
  }

  // Check forbidden filler
  for (const f of FORBIDDEN_FILLERS) {
    if (desc.includes(f)) {
      errors.push(`[FORBIDDEN FILLER] ${task.taskId} contains "${f}"`);
    }
  }

  const nodeType = task.curriculumMeta?.nodeType || task.taskType;

  // Unit validation
  if (nodeType === 'unit' || task.taskType === 'CurriculumUnit') {
    const requiredSections = [
      '### 1. What Are We Trying To Solve?',
      '### 2. See It With a Small Example',
      '### 3. What Is Going Wrong?',
      '### 4. The Simple Idea',
      '### 5. Technical Words',
      '### 6. Why This Matters in LLD',
      '### 7. Try It',
      '### 8. Now Change the Requirement',
      '### 9. What Did the Change Teach Us?',
      '### 10. Can You Explain It?'
    ];
    for (const sec of requiredSections) {
      if (!desc.includes(sec)) {
        errors.push(`[UNIT SECTION MISSING] ${task.taskId} missing "${sec}"`);
      }
    }
  }

  // Drill validation
  if (nodeType === 'drill' || task.taskType === 'CurriculumDrill') {
    const requiredSections = [
      '### Problem Statement',
      '### Context & Scenario',
      '### Starting Point',
      '### Your Task',
      '### API & Interface',
      '### Input & Interaction Model',
      '### Expected Behavior',
      '### Examples',
      '### Constraints & Assumptions',
      '### Edge Cases',
      '### Acceptance Criteria',
      '### What To Observe',
      '### Think About'
    ];
    for (const sec of requiredSections) {
      if (!desc.includes(sec)) {
        errors.push(`[DRILL SECTION MISSING] ${task.taskId} missing "${sec}"`);
      }
    }
  }

  // Major Problem validation
  if (nodeType === 'major_problem' || task.taskType === 'MajorProblem') {
    const requiredSections = [
      '### 1. Context & Scenario',
      '### 2. Functional Requirements',
      '### 3. Core Operations & API',
      '### 4. Expected Behavior',
      '### 5. Examples & Interaction Scenarios',
      '### 6. Constraints & Assumptions',
      '### 7. Edge Cases & Error Handling',
      '### 8. State & Lifecycle Rules',
      '### 9. Acceptance Criteria',
      '### 10. What You Need To Implement'
    ];
    for (const sec of requiredSections) {
      if (!desc.includes(sec)) {
        errors.push(`[PROBLEM SECTION MISSING] ${task.taskId} missing "${sec}"`);
      }
    }
    // Zero-spoiler check on pre-attempt problems
    if (/Strategy Pattern|Observer Pattern|State Pattern/i.test(desc)) {
      errors.push(`[SPOILER DETECTED] ${task.taskId} contains design pattern name in problem spec!`);
    }
  }

  // Problem Version validation
  if (nodeType === 'problem_version' || task.taskType === 'ProblemVersion') {
    const requiredSections = [
      '### 1. What Changed?',
      '### 2. Why Does the Previous Design Struggle?',
      '### 3. New Requirements',
      '### 4. Expected Observable Behavior',
      '### 5. Examples',
      '### 6. Acceptance Criteria'
    ];
    for (const sec of requiredSections) {
      if (!desc.includes(sec)) {
        errors.push(`[VERSION SECTION MISSING] ${task.taskId} missing "${sec}"`);
      }
    }
  }

  totalPass++;
}

console.log('================================================================');
console.log(`TOTAL RECORDS VALIDATED: ${totalPass} / 202`);
if (errors.length === 0) {
  console.log('✓ 100% QUALITY GATE VALIDATION PASSED WITH ZERO ERRORS!');
} else {
  console.log(`Found ${errors.length} validation errors:`);
  errors.slice(0, 20).forEach(e => console.log('  -', e));
  process.exit(1);
}
console.log('================================================================');

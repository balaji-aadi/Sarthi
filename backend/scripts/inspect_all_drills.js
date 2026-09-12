import { phase1Data } from './lld_v2_data/phase1_data.js';
import { phase2Data } from './lld_v2_data/phase2_data.js';
import { phase3Data } from './lld_v2_data/phase3_data.js';
import { phase4Data } from './lld_v2_data/phase4_data.js';
import { phase5Data } from './lld_v2_data/phase5_data.js';

const phases = [phase1Data, phase2Data, phase3Data, phase4Data, phase5Data];
let allDrills = [];
let allProblems = [];

phases.forEach((p, idx) => {
  p.modules?.forEach(m => {
    m.units?.forEach(u => {
      u.drills?.forEach(d => {
        allDrills.push({
          phase: idx + 1,
          module: m.taskName,
          unit: u.taskName,
          unitCode: u.unitCode,
          concepts: u.conceptTopics,
          drill: d
        });
      });
    });
  });
  p.majorProblems?.forEach(mp => {
    allProblems.push({
      phase: idx + 1,
      problem: mp
    });
  });
});

console.log(`Loaded ${allDrills.length} drills and ${allProblems.length} major problems.`);
console.log('\n--- First 5 Drills ---');
allDrills.slice(0, 5).forEach((item, i) => {
  console.log(`[${i+1}] ${item.drill.taskName} (${item.unitCode})`);
  console.log(`    Verb: ${item.drill.actionVerb}, Level: ${item.drill.level}`);
  console.log(`    Concepts: ${item.concepts.slice(0, 3).join(', ')}`);
  console.log(`    Raw Description preview: ${item.drill.taskDescription.slice(0, 100).replace(/\n/g, ' ')}...`);
});

console.log('\n--- All 15 Major Problems ---');
allProblems.forEach((mp, i) => {
  console.log(`[${i+1}] Phase ${mp.phase} - ${mp.problem.taskName} (${mp.problem.versions?.length || 0} versions)`);
});

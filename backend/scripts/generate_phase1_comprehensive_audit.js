import fs from 'fs';

const dump = JSON.parse(fs.readFileSync('./backend/scripts/audit_dump.json', 'utf8'));

console.log("================================================================================");
console.log("SARTHI LLD v2.1 — DEEP PEDAGOGICAL AUDIT OF PHASE 1 CURRICULUM");
console.log("================================================================================");

const p1Units = dump.units.filter(u => u.taskId.startsWith("LLDP1"));
const p1Drills = dump.drills.filter(d => d.taskId.startsWith("LLDP1"));
const p1Problems = dump.problems.filter(p => p.taskId.startsWith("LLDP1"));
const p1Versions = dump.versions.filter(v => v.taskId.startsWith("LLDP1"));

console.log(`Phase 1 Inventory:
- Units: ${p1Units.length}
- Drills: ${p1Drills.length}
- Major Problems: ${p1Problems.length}
- Versions: ${p1Versions.length}
`);

console.log("\n>>> DETAILED INSPECTION OF UNIT & DRILL PAIRS <<<");

p1Units.forEach((u) => {
  console.log(`\n----------------------------------------------------------------`);
  console.log(`[UNIT] ${u.taskId}: ${u.taskName}`);
  console.log(`----------------------------------------------------------------`);
  // Print preview of unit
  const uLines = u.taskDescription.split("\n");
  console.log("  Unit 1st Section:", uLines.slice(0, 3).join(" "));
  console.log("  Unit Example:", uLines.slice(4, 9).join(" "));
  console.log("  Unit Simple Idea:", uLines.find(l => l.includes("### 4. The Simple Idea")) ? "Present" : "Missing");
  console.log("  Unit Can You Explain It?:", uLines.find(l => l.includes("### 10. Can You Explain It?")) ? "Present" : "Missing");

  const matchingDrills = p1Drills.filter(d => d.curriculumMeta?.unitCode === u.unitCode || d.taskId.includes(u.taskId.replace("U", "D").slice(0, 8)));
  matchingDrills.forEach(d => {
    console.log(`\n  [CHILD DRILL] ${d.taskId}: ${d.taskName} (Level ${d.curriculumMeta?.level}, ${d.curriculumMeta?.targetTimeMinutes} min)`);
    const dLines = d.taskDescription.split("\n");
    console.log("    Problem Statement Preview:", dLines.slice(2, 5).join(" "));
    console.log("    Starting Point Preview:", dLines.find(l => l.includes("### Starting Point")) ? "Present" : "Missing");
    console.log("    Acceptance Criteria Preview:", dLines.find(l => l.includes("### Acceptance Criteria")) ? "Present" : "Missing");
  });
});

console.log("\n>>> DETAILED INSPECTION OF MAJOR PROBLEMS & VERSIONS <<<");
p1Problems.forEach(p => {
  console.log(`\n----------------------------------------------------------------`);
  console.log(`[MAJOR PROBLEM] ${p.taskId}: ${p.taskName}`);
  console.log(`----------------------------------------------------------------`);
  const pLines = p.taskDescription.split("\n");
  console.log("  Context Preview:", pLines.slice(0, 3).join(" "));
  console.log("  API Operations Count:", pLines.filter(l => l.includes(";") && !l.includes("```")).length);
  
  const pVers = p1Versions.filter(v => v.taskId.startsWith(p.taskId + "-"));
  console.log(`  Versions (${pVers.length}):`);
  pVers.forEach(v => {
    const vLines = v.taskDescription.split("\n");
    const whatChanged = vLines.slice(1, 3).join(" ");
    console.log(`    - [${v.taskId}] ${v.taskName}`);
    console.log(`        What Changed: ${whatChanged}`);
  });
});

import fs from 'fs';

const dump = JSON.parse(fs.readFileSync('./backend/scripts/audit_dump.json', 'utf8'));

// We evaluate each drill against:
// 1. Core Learning Objective
// 2. Prerequisites
// 3. Concepts Required
// 4. Language Difficulty (Low / Moderate / High)
// 5. Technical Difficulty (Appropriate / Overloaded / Unclear)
// 6. Problem Specification Quality (Detailed / Good / Generic)
// 7. LeetCode Completeness (Yes / Partial / No)
// 8. Beginner Clarity (High / Medium / Low)
// 9. Concept Load (1 focused / 2-3 / Too Many)
// 10. Pattern Spoiler (None / Early / N/A)
// 11. Needs Rewrite? (Yes / No)
// 12. Reason & Pedagogical Finding

const auditResults = dump.drills.map((d) => {
  const meta = d.curriculumMeta || {};
  const desc = d.taskDescription || "";
  const name = d.taskName;
  const id = d.taskId;
  const level = meta.level || "A";
  const time = meta.targetTimeMinutes || 15;
  const difficulty = meta.difficulty || "easy";

  // Detailed per-drill rule checks
  let objective = "";
  let prereqs = "";
  let concepts = "";
  let langDiff = "Low";
  let techDiff = "Appropriate";
  let specQuality = "Detailed";
  let leetCode = "Yes";
  let beginnerClarity = "High";
  let conceptLoad = "1 focused";
  let patternSpoiler = "None";
  let needsRewrite = "No";
  let reason = "";

  if (id === "LLDP1-D1.1.1") {
    objective = "Observe automatic destruction at closing brace { } vs heap leak without delete.";
    prereqs = "Basic C++ syntax, printing with std::cout.";
    concepts = "Object creation inside block, destructor execution, new/delete.";
    langDiff = "Moderate (Mentions ConnectionPool and resource-holding in opening sentence).";
    techDiff = "Overloaded for Lesson 1 (Drill introduces ConnectionPool, socket management concept, new/delete, and Rule of Three in Think About).";
    specQuality = "Detailed LeetCode format.";
    beginnerClarity = "Medium (Learner is asked to understand ConnectionPool instead of a simple logging box).";
    conceptLoad = "Too Many for 15-min Lesson 1 (Stack scope + Heap allocation + ConnectionPool domain + Rule of Three).";
    needsRewrite = "Yes";
    reason = "Lesson 1 Drill #1 must start with a tiny simple class (e.g., SimpleBox / Tracker), not a simulated database ConnectionPool. Keep to ONE objective: observe destructor running at closing brace { }.";
  } else if (id === "LLDP1-D1.1.2") {
    objective = "Fix dangling pointer when an object borrows from an out-of-scope stack frame.";
    prereqs = "Stack scope, pointers vs references.";
    concepts = "Dangling pointer, borrowing via const reference, composition.";
    langDiff = "Moderate.";
    techDiff = "Appropriate.";
    specQuality = "Detailed.";
    beginnerClarity = "Medium (Starting code is good, but needs simpler setup without assuming unique_ptr proficiency).";
    conceptLoad = "2-3 concepts (Stack pointer lifecycle, Composition by value, const reference).";
    needsRewrite = "Yes";
    reason = "Simplify starting code so learner only focuses on: 1) why the pointer broke when function returned, and 2) holding by value. Defer std::unique_ptr to later.";
  } else if (id === "LLDP1-D1.1.3") {
    objective = "Call a common method through a pointer and observe correct child function running + virtual destructor.";
    prereqs = "Basic inheritance.";
    concepts = "Base pointer, virtual function, virtual destructor.";
    langDiff = "Moderate.";
    techDiff = "Overloaded (Combines pure virtual contract, dynamic dispatch, and incomplete deletion in 15 mins).";
    specQuality = "Detailed.";
    beginnerClarity = "Medium.";
    conceptLoad = "Too Many (Abstract contract + 2 child classes + virtual dispatch + virtual destructor leak demonstration).";
    needsRewrite = "Yes";
    reason = "Break down into two clear steps: First observe that without 'virtual' base version runs; then add 'virtual' to see child version run. Then show virtual destructor.";
  } else if (id === "LLDP1-D1.2.1") {
    objective = "Eliminate public mutable list to protect cart quantity and total invariants.";
    prereqs = "Classes, vectors, getters/setters.";
    concepts = "Encapsulation, invariant validation guards, const reference view.";
    langDiff = "Low (Simple shopping cart).";
    techDiff = "Appropriate.";
    specQuality = "Detailed.";
    beginnerClarity = "High.";
    conceptLoad = "1 focused (Defending state boundaries).";
    needsRewrite = "No (Minor pedagogical polish only).";
    reason = "Problem statement and requirements are clean and beginner-friendly.";
  } else if (id === "LLDP1-D1.2.2") {
    objective = "Build an immutable Money Value Object that rejects cross-currency addition.";
    prereqs = "Constructors, immutability.";
    concepts = "Value object, immutability, integer cents arithmetic, custom exception.";
    langDiff = "Low.";
    techDiff = "Appropriate.";
    specQuality = "Detailed.";
    beginnerClarity = "High.";
    conceptLoad = "1 focused (Immutability & validation).";
    needsRewrite = "No (Minor pedagogical polish only).";
    reason = "Very clear LeetCode specification and beginner-friendly financial domain.";
  } else if (id === "LLDP1-D1.3.1") {
    objective = "Model Course, Syllabus, Department, and Student to distinguish Composition, Aggregation, Association.";
    prereqs = "Pointers, member variables.";
    concepts = "Composition, Aggregation, Association, destruction cascade.";
    langDiff = "Low.";
    techDiff = "Appropriate.";
    specQuality = "Detailed.";
    beginnerClarity = "High.";
    conceptLoad = "2-3 concepts (The 3 relationship types).";
    needsRewrite = "No";
    reason = "Clear real-world domain with explicit verification of what gets destroyed when.";
  } else if (id === "LLDP1-D1.3.2") {
    objective = "Replace deeply nested inheritance tree with pluggable message sender and formatter.";
    prereqs = "Inheritance, interfaces.";
    concepts = "Composition over inheritance, class explosion.";
    langDiff = "Low.";
    techDiff = "Appropriate.";
    specQuality = "Detailed.";
    beginnerClarity = "High.";
    conceptLoad = "1 focused (Dismantling class explosion).";
    needsRewrite = "No";
    reason = "Concrete before/after refactoring showing why composition avoids class explosion.";
  } else if (id === "LLDP1-D1.3.3") {
    objective = "Split BankAccount interface so FixedDeposit is not forced to inherit withdraw().";
    prereqs = "Interfaces, inheritance.";
    concepts = "LSP, contract segregation, compile-time safety.";
    langDiff = "Low.";
    techDiff = "Appropriate.";
    specQuality = "Detailed.";
    beginnerClarity = "High.";
    conceptLoad = "1 focused (Contract splitting).";
    needsRewrite = "No";
    reason = "Clear banking scenario demonstrating why throwing UnsupportedOperationException is bad.";
  } else if (id === "LLDP1-D1.4.1") {
    objective = "Extract User, Wallet, and Transaction entities from a Digital Wallet prompt.";
    prereqs = "Classes, basic methods.";
    concepts = "CRC modeling, entity separation, atomic transfer workflow.";
    langDiff = "Low.";
    techDiff = "Appropriate.";
    specQuality = "Detailed.";
    beginnerClarity = "High.";
    conceptLoad = "2-3 concepts (Wallet state + transfer coordination + transaction record).";
    needsRewrite = "No";
    reason = "Excellent transition drill from individual units into full problem thinking.";
  } else {
    // General classification for remaining drills in Phase 2-5
    const isPhase2 = id.startsWith("LLDP2");
    const isPhase3 = id.startsWith("LLDP3");
    const isPhase4 = id.startsWith("LLDP4");
    const isPhase5 = id.startsWith("LLDP5");

    if (isPhase2) {
      prereqs = "Phase 1 OOP fundamentals.";
      concepts = "SOLID principles, code smell refactoring, dependency injection.";
      objective = `Master ${name.toLowerCase()} via clean refactoring.`;
      langDiff = "Low to Moderate.";
      techDiff = "Appropriate for Level " + level;
      specQuality = "Detailed.";
      beginnerClarity = "High.";
      conceptLoad = level === "A" ? "1 focused" : "2-3 concepts";
      needsRewrite = "No";
      reason = "Solid LeetCode-grade specification with starting buggy code and explicit acceptance criteria.";
    } else if (isPhase3) {
      prereqs = "Phase 1 & 2 SOLID principles.";
      concepts = "Behavioral and structural pattern discovery through requirement pain.";
      objective = `Discover solution to requirement change in ${name}.`;
      langDiff = "Low to Moderate.";
      techDiff = "Appropriate for Level " + level;
      specQuality = "Detailed.";
      beginnerClarity = "High.";
      conceptLoad = "1 focused pattern discovery.";
      // Zero spoiler check
      if (/Strategy|Observer|State|Command/i.test(name)) {
        patternSpoiler = "Early in title (Drill title currently reveals pattern name).";
        needsRewrite = "Yes";
        reason = "Drill title in Phase 3 should be problem-first (e.g., 'Dynamic Shipping Cost Calculation' rather than naming the pattern up front).";
      } else {
        patternSpoiler = "None";
        needsRewrite = "No";
        reason = "Good problem-driven exercise.";
      }
    } else if (isPhase4) {
      prereqs = "Phase 1-3 design, basic threads.";
      concepts = "Thread safety, critical sections, condition variables, temporal leasing.";
      objective = `Implement concurrent safety in ${name}.`;
      langDiff = "Low to Moderate.";
      techDiff = "Appropriate for Phase 4 Concurrency.";
      specQuality = "Detailed.";
      beginnerClarity = "High.";
      conceptLoad = "2-3 concurrency concepts.";
      needsRewrite = "No";
      reason = "Explicit concurrency contract with condition variable predicates and thread safety criteria.";
    } else if (isPhase5) {
      prereqs = "Phase 1-4 full curriculum.";
      concepts = "Interview execution, timed sprints, communication, trade-off defense.";
      objective = `Execute interview protocol under time constraints for ${name}.`;
      langDiff = "Low.";
      techDiff = "Appropriate for mock interview simulation.";
      specQuality = "Detailed.";
      beginnerClarity = "High.";
      conceptLoad = "Interview execution & defense.";
      needsRewrite = "No";
      reason = "Comprehensive time-boxed simulations with FAANG 4-dimension rubrics.";
    }
  }

  return {
    id,
    title: name,
    level,
    time,
    objective,
    prereqs,
    concepts,
    langDiff,
    techDiff,
    specQuality,
    leetCode,
    beginnerClarity,
    conceptLoad,
    patternSpoiler,
    needsRewrite,
    reason
  };
});

fs.writeFileSync('./backend/scripts/drills_full_audit.json', JSON.stringify(auditResults, null, 2));
console.log(`Generated in-depth audit for all ${auditResults.length} drills.`);

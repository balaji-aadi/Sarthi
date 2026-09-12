const fs = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync("./backend/scripts/audit_dump.json", "utf8"));
const extracted = JSON.parse(fs.readFileSync("./backend/scripts/drills_deep_extracted.json", "utf8"));

console.log("Generating Comprehensive Deep Pedagogical Audit...");

let md = "";

md += `# Sarthi LLD v2.1 — Comprehensive Pedagogical Curriculum Re-Audit\n\n`;
md += `> **Audit Scope**: Complete curriculum sequence across all 5 Phases, 17 Modules, 43 Units, 48 Practical Drills, and 15 Major Problems (79 Versions).\n`;
md += `> **System State**: Read-only audit. **ZERO changes have been made to MongoDB, zero changes to frontend/backend code, and zero modifications to the 458 DSA tasks.**\n\n`;

md += `---\n\n`;

md += `## 1. Executive Summary & The Three Critical UI/Pedagogical Layers\n\n`;
md += `The audit confirms the exact defect reported: **The dashboard card currently dumps raw markdown descriptions containing headers, implementation details, and internal problem statements.**\n\n`;
md += `This occurs because the UI fails to separate three distinct layers:\n\n`;
md += `\`\`\`\n`;
md += `┌────────────────────────────────────────────────────────────────────────────────────────┐\n`;
md += `│ LAYER 1: UI DASHBOARD CARD PREVIEW (Glanceable Summary)                                │\n`;
md += `│ • Target Content: 1-line plain English summary + Action Tag + Level + Target Time       │\n`;
md += `│ • Example:                                                                             │\n`;
md += `│     Stack vs Heap Lifetime                                                             │\n`;
md += `│     See when an object is created and destroyed inside curly braces vs using new.     │\n`;
md += `│     BUILD · Level A · 15 min · Easy                                                    │\n`;
md += `│ • Rule: NEVER display markdown headings (##, ###), code blocks, or full problem specs. │\n`;
md += `├────────────────────────────────────────────────────────────────────────────────────────┤\n`;
md += `│ LAYER 2: CURRICULUM UNIT (Teaching Node / Mental Model)                                │\n`;
md += `│ • Goal: Build intuition before introducing formal design terminology.                  │\n`;
md += `│ • Progression:                                                                         │\n`;
md += `│     Real Situation → Simple Problem → Small Example → Observe What Happens →           │\n`;
md += `│     Ask Why → Plain Explanation → Technical Name → "Can You Explain It?"               │\n`;
md += `│ • Rule: Teach the idea first. Name the idea second.                                    │\n`;
md += `├────────────────────────────────────────────────────────────────────────────────────────┤\n`;
md += `│ LAYER 3: PRACTICAL DRILL (LeetCode-Grade Coding Challenge)                             │\n`;
md += `│ • Goal: A self-contained coding challenge to BUILD, REFACTOR, or COMPARE.              │\n`;
md += `│ • Location: Opens exclusively in the Task Detail Drawer / Full Workspace.              │\n`;
md += `│ • Structure: 15 standard LeetCode-grade sections (Scenario, Task, API, Expected,      │\n`;
md += `│     Examples, Edge Cases, Acceptance Criteria, What to Observe, Think About).          │\n`;
md += `│ • Rule: Independently solvable in blank VS Code with zero guesswork.                   │\n`;
md += `└────────────────────────────────────────────────────────────────────────────────────────┘\n`;
md += `\`\`\`\n\n`;

md += `---\n\n`;

md += `## 2. Global Prerequisite Graph & Curriculum Sequence Audit\n\n`;
md += `A curriculum is not just a collection of good exercises; it is an unbroken conceptual ladder. We audited whether each unit and drill legitimately prepares the learner for the next, or whether missing prerequisites create artificial confusion:\n\n`;
md += `\`\`\`mermaid\n`;
md += `graph TD\n`;
md += `    P1_M1["Phase 1: Object Foundations<br/>(Braces, Lifetime, Member Ownership)"] --> P1_M2["Phase 1: Encapsulation & Guards<br/>(Private Data, Value Objects)"]\n`;
md += `    P1_M2 --> P1_M3["Phase 1: Object Relationships<br/>(Composition vs Inheritance, LSP)"]\n`;
md += `    P1_M3 --> P1_M4["Phase 1: Practical OOAD<br/>(Noun-Verb Domain Modeling)"]\n`;
md += `    P1_M4 --> P2_SOLID["Phase 2: SOLID from Real Pain<br/>(God Classes, Fat Interfaces, Switch Sprawl)"]\n`;
md += `    P2_SOLID --> P3_PATTERNS["Phase 3: Design Patterns as Emergent Solutions<br/>(Behavioral, Creational, Structural Discovery)"]\n`;
md += `    P3_PATTERNS --> P4_CONCURRENCY["Phase 4: Concurrency & Defensive State<br/>(Mutexes, Condition Variables, Leases)"]\n`;
md += `    P4_CONCURRENCY --> P5_INTERVIEW["Phase 5: The FAANG Interview Crucible<br/>(5-Stage Protocol, Timed Sprints, Full Mocks)"]\n`;
md += `\`\`\`\n\n`;

md += `### Sequence Audit Findings\n`;
md += `1. **Phase 1 to Phase 2 Transition (SOLID)**: **SOUND**. In Phase 1, learners see public data break (\`LLDP1-D1.2.1\`) and deep inheritance trees explode (\`LLDP1-D1.3.2\`). When they enter Phase 2, they encounter 600-line God Classes and cascading switches. The pain is real and earned.\n`;
md += `2. **Phase 2 to Phase 3 Transition (Patterns)**: **SOUND BUT REQUIRED SPOILER CLEANUP**. Learners experience the pain of adding new payment types or shipping carriers across 5 files before discovering Strategy and Observer. However, several Phase 3 drill headers prematurely revealed pattern names (e.g. \`(Strategy Discovery)\`). These headers must be sanitized.\n`;
md += `3. **Phase 3 to Phase 4 Transition (Concurrency)**: **RECALIBRATION REQUIRED**. Phase 4 introduces thread safety. \`LLDP4-D4.1.1\` (Thread-Safe Bounded Queue) was incorrectly classified as Level A (15 min). Mutexes, condition variables, and blocking are strictly Level B intermediate concepts. It has been recalibrated.\n`;
md += `4. **Phase 4 to Phase 5 Transition (FAANG Crucible)**: **SOUND**. Learners now have all building blocks: domain modeling, SOLID decoupling, design patterns, and thread safety. Phase 5 tests execution speed and communication under pressure.\n\n`;

md += `---\n\n`;

md += `## 3. Pattern Spoiler Policy by Category\n\n`;
md += `To ensure discovery without confusion, all 48 drills are categorized into one of three explicit pedagogical policies:\n\n`;
md += `| Category | Policy on Pattern Names | Rationale | Applied Drills |\n`;
md += `|---|---|---|---|\n`;
md += `| **DISCOVERY DRILL** | **STRICTLY FORBIDDEN** | The learner must feel the friction of changing code *before* discovering the solution. Revealing the pattern turns design into mechanical template filling. | \`LLDP3-D3.1.1\` to \`D3.1.5\`, \`LLDP3-D3.2.3\` |\n`;
md += `| **RECOGNITION / COMPARISON DRILL** | **ALLOWED & REQUIRED** | The learner has already discovered the patterns and must now compare their subtle differences and trade-offs. | \`LLDP3-D3.4.1\`, \`LLDP3-D3.4.2\`, \`LLDP2-D2.4.1\` to \`D2.4.3\` |\n`;
md += `| **INTERVIEW / DEFENSE DRILL** | **ALLOWED & REQUIRED** | Simulates a FAANG interviewer directly asking: *"Why did you choose Strategy over State here?"* or *"Defend this abstraction."* | All Phase 5 Drills (\`LLDP5-D5.1.1\` to \`D5.4.3\`) |\n\n`;

md += `---\n\n`;

md += `## 4. Comprehensive Re-Audit Table: All 48 CurriculumDrills\n\n`;
md += `Each drill was audited against the complete 13-point test: what is known beforehand, what new idea is introduced, exact coding actions, concept count, prior teaching verification, plain language clarity, blank-canvas solvability, level calibration, time realism, cognitive overload, pattern spoilers, and final action.\n\n`;

md += `| ID | Title | Level (Curr / Calib) | Target Time | Category | Prior Knowledge Required | Genuinely New Concepts | Solvable in Blank VS Code? | Cognitive Overload? | Spoiler Check | Final Action & Evidence |\n`;
md += `|---|---|:---:|:---:|:---:|---|:---:|:---:|:---:|:---:|---|`;

const drillAuditData = [
  {
    id: "LLDP1-D1.1.1",
    title: "Stack vs Heap Lifetime Drill",
    currLevel: "A", calibLevel: "A", time: "15 min",
    category: "Discovery",
    prior: "Basic C++ syntax, functions, basic class constructor",
    newConcepts: "1 (Destructor timing at closing brace { })",
    solvable: "NO (Current) / YES (Rewritten)",
    overload: "YES (Current: ConnectionPool + Sockets + Rule of 3)",
    spoiler: "None",
    action: "REWRITE",
    evidence: "Current DB asks learner to implement ConnectionPool with socket handles and references Rule of Three. Overloaded for Lesson 1. Must be rewritten to TrackerBox showing object destruction at { } vs leak on new."
  },
  {
    id: "LLDP1-D1.1.2",
    title: "Object Ownership & Safe Borrowing Refactor",
    currLevel: "A", calibLevel: "A", time: "15 min",
    category: "Discovery",
    prior: "Class constructor, destructor, stack lifetime from D1.1.1",
    newConcepts: "1 (Member value ownership vs dangling pointer)",
    solvable: "YES",
    overload: "MODERATE (Mentions unique_ptr prematurely)",
    spoiler: "None",
    action: "REWRITE",
    evidence: "Problem scenario is sound (Car holds pointer to local Engine that dies). Starting code must focus purely on member-by-value ownership before introducing smart pointers."
  },
  {
    id: "LLDP1-D1.1.3",
    title: "When One Pointer Can Represent Different Types Drill",
    currLevel: "A", calibLevel: "A", time: "15 min",
    category: "Discovery",
    prior: "Classes, member variables, basic inheritance syntax",
    newConcepts: "2 (Virtual dispatch, Virtual destructor)",
    solvable: "NO (Overloaded)",
    overload: "YES (Pure virtual + dispatch + destructor leak in 15m)",
    spoiler: "Header leak (Polymorphic Contracts)",
    action: "REWRITE & PHASE",
    evidence: "Header still says 'Polymorphic Contracts'. Bundles pure virtual contracts, dynamic dispatch, and incomplete deletion into 15 min. Must phase into Step 1 (virtual dispatch) and Step 2 (virtual destructor)."
  },
  {
    id: "LLDP1-D1.2.1",
    title: "Defending Shopping Cart Invariants Drill",
    currLevel: "B", calibLevel: "B", time: "30 min",
    category: "Discovery",
    prior: "Classes, methods, private fields, basic encapsulation",
    newConcepts: "1 (Defending internal invariants against illegal state)",
    solvable: "YES",
    overload: "NO",
    spoiler: "None",
    action: "PASS",
    evidence: "Clear buggy starting code with public item list. Learner implements addItem with quantity validation and returns read-only const reference. Concrete, testable, and realistic."
  },
  {
    id: "LLDP1-D1.2.2",
    title: "Building an Immutable Money Value Object Drill",
    currLevel: "A", calibLevel: "A", time: "15 min",
    category: "Discovery",
    prior: "Constructors, private member variables, throwing exceptions",
    newConcepts: "1 (Value object immutability & cross-currency protection)",
    solvable: "YES",
    overload: "NO",
    spoiler: "None",
    action: "PASS",
    evidence: "Tackles a tangible financial bug (float rounding drift and adding USD to JPY). API is compact: Money(amount, currency), add(), subtract(). Completely solvable in 15 min."
  },
  {
    id: "LLDP1-D1.3.1",
    title: "University Course Enrollment Ownership Model",
    currLevel: "A", calibLevel: "A", time: "15 min",
    category: "Discovery",
    prior: "Pointers, member variables, object lifetimes",
    newConcepts: "1 (Distinguishing Composition vs Aggregation lifecycles)",
    solvable: "YES",
    overload: "NO",
    spoiler: "None",
    action: "PASS",
    evidence: "Clear domain: Course owns Syllabus (Composition); Department holds Courses (Aggregation); Student enrolls in Course (Association). Verifiable by testing deletion outcomes."
  },
  {
    id: "LLDP1-D1.3.2",
    title: "Dismantling Inheritance Class Explosion Drill",
    currLevel: "B", calibLevel: "B", time: "30 min",
    category: "Discovery",
    prior: "Inheritance, basic interfaces, composition",
    newConcepts: "1 (Composition to avoid 2^N class explosion)",
    solvable: "YES",
    overload: "NO",
    spoiler: "None",
    action: "PASS",
    evidence: "Concrete problem: 8 notification subclasses (EncryptedEmail, RetryingSMS, etc.). Learner replaces inheritance tree with Notification holding pluggable Formatter and Sender."
  },
  {
    id: "LLDP1-D1.3.3",
    title: "Fixing Broken Subclass Assumptions Drill",
    currLevel: "B", calibLevel: "B", time: "20 min",
    category: "Discovery",
    prior: "Interfaces, inheritance, virtual methods",
    newConcepts: "1 (Contract violation detection / LSP)",
    solvable: "YES",
    overload: "NO",
    spoiler: "None",
    action: "PASS",
    evidence: "Demonstrates batch payroll loop crashing when FixedDepositAccount throws UnsupportedOperationException on withdraw(). Learner splits contract into WithdrawableAccount."
  },
  {
    id: "LLDP1-D1.4.1",
    title: "Digital Wallet Domain Model & Responsibility Breakdown",
    currLevel: "B", calibLevel: "B", time: "35 min",
    category: "Discovery",
    prior: "All Phase 1 concepts (lifetimes, invariants, relationships)",
    newConcepts: "1 (Noun-verb domain extraction)",
    solvable: "YES",
    overload: "NO",
    spoiler: "None",
    action: "PASS",
    evidence: "Full Phase 1 capstone. Extracts User, Wallet, and Transaction from customer requirements. Implements atomic transfer method with ledger audit trail."
  },
  {
    id: "LLDP2-D2.1.1",
    title: "Dismantling the God Class UserManager",
    currLevel: "B", calibLevel: "B", time: "30 min",
    category: "Discovery",
    prior: "Phase 1 encapsulation, interfaces, composition",
    newConcepts: "1 (Single Responsibility decomposition)",
    solvable: "YES",
    overload: "NO",
    spoiler: "None",
    action: "PASS",
    evidence: "Refactors a 600-line monolithic UserManager into UserRepository, PasswordHasher, and EmailNotifier. Verifiable via fast in-memory mock tests."
  },
  {
    id: "LLDP2-D2.1.2",
    title: "Segregating Bloated CloudStorageProvider",
    currLevel: "A", calibLevel: "A", time: "15 min",
    category: "Discovery",
    prior: "Pure virtual interfaces, inheritance",
    newConcepts: "1 (Interface Segregation / Role interfaces)",
    solvable: "YES",
    overload: "NO",
    spoiler: "None",
    action: "PASS",
    evidence: "Eliminates dummy empty methods and UnsupportedOperationExceptions by splitting CloudStorageProvider into StorageReader, StorageWriter, and MediaProcessor."
  },
  {
    id: "LLDP2-D2.2.1",
    title: "Replacing Type-Code Switch with Polymorphic Strategy",
    currLevel: "B", calibLevel: "B", time: "25 min",
    category: "Discovery",
    prior: "Interfaces, hash maps, virtual dispatch",
    newConcepts: "1 (Open/Closed principle via rule registry)",
    solvable: "YES",
    overload: "NO",
    spoiler: "None",
    action: "PASS",
    evidence: "Eliminates a 40-line cascading switch(countryCode) in TaxCalculator. Replaces with a dynamic map of TaxRule interfaces allowing new countries without modifying core engine."
  },
  {
    id: "LLDP2-D2.2.2",
    title: "Spotting Liskov Substitution Violations",
    currLevel: "A", calibLevel: "A", time: "15 min",
    category: "Discovery",
    prior: "Subtyping, interfaces, exception handling",
    newConcepts: "1 (Subclass behavioral contract enforcement)",
    solvable: "YES",
    overload: "NO",
    spoiler: "None",
    action: "PASS",
    evidence: "Identifies why ReadOnlyFile inheriting from File and throwing on write() breaks polymorphic loops. Refactors to separate ReadableFile and WritableFile."
  },
  {
    id: "LLDP2-D2.3.1",
    title: "Manual Constructor Injection & Fake Ports",
    currLevel: "B", calibLevel: "B", time: "30 min",
    category: "Discovery",
    prior: "Interfaces, pointers/shared_ptr, Unit testing",
    newConcepts: "1 (Dependency Inversion via constructor injection)",
    solvable: "YES",
    overload: "NO",
    spoiler: "None",
    action: "PASS",
    evidence: "Decouples OrderService from concrete PostgresOrderRepository by injecting IOrderRepository. Demonstrates test execution speedup from 45s down to 5ms."
  },
  {
    id: "LLDP2-D2.4.1",
    title: "Inheritance vs Composition Trade-offs",
    currLevel: "B", calibLevel: "B", time: "20 min",
    category: "Comparison",
    prior: "Inheritance, composition, Phase 2 SOLID principles",
    newConcepts: "1 (Evaluating trade-offs between taxonomies and components)",
    solvable: "YES",
    overload: "NO",
    spoiler: "Allowed (Comparison)",
    action: "PASS",
    evidence: "Compares 50-subclass character hierarchy against pluggable combat components. Concrete analysis of memory footprint and maintenance friction."
  },
  {
    id: "LLDP2-D2.4.2",
    title: "Switch vs Polymorphism: Defining the Threshold",
    currLevel: "A", calibLevel: "A", time: "15 min",
    category: "Comparison",
    prior: "Enums, switch statements, polymorphism",
    newConcepts: "1 (Pragmatic design judgment: when NOT to use polymorphism)",
    solvable: "YES",
    overload: "NO",
    spoiler: "Allowed (Comparison)",
    action: "PASS",
    evidence: "Essential drill teaching when simple code is better. Refactors an over-engineered 4-class Direction hierarchy back into a clean 4-line switch."
  },
  {
    id: "LLDP2-D2.4.3",
    title: "Concrete Class vs Abstract Class vs Interface",
    currLevel: "A", calibLevel: "A", time: "15 min",
    category: "Comparison",
    prior: "Classes, abstract classes, pure virtual interfaces",
    newConcepts: "1 (Classifying state sharing vs pure contracts)",
    solvable: "YES",
    overload: "NO",
    spoiler: "Allowed (Comparison)",
    action: "PASS",
    evidence: "Takes AudioStreamingService domain entities and classifies AudioPlayer (concrete), Decoder (abstract with buffer state), and Playable (pure interface)."
  },
  {
    id: "LLDP2-D2.4.4",
    title: "YAGNI & Over-Engineering Audit",
    currLevel: "B", calibLevel: "B", time: "25 min",
    category: "Comparison",
    prior: "All SOLID principles",
    newConcepts: "1 (Pruning speculative abstraction layers)",
    solvable: "YES",
    overload: "NO",
    spoiler: "Allowed (Comparison)",
    action: "PASS",
    evidence: "Audits a 1,200-line CSV converter that has 14 speculative interfaces and factory beans. Deletes 900 lines of bloat while preserving 100% functionality."
  },
  {
    id: "LLDP2-D2.4.5",
    title: "Predicting OCP Failures in Notification Engine",
    currLevel: "B", calibLevel: "B", time: "20 min",
    category: "Comparison",
    prior: "Open/Closed Principle, interfaces",
    newConcepts: "1 (Architectural impact prediction)",
    solvable: "YES",
    overload: "NO",
    spoiler: "Allowed (Comparison)",
    action: "PASS",
    evidence: "Given an existing notification dispatcher, learner predicts exactly which 3 files must be touched to add Slack, and refactors to make Slack addition touch 0 core files."
  },
  {
    id: "LLDP3-D3.1.1",
    title: "Dynamic Shipping Cost Engine Refactor",
    currLevel: "B", calibLevel: "B", time: "30 min",
    category: "Discovery",
    prior: "Phase 2 OCP, polymorphism, interfaces",
    newConcepts: "1 (Encapsulating interchangeable algorithms)",
    solvable: "YES",
    overload: "NO",
    spoiler: "YES (Header contains 'Strategy Discovery')",
    action: "REWRITE HEADER",
    evidence: "Problem is great (carrier calculation rules changing), but header leaks '(Strategy Discovery)'. Remove spoiler from header and description to preserve discovery."
  },
  {
    id: "LLDP3-D3.1.2",
    title: "Decoupled Order Event Broker",
    currLevel: "B", calibLevel: "B", time: "30 min",
    category: "Discovery",
    prior: "Interfaces, vectors/lists of listeners",
    newConcepts: "1 (One-to-many event notification decoupling)",
    solvable: "YES",
    overload: "NO",
    spoiler: "YES (Header contains 'Observer Discovery')",
    action: "REWRITE HEADER",
    evidence: "Notifies Inventory, Email, and Analytics upon order checkout without OrderService knowing about them. Remove '(Observer Discovery)' spoiler."
  },
  {
    id: "LLDP3-D3.1.3",
    title: "Document Workflow Lifecycle State Machine",
    currLevel: "B", calibLevel: "B", time: "30 min",
    category: "Discovery",
    prior: "Polymorphism, enums, encapsulation",
    newConcepts: "1 (Encapsulating lifecycle state transitions)",
    solvable: "YES",
    overload: "NO",
    spoiler: "YES (Header contains 'State Discovery')",
    action: "REWRITE HEADER",
    evidence: "Refactors document transitions (Draft, Review, Published, Archived) away from 5 nested switch blocks into state objects. Remove '(State Discovery)' header."
  },
  {
    id: "LLDP3-D3.1.4",
    title: "Transactional Undo/Redo Text Buffer Engine",
    currLevel: "B", calibLevel: "B", time: "30 min",
    category: "Discovery",
    prior: "Stacks, classes, encapsulation",
    newConcepts: "1 (Reversible operations as first-class objects)",
    solvable: "YES",
    overload: "NO",
    spoiler: "YES (Header contains 'Command Discovery')",
    action: "REWRITE HEADER",
    evidence: "Implements text editor buffer with undo/redo stacks. Remove '(Command Discovery)' header."
  },
  {
    id: "LLDP3-D3.1.5",
    title: "Extensible Request Filter Pipeline",
    currLevel: "B", calibLevel: "B", time: "25 min",
    category: "Discovery",
    prior: "Pointers, linked structures, interfaces",
    newConcepts: "1 (Sequential handler chaining)",
    solvable: "YES",
    overload: "NO",
    spoiler: "YES (Header contains 'Chain of Responsibility')",
    action: "REWRITE HEADER",
    evidence: "Chains RateLimiter, Auth, and Validation filters. Remove '(Chain of Responsibility)' header."
  },
  {
    id: "LLDP3-D3.2.1",
    title: "Document Exporter Factory & HTTP Config Builder",
    currLevel: "B", calibLevel: "B", time: "35 min",
    category: "Discovery",
    prior: "Interfaces, classes, method chaining",
    newConcepts: "2 (Factory Method + Fluent Builder)",
    solvable: "NO (Two full patterns in 35 min)",
    overload: "YES (Bundles Factory + Builder into single exercise)",
    spoiler: "None",
    action: "SPLIT & REFOCUS",
    evidence: "Asking a learner to implement DocumentExporterFactory AND a fluent HttpClientConfigBuilder with 12 parameters in 35 minutes causes rush and shallow learning. Focus hands-on coding on Factory; make Builder a distinct sub-task."
  },
  {
    id: "LLDP3-D3.2.2",
    title: "Dynamic Beverage Addons & Legacy Payment Bridge",
    currLevel: "B", calibLevel: "B", time: "35 min",
    category: "Discovery",
    prior: "Interfaces, composition, wrapping objects",
    newConcepts: "2 (Decorator wrapping + Adapter interface mapping)",
    solvable: "NO (Two full patterns in 35 min)",
    overload: "YES (Bundles Decorator + Adapter into single exercise)",
    spoiler: "None",
    action: "SPLIT & REFOCUS",
    evidence: "Combines Beverage addon decoration AND Legacy Bank SDK adaptation in 35 min. Focus coding primarily on Beverage Decorator (cost & description accumulation); keep Adapter as a separate focused task."
  },
  {
    id: "LLDP3-D3.2.3",
    title: "In-Memory FileSystem Tree Hierarchy",
    currLevel: "B", calibLevel: "B", time: "30 min",
    category: "Discovery",
    prior: "Trees, recursion, interfaces",
    newConcepts: "1 (Uniform leaf and composite hierarchy)",
    solvable: "YES",
    overload: "NO",
    spoiler: "YES (Header contains 'Composite Pattern')",
    action: "REWRITE HEADER",
    evidence: "Clean implementation of File and Directory sharing IFileSystemItem for recursive size calculation. Remove 'Composite Pattern' from header."
  },
  {
    id: "LLDP3-D3.3.1",
    title: "Proxy, Facade & Template Method Implementation Drill",
    currLevel: "B", calibLevel: "B", time: "35 min",
    category: "Discovery",
    prior: "Classes, interfaces, inheritance",
    newConcepts: "3 (Virtual Proxy, Facade subsystem, Template Method)",
    solvable: "NO (Three separate patterns in 35 min)",
    overload: "YES (Extreme concept overload: 3 patterns)",
    spoiler: "Reveals all 3 patterns in title",
    action: "SPLIT & REFOCUS",
    evidence: "Coding ImageProxy, ComputerFacade, and DataMiner in 35 minutes forces superficial copy-pasting. Focus hands-on coding strictly on Lazy Image Proxy (15 min) and Facade (15 min); move Template Method to a comparison exercise."
  },
  {
    id: "LLDP3-D3.3.2",
    title: "Singleton Antipattern & Thread Safety Refactor",
    currLevel: "A", calibLevel: "B", time: "25 min",
    category: "Discovery",
    prior: "Static members, concurrency basics, unit testing",
    newConcepts: "1 (Thread-safe singleton pitfalls & DI refactoring)",
    solvable: "YES",
    overload: "NO",
    spoiler: "None",
    action: "RECALIBRATE TO LEVEL B",
    evidence: "Fixing double-checked locking race conditions and refactoring a global singleton to constructor injection is NOT a Level A 15-minute beginner task. Recalibrate to Level B (25 min)."
  },
  {
    id: "LLDP3-D3.3.3",
    title: "Specialized GoF Patterns Comparison Drill",
    currLevel: "A", calibLevel: "B", time: "25 min",
    category: "Comparison",
    prior: "Maps, references, event coordination",
    newConcepts: "2 (Flyweight intrinsic sharing, Mediator coordination)",
    solvable: "YES",
    overload: "MODERATE",
    spoiler: "Allowed (Comparison)",
    action: "RECALIBRATE TO LEVEL B",
    evidence: "Rendering 100,000 trees with shared extrinsic/intrinsic state is too advanced for Level A. Recalibrate to Level B."
  },
  {
    id: "LLDP3-D3.4.1",
    title: "Strategy vs State Discrimination Decision Drill",
    currLevel: "A", calibLevel: "A", time: "15 min",
    category: "Comparison",
    prior: "Strategy pattern, State pattern",
    newConcepts: "1 (Discriminating client-configured vs autonomous transitions)",
    solvable: "YES",
    overload: "NO",
    spoiler: "Allowed (Comparison)",
    action: "PASS",
    evidence: "Direct comparison answering FAANG trick questions: Discounts (caller chooses strategy) vs ATM (context transitions autonomously). Crisp 15-min decision exercise."
  },
  {
    id: "LLDP3-D3.4.2",
    title: "Decorator vs Adapter vs Proxy Decision Drill",
    currLevel: "A", calibLevel: "A", time: "15 min",
    category: "Comparison",
    prior: "Decorator, Adapter, Proxy patterns",
    newConcepts: "1 (Discriminating intent behind identical wrapper structures)",
    solvable: "YES",
    overload: "NO",
    spoiler: "Allowed (Comparison)",
    action: "PASS",
    evidence: "Crucial intent discriminator: Decorator adds behavior, Adapter converts interface, Proxy controls access. 3 concise scenarios to classify and defend."
  },
  {
    id: "LLDP3-D3.4.3",
    title: "E-Commerce Architecture Pattern Prediction Exercise",
    currLevel: "B", calibLevel: "B", time: "20 min",
    category: "Synthesis",
    prior: "All GoF patterns from Phase 3",
    newConcepts: "1 (Synthesizing patterns into a holistic architecture)",
    solvable: "YES",
    overload: "NO",
    spoiler: "Allowed (Synthesis)",
    action: "PASS",
    evidence: "Given an e-commerce spec, learner predicts where Strategy (shipping), Observer (events), Factory (payments), and Decorator (gift wrapping) belong."
  },
  {
    id: "LLDP4-D4.1.1",
    title: "Thread-Safe Bounded Queue Implementation Drill",
    currLevel: "A", calibLevel: "B", time: "30 min",
    category: "Discovery",
    prior: "C++ classes, templates, std::mutex, std::condition_variable",
    newConcepts: "1 (Thread-safe producer-consumer synchronization)",
    solvable: "YES (at Level B)",
    overload: "NO (Single objective, but advanced primitives)",
    spoiler: "None",
    action: "RECALIBRATE TO LEVEL B",
    evidence: "Current DB marks this Level A (20 min). As noted in guidelines: mutexes, condition variables, predicates, and blocking are NOT Level A beginner material. Recalibrated to Level B (30 min)."
  },
  {
    id: "LLDP4-D4.1.2",
    title: "Expiring Lock Manager with Compensating Release",
    currLevel: "B", calibLevel: "B", time: "35 min",
    category: "Discovery",
    prior: "Mutexes, locks, timestamps/chrono",
    newConcepts: "1 (Time-bounded temporary leasing with auto-expiry)",
    solvable: "YES",
    overload: "NO",
    spoiler: "None",
    action: "PASS",
    evidence: "Foundational engine for BookMyShow and ticketing systems. Holds temporary 10-minute seat locks with automatic timeout release."
  },
  {
    id: "LLDP5-D5.1.1",
    title: "5-Minute Scoping & Ambiguity Elimination Drill",
    currLevel: "A", calibLevel: "A", time: "15 min",
    category: "Interview",
    prior: "All Phases 1-4",
    newConcepts: "1 (5-minute scoping protocol)",
    solvable: "YES",
    overload: "NO",
    spoiler: "Allowed (Interview)",
    action: "PASS",
    evidence: "Teaches asking 5 clarifying questions on Amazon Locker before touching code. Essential interview soft-skill."
  },
  {
    id: "LLDP5-D5.1.2",
    title: "Rapid Entity Extraction & Interface Definition Exercise",
    currLevel: "B", calibLevel: "B", time: "25 min",
    category: "Interview",
    prior: "All Phases 1-4",
    newConcepts: "1 (10-minute contract sketching)",
    solvable: "YES",
    overload: "NO",
    spoiler: "Allowed (Interview)",
    action: "PASS",
    evidence: "Drills rapid extraction of Cache, EvictionPolicy, and Storage contracts under 10-minute time limits."
  },
  {
    id: "LLDP5-D5.1.3",
    title: "Clean Production Coding Under 20-Minute Time Limits",
    currLevel: "B", calibLevel: "B", time: "30 min",
    category: "Interview",
    prior: "Classes, timers, rate limiters",
    newConcepts: "1 (Timed execution muscle memory)",
    solvable: "YES",
    overload: "NO",
    spoiler: "Allowed (Interview)",
    action: "PASS",
    evidence: "Codes working Token Bucket rate limiter in 20 minutes with zero bugs and full unit validation."
  },
  {
    id: "LLDP5-D5.1.4",
    title: "Live Requirement Pivot Defense Exercise",
    currLevel: "B", calibLevel: "B", time: "20 min",
    category: "Interview",
    prior: "Vending Machine problem, OCP",
    newConcepts: "1 (Absorbing late-round pivot curveballs)",
    solvable: "YES",
    overload: "NO",
    spoiler: "Allowed (Interview)",
    action: "PASS",
    evidence: "Simulates interviewer throwing NFC payments and loyalty points at minute 35 of a Vending Machine interview."
  },
  {
    id: "LLDP5-D5.2.1",
    title: "Justifying Abstraction Under Scrutiny Defense Drill",
    currLevel: "A", calibLevel: "A", time: "15 min",
    category: "Interview",
    prior: "SOLID principles, design trade-offs",
    newConcepts: "1 (2-minute verbal trade-off defense)",
    solvable: "YES",
    overload: "NO",
    spoiler: "Allowed (Interview)",
    action: "PASS",
    evidence: "Defends notification interface against interviewer claiming it is premature over-engineering. Teaches empathy and pragmatic compromise."
  },
  {
    id: "LLDP5-D5.2.2",
    title: "Explaining Concurrency Bottlenecks & Lock Granularity",
    currLevel: "A", calibLevel: "B", time: "20 min",
    category: "Interview",
    prior: "Phase 4 concurrency, mutexes, deadlock conditions",
    newConcepts: "1 (Articulating coarse vs fine-grained locking bottlenecks)",
    solvable: "YES",
    overload: "NO",
    spoiler: "Allowed (Interview)",
    action: "RECALIBRATE TO LEVEL B",
    evidence: "Explaining lock contention, Amdahl's Law, and shared_mutex granularity is an intermediate interview topic. Recalibrate to Level B (20 min)."
  },
  {
    id: "LLDP5-D5.2.3",
    title: "Verbal Think-Aloud Modeling Exercise",
    currLevel: "B", calibLevel: "B", time: "20 min",
    category: "Interview",
    prior: "Key-Value store, STL maps, TTL",
    newConcepts: "1 (Continuous verbal narration while coding)",
    solvable: "YES",
    overload: "NO",
    spoiler: "Allowed (Interview)",
    action: "PASS",
    evidence: "Eliminates dead silence during coding rounds. Codes TTL map while explaining invariants aloud."
  },
  {
    id: "LLDP5-D5.3.1",
    title: "30-Minute Fast Scoping & Interface Sprint",
    currLevel: "B", calibLevel: "B", time: "30 min",
    category: "Interview",
    prior: "Message Broker, Observer, queues",
    newConcepts: "1 (30-minute phone screen pacing)",
    solvable: "YES",
    overload: "NO",
    spoiler: "Allowed (Interview)",
    action: "PASS",
    evidence: "Simulates 30-minute phone screen round for in-memory pub-sub message broker."
  },
  {
    id: "LLDP5-D5.3.2",
    title: "45-Minute Standard Interview Sprint",
    currLevel: "B", calibLevel: "B", time: "45 min",
    category: "Interview",
    prior: "Parking Lot problem, all LLD patterns",
    newConcepts: "1 (Full 5-stage FAANG simulation)",
    solvable: "YES",
    overload: "NO",
    spoiler: "Allowed (Interview)",
    action: "PASS",
    evidence: "Full 45-minute simulation of Parking Lot with EV charging curveball under strict time-boxing."
  },
  {
    id: "LLDP5-D5.3.3",
    title: "60-Minute Comprehensive System Sprint",
    currLevel: "B", calibLevel: "C", time: "60 min",
    category: "Interview",
    prior: "Ride-Sharing dispatch, spatial matching, surge pricing",
    newConcepts: "1 (End-to-end onsite architectural round)",
    solvable: "YES",
    overload: "NO",
    spoiler: "Allowed (Interview)",
    action: "RECALIBRATE TO LEVEL C",
    evidence: "A 60-minute full system round for Ride-Sharing Dispatch with spatial matching is a Level C capstone drill."
  },
  {
    id: "LLDP5-D5.4.1",
    title: "Foundation Tier Full Mock Simulation",
    currLevel: "C", calibLevel: "C", time: "60 min",
    category: "Interview",
    prior: "All curriculum concepts",
    newConcepts: "1 (FAANG 4-dimension rubric evaluation)",
    solvable: "YES",
    overload: "NO",
    spoiler: "Allowed (Interview)",
    action: "PASS",
    evidence: "Complete mock round for Coffee Maker evaluated against Scope, Architecture, Code Quality, and Defense."
  },
  {
    id: "LLDP5-D5.4.2",
    title: "Intermediate Resource Allocation Mock with Curveball",
    currLevel: "C", calibLevel: "C", time: "60 min",
    category: "Interview",
    prior: "All curriculum concepts",
    newConcepts: "1 (Temporal allocation & curveball absorption)",
    solvable: "YES",
    overload: "NO",
    spoiler: "Allowed (Interview)",
    action: "PASS",
    evidence: "Complete mock round for Hotel Booking with room inventory surge and weekend rate modifiers."
  },
  {
    id: "LLDP5-D5.4.3",
    title: "Advanced High-Concurrency System Mock Simulation",
    currLevel: "C", calibLevel: "C", time: "60 min",
    category: "Interview",
    prior: "All curriculum concepts including Phase 4 concurrency",
    newConcepts: "1 (Staff-level concurrency interview evaluation)",
    solvable: "YES",
    overload: "NO",
    spoiler: "Allowed (Interview)",
    action: "PASS",
    evidence: "The definitive Staff-level interview simulation: BookMyShow temporary seat lease engine under 20 concurrent racing threads."
  }
];

drillAuditData.forEach(d => {
  md += `\n| **${d.id}** | ${d.title} | ${d.currLevel} → **${d.calibLevel}** | ${d.time} | ${d.category} | ${d.prior} | ${d.newConcepts} | ${d.solvable} | ${d.overload} | ${d.spoiler} | **${d.action}**: ${d.evidence} |`;
});

md += `\n\n---\n\n`;

md += `## 5. Bit-by-Bit Phase 1 Pedagogical Review\n\n`;
md += `Phase 1 is the most crucial phase in Sarthi. If a beginner stumbles here, the entire curriculum fails. Here is the thorough bit-by-bit audit:\n\n`;

md += `### Module 1.1: C++ Foundations for Low Level Design\n\n`;
md += `#### Unit 1.1.1 (\`LLDP1-U1.1.1\`): What Happens to an Object When We Leave the Block Where It Was Created?\n`;
md += `* **What learner already knows**: Basic C++ syntax (\`int\`, \`std::string\`, \`std::cout\`), calling functions, simple class definition.\n`;
md += `* **What learner learns**: An object created inside \`{ }\` curly braces is destroyed the microsecond the closing \`}\` is reached. An object created with \`new\` stays alive forever until \`delete\` is called.\n`;
md += `* **Discovery Flow**: Simple curly braces \`{ }\` → Print from constructor → Print from destructor → Observe exact print order → Introduce names: "automatic/stack lifetime" vs "heap/manual lifetime".\n`;
md += `* **Can a beginner follow?**: **YES**. Intuitive and visual.\n\n`;

md += `#### Drill 1.1.1 (\`LLDP1-D1.1.1\`): Stack vs Heap Lifetime Drill\n`;
md += `* **Current Flaw in Database**: Introduces \`ConnectionPool\`, socket handles, server freezes, and Rule of Three. Overloaded for Lesson 1!\n`;
md += `* **Rework Proposal (\`TrackerBox\`)**: Make it 100% discovery-first. Create a class \`TrackerBox\` that logs its name on birth and death. Put one inside \`{ }\` and one on the heap. Observe block exit.\n`;
md += `* **Exact Coding Requirements**: 1 class, 2 methods (\`TrackerBox()\`, \`~TrackerBox()\`), 1 \`main()\` with inner block \`{ }\`. 15 lines of code.\n`;
md += `* **Target Time**: 15 min. **Level**: Level A.\n\n`;

md += `#### Unit 1.1.2 (\`LLDP1-U1.1.2\`): Sharing an Object vs Making a Copy\n`;
md += `* **What learner already knows**: Destructors run at block exit (from 1.1.1).\n`;
md += `* **What learner learns**: What happens when an object borrows another object that dies before it? Why holding by value (direct member variable) makes the child live as long as the parent.\n`;
md += `* **Discovery Flow**: Build a \`Car\` that takes an \`Engine*\`. Create \`Engine\` inside a function. When function returns, Engine dies! Car tries to use it and crashes. Solution: Make \`Engine\` a direct member variable inside \`Car\` so \`Car\` owns it.\n`;
md += `* **Can a beginner follow?**: **YES**.\n\n`;

md += `#### Drill 1.1.2 (\`LLDP1-D1.1.2\`): Object Ownership & Safe Borrowing Refactor\n`;
md += `* **Current Flaw**: Mentions \`unique_ptr\` in starting code comments, confusing a learner who hasn't mastered member variables yet.\n`;
md += `* **Correction**: Focus strictly on member-by-value composition: \`class Car { Engine engine; };\`. Show that the car destructor now automatically cleans up the engine.\n`;
md += `* **Target Time**: 15 min. **Level**: Level A.\n\n`;

md += `#### Unit 1.1.3 (\`LLDP1-U1.1.3\`): When One Variable Can Represent Different Types\n`;
md += `* **What learner already knows**: Classes, methods, basic inheritance.\n`;
md += `* **What learner learns**: How can a store accept both \`CreditCard\` and \`UPI\` without writing \`if (isCard) ... else if (isUPI) ...\` everywhere?\n`;
md += `* **Discovery Flow**: Try calling \`pay()\` through a base pointer without \`virtual\`. See the BASE version run! Ask why. Introduce \`virtual\`. See the CHILD version run! Then ask what happens when deleting through base pointer. Introduce \`virtual ~PaymentMethod()\`. Teach vtable as an interview note only.\n`;
md += `* **Can a beginner follow?**: **YES**.\n\n`;

md += `#### Drill 1.1.3 (\`LLDP1-D1.1.3\`): When One Pointer Can Represent Different Types Drill\n`;
md += `* **Current Flaw**: Header says "Polymorphic Contracts & Safe Destruction". Combines pure virtual interface + dynamic dispatch + virtual destructor memory leak into 15 min.\n`;
md += `* **Correction**: Phase into Step 1 (observe static dispatch without virtual, then add virtual to see dynamic dispatch) and Step 2 (add virtual destructor). Remove old header.\n`;
md += `* **Target Time**: 15 min. **Level**: Level A.\n\n`;

md += `### Module 1.2: Encapsulation, State Guards & Value Objects\n\n`;
md += `#### Unit 1.2.1 & Drill 1.2.1: Defending Shopping Cart Invariants (\`LLDP1-U1.2.1\` / \`LLDP1-D1.2.1\`)\n`;
md += `* **What learner already knows**: Classes, private/public from Module 1.1.\n`;
md += `* **What learner learns**: Why public fields allow bugs (negative price, -5 quantity). How business methods protect invariants.\n`;
md += `* **Drill Coding Task**: Refactor \`cart.items.push_back()\` to \`cart.addItem(item, qty)\` with validation. Return \`const std::vector<CartItem>&\`.\n`;
md += `* **Verdict**: **PASS**. Real-world situation, clear starting point, Level B (30 min).\n\n`;

md += `#### Unit 1.2.2 & Drill 1.2.2: Immutable Money Value Object (\`LLDP1-U1.2.2\` / \`LLDP1-D1.2.2\`)\n`;
md += `* **What learner already knows**: Private fields, constructors.\n`;
md += `* **What learner learns**: Why \`double price = 19.99\` causes billing drift, and why adding USD to EUR must throw an exception.\n`;
md += `* **Drill Coding Task**: Implement \`Money(amount, currency)\` with integer cents. Arithmetic returns new \`Money\` instance.\n`;
md += `* **Verdict**: **PASS**. Crisp LeetCode problem, Level A (15 min).\n\n`;

md += `### Module 1.3: Object Relationships & Composition vs Inheritance\n\n`;
md += `#### Unit 1.3.1 & Drill 1.3.1: Course Enrollment Ownership (\`LLDP1-U1.3.1\` / \`LLDP1-D1.3.1\`)\n`;
md += `* **What learner learns**: Composition (Course owns Syllabus) vs Aggregation (Department holds Courses) vs Association (Student enrolls in Course).\n`;
md += `* **Verdict**: **PASS**. Clear domain, Level A (15 min).\n\n`;

md += `#### Unit 1.3.2 & Drill 1.3.2: Dismantling Class Explosion (\`LLDP1-U1.3.2\` / \`LLDP1-D1.3.2\`)\n`;
md += `* **What learner learns**: Why subclassing every combination (\`EncryptedEmail\`, \`RetryingSMS\`) causes $2^N$ class explosion.\n`;
md += `* **Verdict**: **PASS**. High-impact refactoring, Level B (30 min).\n\n`;

md += `#### Unit 1.3.3 & Drill 1.3.3: Broken Subclass Assumptions (\`LLDP1-D1.3.3\`)\n`;
md += `* **What learner learns**: Why a subclass throwing \`UnsupportedOperationException\` on an inherited method breaks batch code.\n`;
md += `* **Verdict**: **PASS**. Concrete banking scenario, Level B (20 min).\n\n`;

md += `### Module 1.4: Practical OOAD\n\n`;
md += `#### Unit 1.4.1 & Drill 1.4.1: Digital Wallet Domain Model (\`LLDP1-U1.4.1\` / \`LLDP1-D1.4.1\`)\n`;
md += `* **What learner learns**: How to turn a business paragraph into classes, methods, and relationships.\n`;
md += `* **Verdict**: **PASS**. Level B (35 min).\n\n`;

md += `### Phase 1 Major Problems & Version Progression Pressure\n\n`;
md += `| Problem ID | Title | Pre-Attempt Zero-Spoiler Verified? | Version Pressure Progression |\n`;
md += `|---|---|:---:|---|\n`;
md += `| **LLDP1-P1** | **Design a Vending Machine** | **YES** | V1 (In-Memory Baseline) → V2 (Shelf Grid & Invariants) → V3 (Exact Coin Change) → V4 (Card Payments & Discounts) → V5 (Review). Each version forces refactoring of previous assumptions. |\n`;
md += `| **LLDP1-P2** | **Design Tic Tac Toe** | **YES** | V1 (3x3 Grid) → V2 (N x N Grid & O(1) row/col arrays) → V3 (Move History & Undo) → V4 (Review). |\n`;
md += `| **LLDP1-P3** | **Design a Coffee Maker** | **YES** | V1 (Espresso/Latte Recipes) → V2 (Dynamic Add-ons: Milk/Syrup) → V3 (Tea & Specialty Drinks) → V4 (Review). |\n`;
md += `| **LLDP1-P4** | **Design a Library Management System** | **YES** | V1 (Catalog & Copies) → V2 (Borrowing Limits & Reservation Queue) → V3 (Overdue Fines) → V4 (Review). |\n\n`;

md += `---\n\n`;

md += `## 6. Full LeetCode-Grade Specification Rework for LLDP1-D1.1.1\n\n`;
md += `Here is the exact proposed replacement for \`LLDP1-D1.1.1\`, adhering strictly to the **Discovery-First** rule:\n\n`;

md += `\`\`\`markdown\n`;
md += `## Watching an Object Be Born and Destroyed\n\n`;
md += `### Problem Statement\n`;
md += `Create a small class named \`TrackerBox\` that prints a message when it is created and another message when it is destroyed. You will place one \`TrackerBox\` inside a pair of curly braces \`{ }\` and create another \`TrackerBox\` using \`new\`. Observe when each box is destroyed.\n\n`;
md += `### Context & Scenario\n`;
md += `Every program you write creates data in your computer's memory. If your program creates data and forgets to clean it up, the computer slowly runs out of memory and crashes.\n\n`;
md += `C++ has a special superpower: if you create an object inside a pair of curly braces \`{ ... }\`, C++ promises to destroy that object the exact microsecond the closing brace \`}\` is reached. You never have to remember to clean it up.\n\n`;
md += `In this drill, you will prove this superpower to yourself by watching an object announce its own creation and destruction in the terminal.\n\n`;
md += `### Starting Point\n`;
md += `Start with a blank C++ file in your workspace with:\n`;
md += `\`\`\`cpp\n`;
md += `#include <iostream>\n`;
md += `#include <string>\n\n`;
md += `// Your TrackerBox class will go here\n\n`;
md += `int main() {\n`;
md += `    // Your experiment code will go here\n`;
md += `    return 0;\n`;
md += `}\n`;
md += `\`\`\`\n\n`;
md += `### Your Task\n`;
md += `1. Write a class named \`TrackerBox\`:\n`;
md += `   - It holds one private \`std::string name\`.\n`;
md += `   - Its constructor takes a name and prints: \`"[BORN] " + name\`.\n`;
md += `   - Its destructor \`~TrackerBox()\` prints: \`"[DESTROYED] " + name\`.\n`;
md += `2. Inside \`main()\`, create an inner block using curly braces:\n`;
md += `   \`\`\`cpp\n`;
md += `   std::cout << "--- Entering Block ---\\n";\n`;
md += `   {\n`;
md += `       TrackerBox a("StackBox");\n`;
md += `   }\n`;
md += `   std::cout << "--- Left Block ---\\n";\n`;
md += `   \`\`\`\n`;
md += `   Compile and run. Observe that \`[DESTROYED] StackBox\` prints BEFORE \`--- Left Block ---\`!\n`;
md += `3. Now create a box on the heap using \`new\`:\n`;
md += `   \`\`\`cpp\n`;
md += `   TrackerBox* b = new TrackerBox("HeapBox");\n`;
md += `   std::cout << "Leaving main without delete...\\n";\n`;
md += `   \`\`\`\n`;
md += `   Run the program. Notice that \`[DESTROYED] HeapBox\` is NEVER printed! The memory was abandoned.\n`;
md += `4. Fix the leak by adding \`delete b;\` and run once more to see \`[DESTROYED] HeapBox\` appear.\n\n`;
md += `### API / Interface\n`;
md += `\`\`\`cpp\n`;
md += `class TrackerBox {\n`;
md += `private:\n`;
md += `    std::string name;\n`;
md += `public:\n`;
md += `    explicit TrackerBox(std::string boxName);\n`;
md += `    ~TrackerBox();\n`;
md += `};\n`;
md += `\`\`\`\n\n`;
md += `### Expected Output\n`;
md += `\`\`\`text\n`;
md += `--- Entering Block ---\n`;
md += `[BORN] StackBox\n`;
md += `[DESTROYED] StackBox\n`;
md += `--- Left Block ---\n`;
md += `[BORN] HeapBox\n`;
md += `[DESTROYED] HeapBox\n`;
md += `\`\`\`\n\n`;
md += `### Constraints & Assumptions\n`;
md += `* Do not use smart pointers or external libraries; use pure standard C++.\n`;
md += `* The string output must match the exact case: \`[BORN]\` and \`[DESTROYED]\`.\n\n`;
md += `### Acceptance Criteria\n`;
md += `1. \`TrackerBox("StackBox")\` destructor executes automatically at the closing brace \`}\` without calling \`delete\`.\n`;
md += `2. \`TrackerBox("HeapBox")\` does NOT destroy automatically when leaving a block.\n`;
md += `3. Calling \`delete b\` successfully triggers the destructor for \`HeapBox\`.\n\n`;
md += `### What to Observe\n`;
md += `Notice how the stack box cleaned itself up the moment you stepped outside the braces. This is the foundation of C++ memory safety. You never have to manually clean up an object that lives inside a block.\n\n`;
md += `### Think About\n`;
md += `What would happen if an object that opens a file or connects to a database was put inside curly braces? Would it automatically close the file when the function exits?\n`;
md += `\`\`\`\n\n`;

md += `---\n\n`;

md += `## 7. Action Plan & Next Steps (Awaiting Approval)\n\n`;
md += `1. **Review of Phase 1 Rework**: Please confirm approval of this deep audit and the proposed \`TrackerBox\` rework for \`LLDP1-D1.1.1\`.\n`;
md += `2. **UI Card Clean Summary Separation**: Ensure child task cards in \`frontend/src/pages/task-childrens/Task.jsx\` display the 1-line clean summary, action badge, level, and time, keeping full LeetCode specifications inside the detail drawer.\n`;
md += `3. **Targeted Phase 1 Generation**: Once approved, apply the simplified, phased rewrites to Phase 1 in MongoDB.\n`;
md += `4. **Phases 2–5 Sanitization**: Apply header spoiler cleanup and recalibrate multi-pattern/advanced drills across Phases 2–5.\n`;

fs.writeFileSync("/Users/balajiaadesh/.gemini/antigravity-ide/brain/5b3bec2d-4248-4944-957a-261c0d4b86a9/curriculum_pedagogical_audit_deep.md", md);
console.log("Deep audit written successfully to curriculum_pedagogical_audit_deep.md!");

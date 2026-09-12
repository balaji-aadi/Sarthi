import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatUnitDescription, formatDrillDescription } from './content_formatters.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PHASE5_REWRITE = {};

// ============================================================================
// MODULES (4)
// ============================================================================
PHASE5_REWRITE['LLDP5-M1'] = {
  taskName: 'Module 5.1: The 45-Minute Interview Strategy',
  taskDescription: 'Learn how to manage your 45 minutes in a live interview: how to ask the right questions in minute 1, extract classes by minute 10, write clean code by minute 30, and handle surprise requirement changes.'
};

PHASE5_REWRITE['LLDP5-M2'] = {
  taskName: 'Module 5.2: Talking to Your Interviewer & Explaining Your Choices',
  taskDescription: 'Master verbal communication: thinking out loud while writing code, defending your design when pushed, and explaining trade-offs with confidence.'
};

PHASE5_REWRITE['LLDP5-M3'] = {
  taskName: 'Module 5.3: Timed Practice Sprints',
  taskDescription: 'Simulate the exact time pressure of real tech rounds with 30-minute, 45-minute, and 60-minute coding sprints.'
};

PHASE5_REWRITE['LLDP5-M4'] = {
  taskName: 'Module 5.4: Full Mock Interview Simulations',
  taskDescription: 'Complete end-to-end mock interviews evaluated against the standard 4-dimension FAANG rubric (Scoping, Object Design, Clean Code, Communication).'
};

// ============================================================================
// LEARNING UNITS (13)
// ============================================================================

// Unit 5.1.1
PHASE5_REWRITE['LLDP5-U5.1.1'] = {
  taskName: 'Unit 5.1.1: What Questions to Ask in the First 5 Minutes',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'When an interviewer says "Design Amazon Locker", what do you do so you don\'t waste 30 minutes designing a mobile app when they wanted an embedded locker hardware controller?',
    seeItWithASmallExample: `Bad candidate starts immediately:
"Okay, I will create a User class, a Database class, a React frontend..." (Interviewer sighs).

Good candidate pauses and clarifies:
"Are we focusing on the physical locker kiosk controller, or the cloud parcel assignment service? Are we assuming lockers have different sizes? Is payments in scope?"`,
    whatIsGoingWrong: 'Starting to code before agreeing on the boundaries causes you to build the wrong system, running out of time before writing a single line of the code the interviewer actually cared about.',
    theSimpleIdea: 'Spend the first 5 minutes asking clarifying questions to define the MVP (Minimum Viable Product), scale assumptions, and agreeing on the top 3 use cases you will implement.',
    technicalWords: [
      { term: 'Scoping', explanation: 'Clarifying the boundaries of what is included in the design and what is explicitly excluded.' },
      { term: 'MVP (Minimum Viable Product)', explanation: 'The minimal set of features required to demonstrate a working system.' },
      { term: 'Functional Requirement', explanation: 'What the system must do (e.g. "User deposits parcel into locker").' },
      { term: 'Non-Functional Requirement', explanation: 'How the system behaves (e.g. "Thread-safe", "In-memory", "Low latency").' }
    ],
    whyThisMattersInLLD: 'Interviewers grade candidates on their ability to eliminate ambiguity. A candidate who scopes well is perceived as a mature senior engineer.',
    tryIt: 'Take the prompt "Design a Rate Limiter". Write down 4 scoping questions you would ask the interviewer before writing any code.',
    nowChangeTheRequirement: 'The interviewer responds: "Keep it in-memory, single-threaded, and focus on supporting multiple client tiers."',
    whatDidTheChangeTeachUs: 'You just avoided wasting 20 minutes setting up mutexes and network sockets that were out of scope!',
    canYouExplainIt: 'Can you explain why asking questions at the start is a sign of confidence rather than ignorance?'
  })
};

// Unit 5.1.2
PHASE5_REWRITE['LLDP5-U5.1.2'] = {
  taskName: 'Unit 5.1.2: Finding Classes and Method Names in 10 Minutes',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'Once the scope is agreed upon, how do you quickly outline your classes, member variables, and public method signatures before typing implementation details?',
    seeItWithASmallExample: `Drafting contracts before code:
class Locker {
    string id;
    LockerSize size;
    bool isOccupied;
public:
    bool assignPackage(Package p);
    void release();
};
// Notice: No loop logic, no complex algorithms yet! Just the shape of the system.`,
    whatIsGoingWrong: 'Diving straight into writing complex for-loops and map lookups without outlining class signatures causes you to realize 20 minutes in that your class boundaries are completely wrong.',
    theSimpleIdea: 'Draft the public interfaces first. Show the interviewer the classes and how they talk to each other. Get their approval on the skeleton before fleshing out the implementation.',
    technicalWords: [
      { term: 'Contract Definition', explanation: 'Establishing public method signatures and types before writing method bodies.' },
      { term: 'Top-Down Design', explanation: 'Starting with high-level workflows and breaking them into specific helper methods.' }
    ],
    whyThisMattersInLLD: 'If the interviewer wants to change an entity or suggest a different approach, it is 10 times easier to adjust a 5-line signature than to rewrite 200 lines of implementation.',
    tryIt: 'Draft the interfaces for an in-memory Cache with `get(key)` and `put(key, value)` and eviction policy.',
    nowChangeTheRequirement: 'Interviewer says: "Let\'s make sure we can swap LRU with LFU later."',
    whatDidTheChangeTeachUs: 'You can extract an `EvictionPolicy` interface in 30 seconds before writing any queue logic.',
    canYouExplainIt: 'Can you explain why sketching a blueprint before laying bricks saves time?'
  })
};

// Unit 5.1.3
PHASE5_REWRITE['LLDP5-U5.1.3'] = {
  taskName: 'Unit 5.1.3: Writing Clean, Working Code in 20 Minutes',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'How do you pace yourself so you can turn your class skeletons into bug-free, working C++ code within a 20-minute implementation window without getting stuck on syntax?',
    seeItWithASmallExample: `Pacing discipline:
- Minutes 15-20: Implement core domain entities (e.g. Spot, Vehicle).
- Minutes 20-30: Implement main service workflow (e.g. parkVehicle, unparkVehicle).
- Minutes 30-35: Add defensive checks and invariant guards.`,
    whatIsGoingWrong: 'Getting bogged down trying to write complex helper templates or perfect custom memory allocators wastes the clock, leaving the main business workflow unfinished when time runs out.',
    theSimpleIdea: 'Implement the happy path of the core use case first. Keep functions small. Use standard library containers (`std::vector`, `std::unordered_map`). Then add validation guards.',
    technicalWords: [
      { term: 'Implementation Pacing', explanation: 'Allocating specific time blocks for entities, workflows, and edge cases.' },
      { term: 'Defensive Guards', explanation: 'Checking input parameters at the start of a function before executing logic.' }
    ],
    whyThisMattersInLLD: 'A working, clean implementation of the core flow always scores higher than an incomplete, half-written "perfect" architecture.',
    tryIt: 'Set a timer for 15 minutes. Implement `ShoppingCart::addItem` and `removeItem` with invariant checks and unit tests.',
    nowChangeTheRequirement: 'Timer ends. Did your code compile cleanly?',
    whatDidTheChangeTeachUs: 'Practicing against a clock builds the muscle memory needed to code smoothly in high-pressure interviews.',
    canYouExplainIt: 'Can you explain why finishing a working core flow is better than leaving an ambitious design half-written?'
  })
};

// Unit 5.1.4
PHASE5_REWRITE['LLDP5-U5.1.4'] = {
  taskName: 'Unit 5.1.4: What to Do When the Interviewer Changes the Rules Mid-Way',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'At minute 35, the interviewer says: "Great, now what if packages can be returned, and customers can hold multiple lockers at once?" How do you absorb this without panicking or rewriting everything?',
    seeItWithASmallExample: `Panic reaction:
"Oh no, my whole design assumed 1 package per customer! I need to delete my classes and start over."

Professional reaction:
"That is a great extension. Currently Customer holds a single LockerId. We can change that to a vector of LockerIds and update our release workflow without changing the Locker class at all."`,
    whatIsGoingWrong: 'Interviewers intentionally throw "curveballs" in the last 10 minutes to test your adaptability and see if your architecture was flexible or brittle.',
    theSimpleIdea: 'Stay calm. Identify the exact boundary affected by the change. If you followed SOLID principles and composition, the change will only affect one isolated component.',
    technicalWords: [
      { term: 'Curveball / Pivot', explanation: 'A mid-session requirement change introduced by the interviewer.' },
      { term: 'Blast Radius', explanation: 'How much of your existing codebase is impacted by a requirement change.' }
    ],
    whyThisMattersInLLD: 'Demonstrating that your design can absorb a pivot with minimal changes is the ultimate proof of solid low level design.',
    tryIt: 'Take your completed Vending Machine. Introduce the requirement: "Users can now pay using credit cards as well as cash."',
    nowChangeTheRequirement: 'How many classes did you have to modify?',
    whatDidTheChangeTeachUs: 'If you had a `PaymentMethod` interface, the blast radius was zero modifications to the vending machine controller!',
    canYouExplainIt: 'Can you explain why interviewers introduce curveballs near the end of the interview?'
  })
};

// Unit 5.2.1
PHASE5_REWRITE['LLDP5-U5.2.1'] = {
  taskName: 'Unit 5.2.1: Defending Your Code When an Interviewer Says "Isn’t This Over-Engineered?"',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'If an interviewer asks: "Why did you create an interface for this? Isn\'t that unnecessary boilerplate?", how do you respond professionally without sounding defensive?',
    seeItWithASmallExample: `Defensive (Bad):
"Because design patterns are best practice and Gang of Four says so!"

Pragmatic (Good):
"For our current MVP, a direct concrete class would indeed be simpler. I introduced this interface because requirement #2 indicated we will add 3 more payment types next quarter. However, if our team wants to keep the initial footprint minimal, I am completely comfortable collapsing this to a single class."`,
    whatIsGoingWrong: 'Arguing dogma makes you look dogmatic and junior. Conceding immediately without explaining your reasoning makes you look uncertain of your design.',
    theSimpleIdea: 'Acknowledge their point, explain the specific trade-off or risk you were mitigating, and offer the pragmatic compromise.',
    technicalWords: [
      { term: 'Engineering Trade-off', explanation: 'Weighing simplicity and development speed against flexibility and future extensibility.' },
      { term: 'Pragmatism', explanation: 'Choosing practical solutions over theoretical purity.' }
    ],
    whyThisMattersInLLD: 'Senior engineers are hired for their judgment, not just their ability to type design pattern names.',
    tryIt: 'Practice delivering a 60-second explanation of why you separated `OrderRepository` behind an interface for testability.',
    nowChangeTheRequirement: 'Interviewer says: "We won\'t write unit tests for this internal tool."',
    whatDidTheChangeTeachUs: 'You can agree gracefully: "Under that constraint, a direct concrete repository is the most efficient choice."',
    canYouExplainIt: 'Can you explain why trade-off awareness is more impressive than dogmatic rules?'
  })
};

// Unit 5.2.2
PHASE5_REWRITE['LLDP5-U5.2.2'] = {
  taskName: 'Unit 5.2.2: Explaining Why Locks Slow Down Your Code',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'When an interviewer asks "What happens to performance when 10,000 users access your service concurrently?", how do you explain lock contention and granularity clearly?',
    seeItWithASmallExample: `Coarse lock bottleneck:
class ParkingLot {
    std::mutex globalMtx; // Locks the ENTIRE parking lot for every car!
    // Result: Cars entering Floor 1 block cars parking on Floor 5!
};`,
    whatIsGoingWrong: 'Using a single global lock creates a bottleneck where multiple CPU cores sit idle waiting for the lock, destroying application throughput.',
    theSimpleIdea: 'Explain lock granularity: lock only the specific resource being modified (e.g. per-floor or per-spot locks), or use read-write locks (`std::shared_mutex`) when reads vastly outnumber writes.',
    technicalWords: [
      { term: 'Lock Contention', explanation: 'When multiple threads fight to acquire the same lock, forcing them to wait.' },
      { term: 'Read-Write Lock', explanation: 'Allows multiple threads to read simultaneously, but only one thread to write.' },
      { term: 'Throughput', explanation: 'The number of transactions processed per second.' }
    ],
    whyThisMattersInLLD: 'Articulating concurrency bottlenecks proves you understand how code actually runs on production server hardware.',
    tryIt: 'Explain the difference in throughput between locking the entire Bank versus locking individual BankAccounts.',
    nowChangeTheRequirement: 'A customer transfers money from Account A to Account B. What concurrency danger arises?',
    whatDidTheChangeTeachUs: 'Deadlock! If Thread 1 locks A then B, while Thread 2 locks B then A, both freeze forever. You must enforce lock ordering!',
    canYouExplainIt: 'Can you explain why locking a single bank account is faster than locking the entire bank building?'
  })
};

// Unit 5.2.3
PHASE5_REWRITE['LLDP5-U5.2.3'] = {
  taskName: 'Unit 5.2.3: Thinking Out Loud So the Interviewer Can Follow You',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'If you sit in silence for 15 minutes typing code, how does the interviewer know if you are stuck, making good design decisions, or going down the completely wrong path?',
    seeItWithASmallExample: `Silent candidate:
Types 100 lines of code. Discovers bug at minute 38. Fails.

Vocal candidate:
"I am now creating the SeatLockManager. I am using an unordered_map to store active leases. I am making the lock function thread-safe by acquiring a lock_guard on this mutex before checking expiration."`,
    whatIsGoingWrong: 'Silence makes it impossible for the interviewer to guide you or help you if you misinterpret a requirement.',
    theSimpleIdea: 'Narrate your thought process in real-time. State what you are about to do, why you chose that data structure, and what edge case you are guarding against.',
    technicalWords: [
      { term: 'Think-Aloud Protocol', explanation: 'Vocalizing decisions, assumptions, and trade-offs as you design and code.' },
      { term: 'Signposting', explanation: 'Telling the interviewer where you are in the 45-minute roadmap (e.g. "Now that entities are done, I am moving to the main booking workflow").' }
    ],
    whyThisMattersInLLD: 'Communication is 25% of the interview score. An interviewer who understands your reasoning will actively steer you away from traps.',
    tryIt: 'Pick any 10 lines of C++ code you wrote today. Read them out loud, explaining the purpose of each variable and check.',
    nowChangeTheRequirement: 'Explain the edge case you are guarding against before writing the if-statement.',
    whatDidTheChangeTeachUs: 'Signposting your edge cases shows the interviewer that you write defensive, production-ready code.',
    canYouExplainIt: 'Can you explain why explaining your thoughts out loud helps your interviewer help you?'
  })
};

// Unit 5.3.1
PHASE5_REWRITE['LLDP5-U5.3.1'] = {
  taskName: 'Unit 5.3.1: The 30-Minute Fast Scoping & Interface Sprint',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'How do you execute an accelerated 30-minute interview round where the goal is rapid scoping, clean entity contracts, and public API definitions without getting bogged down in full implementations?',
    seeItWithASmallExample: `30-minute roadmap:
00-05 min: Scope and clarify.
05-15 min: Entity and Value Object extraction.
15-25 min: Public service API and class interaction modeling.
25-30 min: Walkthrough and edge-case verification.`,
    whatIsGoingWrong: 'Treating a 30-minute round like a 60-minute round causes you to get stuck writing low-level helper functions while the main system architecture remains unaddressed.',
    theSimpleIdea: 'Focus on architectural clarity and interfaces. Demonstrate clean separation of concerns and clear type contracts rapidly.',
    technicalWords: [
      { term: 'Fast Scoping', explanation: 'Agreeing on core boundaries within 3-5 minutes.' },
      { term: 'Interface-First Design', explanation: 'Defining public system contracts before internal state mechanics.' }
    ],
    whyThisMattersInLLD: 'Many first-round technical phone screens are strictly 30 minutes. Speed and clarity are essential.',
    tryIt: 'Take "Design an In-Memory Key-Value Store with TTL". Outline all classes and interfaces in 15 minutes.',
    nowChangeTheRequirement: 'Add support for transactions (BEGIN, COMMIT, ROLLBACK).',
    whatDidTheChangeTeachUs: 'Adding transaction methods to your interface skeleton took 2 minutes because you didn\'t have 200 lines of implementation to rewrite.',
    canYouExplainIt: 'Can you explain how a high-level architectural outline proves your system design ability in a short round?'
  })
};

// Unit 5.3.2
PHASE5_REWRITE['LLDP5-U5.3.2'] = {
  taskName: 'Unit 5.3.2: The Standard 45-Minute Interview Sprint',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'How do you execute the classic 45-minute FAANG LLD round: balancing scoping, complete class definitions, business logic implementation, and edge-case testing within the allotted time?',
    seeItWithASmallExample: `The 45-Minute Master Blueprint:
00-05 min: Scoping & Requirements.
05-15 min: Entities & Class Diagram skeleton.
15-35 min: Core Business Logic Implementation.
35-40 min: Curveball requirement pivot or concurrency check.
40-45 min: Edge case testing & wrap-up.`,
    whatIsGoingWrong: 'Losing track of time during implementation leaves no room to demonstrate edge-case testing or handle the interviewer’s follow-up questions.',
    theSimpleIdea: 'Treat the 45-minute session as a choreographed 5-stage sprint. Wear a watch or keep a timer visible, moving intentionally from stage to stage.',
    technicalWords: [
      { term: 'Time-Boxing', explanation: 'Allocating a strict maximum time limit to each phase of the interview.' },
      { term: 'Core Workflow', explanation: 'The primary end-to-end user story that must work before secondary features are coded.' }
    ],
    whyThisMattersInLLD: 'Candidates who master time-boxing consistently reach the final testing phase and receive "Strong Hire" recommendations.',
    tryIt: 'Run a full 45-minute mock on "Design a Parking Lot" using the 5-stage blueprint.',
    nowChangeTheRequirement: 'Check your progress at minute 35. Did you have a working core flow?',
    whatDidTheChangeTeachUs: 'Sticking to time boxes ensures you always have working code to show, even if minor features remain as stubs.',
    canYouExplainIt: 'Can you outline the 5 phases of a 45-minute LLD interview from memory?'
  })
};

// Unit 5.3.3
PHASE5_REWRITE['LLDP5-U5.3.3'] = {
  taskName: 'Unit 5.3.3: The 60-Minute Comprehensive System Sprint',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'How do you handle a full 60-minute onsite architectural round that demands end-to-end domain modeling, multi-threaded concurrency, custom exceptions, and automated unit testing?',
    seeItWithASmallExample: `60-Minute Scope:
In 60 minutes, the interviewer expects not just classes, but thread-safety primitives, clean custom exception hierarchies, and a self-contained unit test suite verifying happy and error paths.`,
    whatIsGoingWrong: 'Writing shallow code without thread safety or error handling in a 60-minute round signals junior level execution.',
    theSimpleIdea: 'Use the extra time to demonstrate depth: add fine-grained mutex locks, validate state transitions, write expressive unit tests, and defend trade-offs.',
    technicalWords: [
      { term: 'Production-Grade Coding', explanation: 'Writing code with proper const-correctness, exception safety, and thread synchronization.' },
      { term: 'Test Scenarios', explanation: 'Unit tests covering normal operation, boundary conditions, and invalid inputs.' }
    ],
    whyThisMattersInLLD: 'Onsite rounds for Staff and Senior levels evaluate code as if it were being deployed directly to production.',
    tryIt: 'Build a thread-safe Rate Limiter with 3 unit tests in 60 minutes.',
    nowChangeTheRequirement: 'Add concurrent stress testing with 10 threads.',
    whatDidTheChangeTeachUs: 'Testing under multi-threaded stress immediately exposes missing locks or race conditions.',
    canYouExplainIt: 'Can you explain what separates a 60-minute senior interview submission from a quick 30-minute prototype?'
  })
};

// Unit 5.4.1
PHASE5_REWRITE['LLDP5-U5.4.1'] = {
  taskName: 'Unit 5.4.1: Foundation Tier System Mock Simulation',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'How do you score maximum points on a foundational LLD interview problem (like Vending Machine or Tic-Tac-Toe) where the interviewer evaluates clean encapsulation, state modeling, and boundary checks?',
    seeItWithASmallExample: `Foundation Rubric Focus:
- Did you use primitives everywhere, or did you create Value Objects?
- Did you defend state invariants (e.g. balance >= 0)?
- Did you use clean polymorphic contracts instead of giant switch statements?`,
    whatIsGoingWrong: 'Treating foundational problems as "too simple" and writing sloppy code with public variables and magic numbers results in quick rejection.',
    theSimpleIdea: 'Demonstrate impeccable object-oriented discipline: private fields, defensive copying, meaningful method names, and clean state machines.',
    technicalWords: [
      { term: 'Rubric Dimension', explanation: 'A specific category of evaluation (e.g. Object Design, Code Quality).' },
      { term: 'Invariant Defense', explanation: 'Ensuring invalid domain state is mathematically impossible to produce.' }
    ],
    whyThisMattersInLLD: 'Foundational problems test whether your baseline habits are clean and professional.',
    tryIt: 'Execute a full mock on Vending Machine, focusing on cash float invariants.',
    nowChangeTheRequirement: 'Evaluate your code against the 4-dimension scoring rubric.',
    whatDidTheChangeTeachUs: 'Scoring yourself objectively reveals blind spots in variable naming and edge-case handling.',
    canYouExplainIt: 'Can you explain why writing clean foundational code is more important than using 10 design patterns?'
  })
};

// Unit 5.4.2
PHASE5_REWRITE['LLDP5-U5.4.2'] = {
  taskName: 'Unit 5.4.2: Resource Allocation Mock with Curveball',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'How do you structure resource allocation systems (like Parking Lot or Car Rental) so that when the interviewer introduces a mid-session curveball (e.g. VIP bays, hourly surge, EV chargers), your design absorbs it effortlessly?',
    seeItWithASmallExample: `Curveball Resilience:
If parking spot allocation is behind a \`SpotAllocationStrategy\` interface:
Interviewer curveball: "Now support Electric Vehicle charging spots with VIP priority."
Response: Create \`EvVipAllocationStrategy\`. Zero changes to ParkingLot class!`,
    whatIsGoingWrong: 'Hardcoding allocation loops directly inside the main manager class means any curveball requires rewriting your core loops under severe time pressure.',
    theSimpleIdea: 'Decouple resource allocation policies from the resource entities themselves. Keep entities dumb (they just hold state) and policies pluggable.',
    technicalWords: [
      { term: 'Resource Allocation Policy', explanation: 'The algorithm that decides which available resource to assign to an incoming request.' },
      { term: 'Curveball Absorption', explanation: 'Implementing a mid-interview requirement change cleanly without modifying working code.' }
    ],
    whyThisMattersInLLD: 'Resource allocation is the single most common theme in FAANG low level design interviews.',
    tryIt: 'Design Car Rental with pluggable allocation. Inject a "Nearest Branch" allocation rule.',
    nowChangeTheRequirement: 'Curveball: "Now allow one-way rentals with drop-off penalties."',
    whatDidTheChangeTeachUs: 'Because the rental entity was decoupled from pricing and return policies, handling one-way returns took only 5 minutes.',
    canYouExplainIt: 'Can you explain why separating "the spot" from "the rule that picks the spot" makes your code adaptable?'
  })
};

// Unit 5.4.3
PHASE5_REWRITE['LLDP5-U5.4.3'] = {
  taskName: 'Unit 5.4.3: High-Concurrency System Mock Simulation',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'How do you excel in an advanced high-concurrency interview round (like BookMyShow or Uber Dispatch) where the interviewer evaluates thread safety, race conditions, deadlocks, and temporal resource leases?',
    seeItWithASmallExample: `Concurrency Evaluation:
- Where are your critical sections?
- Are you locking at the seat level or the theater level?
- How do you release seats when users abandon checkout?
- How do you guarantee two drivers are not dispatched to the same ride?`,
    whatIsGoingWrong: 'Writing single-threaded code for a ticketing or dispatch system fails the technical requirements of the interview immediately.',
    theSimpleIdea: 'Combine domain modeling with precise synchronization: use fine-grained mutexes, expiring locks with TTLs, and explicit state machines.',
    technicalWords: [
      { term: 'Fine-Grained Synchronization', explanation: 'Locking individual resources rather than global containers to maximize concurrency.' },
      { term: 'Temporal Resource Lease', explanation: 'Holding resources temporarily with automatic timeout compensation.' }
    ],
    whyThisMattersInLLD: 'This is the pinnacle of Low Level Design interviews, distinguishing Staff engineers from senior developers.',
    tryIt: 'Run a full mock simulation of BookMyShow seat locking with concurrent threads.',
    nowChangeTheRequirement: 'Simulate 100 threads racing for the same 2 seats.',
    whatDidTheChangeTeachUs: 'Testing with high thread counts proves whether your locking semantics are truly airtight.',
    canYouExplainIt: 'Can you explain the difference between locking a seat during selection versus during final checkout?'
  })
};

// ============================================================================
// PRACTICAL DRILLS (13) — COMPLETE LEETCODE-STYLE SPECIFICATIONS
// ============================================================================

PHASE5_REWRITE['LLDP5-D5.1.1'] = {
  taskName: '5-Minute Scoping & Ambiguity Elimination Drill',
  taskDescription: formatDrillDescription({
    title: '5-Minute Scoping & Ambiguity Elimination Drill',
    problemStatement: 'Given a vague one-line interview prompt ("Design Amazon Locker"), formulate the 5 essential scoping questions, eliminate ambiguity, and agree on the MVP use cases within 5 minutes.',
    contextScenario: 'In a live interview, starting to code without scoping leads to disqualification. You must drive the opening conversation systematically.',
    startingPoint: 'Prompt: "Design Amazon Locker".',
    yourTask: `1. Formulate 5 scoping questions covering:
   - System boundaries (hardware kiosk controller vs cloud backend).
   - Locker sizes and package matching rules.
   - Access code generation and expiration.
   - Scale and concurrency assumptions.
   - Out-of-scope boundaries (payments, returns).
2. Explicitly draft the 3 agreed MVP use cases to implement.`,
    apiInterface: `// Scoping Deliverable:
// 1. Boundary Clarifications
// 2. Functional MVP Scope (Top 3 use cases)
// 3. Non-Functional Assumptions`,
    inputInteractionModel: 'Deliver structured scoping dialogue.',
    expectedBehavior: 'Systematic ambiguity elimination within 5 minutes.',
    examples: 'Clarified that Locker is in-memory controller for a single physical kiosk with Small, Medium, Large compartments.',
    constraintsAssumptions: '5-minute time limit.',
    edgeCases: 'Handling packages that exceed largest locker size.',
    acceptanceCriteria: [
      'Covers all 5 core scoping dimensions.',
      'Identifies explicit out-of-scope items.'
    ],
    whatToObserve: 'Notice how asking the right questions narrows the problem to an achievable 30-minute coding task.',
    thinkAbout: 'What should you do if an interviewer gives a vague answer like "It\'s up to you"?'
  })
};

PHASE5_REWRITE['LLDP5-D5.1.2'] = {
  taskName: 'Rapid Entity Extraction & Interface Definition Exercise',
  taskDescription: formatDrillDescription({
    title: 'Rapid Entity Extraction & Interface Definition Exercise',
    problemStatement: 'In 10 minutes, extract foundational domain entities, value objects, and public API interfaces for an In-Memory Cache with pluggable eviction policies before writing implementation logic.',
    contextScenario: 'Drafting clean class contracts prevents painful refactoring mid-interview.',
    startingPoint: 'Prompt: "Design an in-memory cache supporting get/put with LRU or LFU eviction".',
    yourTask: `1. Extract domain classes: \`Cache<K, V>\`, \`EvictionPolicy<K>\`, \`CacheEntry<V>\`.
2. Draft method signatures with proper parameter types and return values.
3. Decouple the cache storage from the eviction strategy.`,
    apiInterface: `template <typename K, typename V>
class Cache {
public:
    virtual std::optional<V> get(const K& key) = 0;
    virtual void put(const K& key, const V& value) = 0;
};`,
    inputInteractionModel: 'Draft class header skeletons.',
    expectedBehavior: 'Clean, compile-ready class contracts within 10 minutes.',
    examples: 'Cache delegates key access to EvictionPolicy cleanly.',
    constraintsAssumptions: '10-minute time limit.',
    edgeCases: 'Evicting from an empty cache; updating existing key.',
    acceptanceCriteria: [
      'Complete method signatures with types.',
      'Decoupled eviction strategy contract.'
    ],
    whatToObserve: 'Notice how reviewing the class skeleton with the interviewer builds confidence before coding.',
    thinkAbout: 'Why should the eviction policy only know about keys, not values?'
  })
};

PHASE5_REWRITE['LLDP5-D5.1.3'] = {
  taskName: 'Clean Production Coding Under 20-Minute Time Limits',
  taskDescription: formatDrillDescription({
    title: 'Clean Production Coding Under 20-Minute Time Limits',
    problemStatement: 'Implement a fully working, bug-free, encapsulated in-memory Rate Limiter module in modern C++ within a strict 20-minute implementation window.',
    contextScenario: 'Interviewers grade heavily on whether you can produce working code within time constraints.',
    startingPoint: 'Start from scratch. Implement RateLimiter using Token Bucket.',
    yourTask: `1. Implement \`TokenBucketRateLimiter\` with capacity and refill rate.
2. Implement \`bool allowRequest(string clientId)\`.
3. Include invariant validation (positive capacity, positive rates).
4. Write 2 unit tests verifying throttling under bursts and recovery after refill.`,
    apiInterface: `class TokenBucketRateLimiter {
public:
    TokenBucketRateLimiter(int capacity, double refillTokensPerSec);
    bool allowRequest(const std::string& clientId);
};`,
    inputInteractionModel: 'Call allowRequest with simulated timestamps.',
    expectedBehavior: 'Correctly throttles requests exceeding bucket capacity; refills over time.',
    examples: 'Capacity 3: 3 instant requests allowed, 4th rejected.',
    constraintsAssumptions: '20-minute strict time limit.',
    edgeCases: 'Clock going backwards or large elapsed time without integer overflow.',
    acceptanceCriteria: [
      'Code compiles with zero errors.',
      'Unit tests pass within 20-minute window.'
    ],
    whatToObserve: 'Notice how maintaining focus on the core token math avoids getting stuck.',
    thinkAbout: 'How does time-boxing practice improve your interview confidence?'
  })
};

PHASE5_REWRITE['LLDP5-D5.1.4'] = {
  taskName: 'Live Requirement Pivot Defense Exercise',
  taskDescription: formatDrillDescription({
    title: 'Live Requirement Pivot Defense Exercise',
    problemStatement: 'Take a completed Vending Machine codebase and adapt it cleanly when an interviewer introduces a surprise requirement pivot at minute 35: "Support contactless smartphone NFC payments and customer loyalty points."',
    contextScenario: 'Interviewers test architectural resilience by introducing late-session changes.',
    startingPoint: 'Review existing Vending Machine code.',
    yourTask: `1. Identify the impact boundary.
2. Add \`NfcPayment\` implementing the existing \`PaymentMethod\` interface.
3. Add \`LoyaltyManager\` to award points upon dispense.
4. Demonstrate that existing cash handling and catalog code required ZERO modifications.`,
    apiInterface: `class NfcPayment : public PaymentMethod { ... };
class LoyaltyManager { public: void awardPoints(const std::string& userId, int amountCents); };`,
    inputInteractionModel: 'Integrate NFC payment and loyalty into checkout flow.',
    expectedBehavior: 'NFC payments process smoothly; loyalty points awarded without altering cash logic.',
    examples: 'Customer pays via Apple Pay -> Dispenses product, awards 15 loyalty points.',
    constraintsAssumptions: 'Zero regressions in existing test suite.',
    edgeCases: 'NFC reader timeout during payment.',
    acceptanceCriteria: [
      'Existing vending machine classes remain unmodified (OCP).',
      'New payment type and loyalty functional.'
    ],
    whatToObserve: 'Notice how solid object design makes absorbing pivots almost effortless.',
    thinkAbout: 'What would have happened if payments were an enum switch inside VendingMachine?'
  })
};

PHASE5_REWRITE['LLDP5-D5.2.1'] = {
  taskName: 'Justifying Abstraction Under Scrutiny Defense Drill',
  taskDescription: formatDrillDescription({
    title: 'Justifying Abstraction Under Interviewer Scrutiny',
    problemStatement: 'Deliver a structured 2-minute verbal defense when an interviewer challenges your design: "Why did you create an abstract NotificationChannel? Why not just write an if/else in OrderService?"',
    contextScenario: 'Interviewers probe whether you understand trade-offs or merely memorize patterns.',
    startingPoint: 'Review the NotificationChannel architecture.',
    yourTask: `1. Deliver a structured response using the 4-part framework:
   - Empathize & Validate (acknowledge simplicity of concrete code).
   - Articulate Specific Risk (regression risk when adding SMS/Slack, inability to mock in unit tests).
   - Testing Value (instant in-memory mock testing without real SMTP).
   - Pragmatic Compromise (willingness to simplify if team context dictates).`,
    apiInterface: `// Verbal Defense Rubric:
// 1. Empathy
// 2. Concrete Risk
// 3. Testability
// 4. Compromise`,
    inputInteractionModel: 'Present verbal architectural reasoning.',
    expectedBehavior: 'Demonstrates senior design maturity and pragmatic judgment.',
    examples: 'Articulates why OCP prevents breaking existing email code when SMS is added.',
    constraintsAssumptions: '2-minute time limit.',
    edgeCases: 'Interviewer pushes back repeatedly: maintain poise and provide concrete examples.',
    acceptanceCriteria: [
      'Covers all 4 defense framework points.',
      'Avoids dogmatic buzzwords.'
    ],
    whatToObserve: 'Notice how interviewers respond positively to trade-off awareness.',
    thinkAbout: 'Why is saying "because of design patterns" the worst possible answer?'
  })
};

PHASE5_REWRITE['LLDP5-D5.2.2'] = {
  taskName: 'Explaining Concurrency Bottlenecks & Lock Granularity',
  taskDescription: formatDrillDescription({
    title: 'Explaining Concurrency Bottlenecks & Lock Granularity',
    problemStatement: 'Analyze a coarse-locked Booking system, explain why throughput collapses under high concurrency, and propose fine-grained locking and read-write locks with whiteboard diagrams.',
    contextScenario: 'Senior LLD rounds evaluate whether you understand how software interacts with hardware and operating system threads.',
    startingPoint: 'Review code where an entire theater is locked with a single mutex.',
    yourTask: `1. Explain lock contention and thread starvation under coarse locking.
2. Refactor to fine-grained seat locks using a concurrent map or per-seat mutexes.
3. Explain read-write locks (\`std::shared_mutex\`) for catalog search vs seat reservation.`,
    apiInterface: `class FineGrainedSeatManager {
private:
    std::unordered_map<std::string, std::mutex> seatLocks;
    std::shared_mutex catalogMtx;
};`,
    inputInteractionModel: 'Demonstrate concurrent access throughput comparison.',
    expectedBehavior: 'Fine-grained locks allow simultaneous booking of different seats without blocking.',
    examples: 'Thread 1 booking Seat A1 does not block Thread 2 booking Seat B5.',
    constraintsAssumptions: 'Multi-threaded performance analysis.',
    edgeCases: 'Deadlock prevention when booking multiple seats in a single request (lock ordering).',
    acceptanceCriteria: [
      'Accurately explains contention math.',
      'Enforces lock ordering for multi-seat bookings.'
    ],
    whatToObserve: 'Notice how sorting seat IDs before acquiring locks eliminates deadlocks.',
    thinkAbout: 'Why does acquiring multiple locks without sorting cause deadlocks?'
  })
};

PHASE5_REWRITE['LLDP5-D5.2.3'] = {
  taskName: 'Verbal Think-Aloud Modeling Exercise',
  taskDescription: formatDrillDescription({
    title: 'Verbal Think-Aloud Modeling Exercise',
    problemStatement: 'Practice continuous verbal narration while designing and coding an in-memory Key-Value store with TTL expiration, keeping the interviewer engaged throughout the implementation.',
    contextScenario: 'Silence during coding makes it impossible for interviewers to evaluate thought process.',
    startingPoint: 'Implement Key-Value Store while speaking continuously.',
    yourTask: `1. Vocalize assumptions before typing.
2. Explain data structure selection (\`std::unordered_map\` for O(1) lookups, \`std::chrono\` for timestamps).
3. Narrate invariant checks and edge-case defenses as you write them.`,
    apiInterface: `class KeyValueStore {
public:
    void set(const std::string& key, const std::string& value, int ttlSec);
    std::optional<std::string> get(const std::string& key);
};`,
    inputInteractionModel: 'Speak continuously while typing implementation.',
    expectedBehavior: 'Clear, structured technical communication with zero prolonged silence.',
    examples: '"I am using steady_clock to avoid system clock jump issues... Now checking if entry has expired."',
    constraintsAssumptions: 'No silence pauses exceeding 15 seconds.',
    edgeCases: 'Getting key that expired 1 millisecond ago.',
    acceptanceCriteria: [
      'Continuous technical narration.',
      'Working KeyValueStore implementation.'
    ],
    whatToObserve: 'Notice how speaking out loud clarifies your own thinking and catches bugs early.',
    thinkAbout: 'How does narrating your code make it easier for an interviewer to give hints?'
  })
};

PHASE5_REWRITE['LLDP5-D5.3.1'] = {
  taskName: '30-Minute Fast Scoping & Interface Sprint',
  taskDescription: formatDrillDescription({
    title: '30-Minute Fast Scoping & Interface Sprint: In-Memory Message Broker',
    problemStatement: 'Complete a rapid 30-minute interview sprint for an In-Memory Message Broker (Publish-Subscribe): scope requirements, extract entities (Topic, Publisher, Subscriber, Message), and draft all class interfaces.',
    contextScenario: 'Fast-paced phone screens demand rapid contract definition without implementation sprawl.',
    startingPoint: 'Prompt: "Design an in-memory pub-sub message broker".',
    yourTask: `1. Minutes 0-5: Scope topic creation, pub-sub semantics, FIFO ordering.
2. Minutes 5-15: Define Topic, Subscriber, Message, and Broker interfaces.
3. Minutes 15-25: Implement subscription and broadcast workflow.
4. Minutes 25-30: Verify edge cases (slow consumer, empty topic).`,
    apiInterface: `class ISubscriber { public: virtual ~ISubscriber() = default; virtual void onMessage(const Message& msg) = 0; };
class MessageBroker { public: void createTopic(const std::string& name); void subscribe(const std::string& topic, std::shared_ptr<ISubscriber> sub); void publish(const std::string& topic, const Message& msg); };`,
    inputInteractionModel: 'Publish messages to topics and receive via subscriber callbacks.',
    expectedBehavior: 'Subscribers receive published messages in order.',
    examples: 'Publish "Hello" to "sports" topic -> All sports subscribers receive "Hello".',
    constraintsAssumptions: '30-minute strict time-box.',
    edgeCases: 'Publishing to non-existent topic.',
    acceptanceCriteria: [
      'Full pub-sub contract established.',
      'Working subscription and broadcast logic within 30 minutes.'
    ],
    whatToObserve: 'Notice how adhering to the time-box ensures a complete submission.',
    thinkAbout: 'How would you scale this to multiple consumer groups?'
  })
};

PHASE5_REWRITE['LLDP5-D5.3.2'] = {
  taskName: '45-Minute Standard Interview Sprint',
  taskDescription: formatDrillDescription({
    title: '45-Minute Standard Interview Sprint: Parking Lot System',
    problemStatement: 'Complete a full 45-minute simulation of the Multi-Floor Parking Lot: 5 min scoping, 10 min entity design, 20 min core coding, 5 min curveball adaptation (EV charging), and 5 min testing.',
    contextScenario: 'Standard FAANG Low Level Design interview round simulation.',
    startingPoint: 'Blank editor window. Prompt: "Design a multi-floor parking lot".',
    yourTask: `1. Follow the 5-stage blueprint strictly.
2. Implement park, unpark, fee calculation, and display boards.
3. At minute 35, absorb curveball: "Support EV charging spots".
4. Run self-contained test suite verifying spot sizing and fees.`,
    apiInterface: `class ParkingLot { ... };`,
    inputInteractionModel: 'Full interview lifecycle execution.',
    expectedBehavior: 'Clean working code, curveball absorbed, all tests pass at minute 45.',
    examples: 'Park Car, Unpark Car, Park EV Truck, verify display counts.',
    constraintsAssumptions: '45-minute strict timer.',
    edgeCases: 'Full lot, vehicle larger than spot, invalid ticket.',
    acceptanceCriteria: [
      'All 5 stages completed within 45 minutes.',
      'Clean C++ implementation with zero compiler warnings.'
    ],
    whatToObserve: 'Notice how practicing full 45-minute rounds eliminates interview anxiety.',
    thinkAbout: 'Where did you spend the most time, and where can you optimize your pacing?'
  })
};

PHASE5_REWRITE['LLDP5-D5.3.3'] = {
  taskName: '60-Minute Comprehensive System Sprint',
  taskDescription: formatDrillDescription({
    title: '60-Minute Comprehensive System Sprint: Ride-Sharing Dispatch',
    problemStatement: 'Execute an end-to-end 60-minute onsite architectural round: design an in-memory Ride-Sharing Dispatch engine with spatial driver matching, trip state machine, cascading acceptance, and surge pricing.',
    contextScenario: 'Staff / Principal engineer onsite design round simulation.',
    startingPoint: 'Blank editor window. Prompt: "Design Uber dispatch engine".',
    yourTask: `1. Spatial tracking and nearest driver matching.
2. Complete trip state machine (Requested -> Accepted -> In_Progress -> Completed).
3. Cascading timeout dispatch.
4. Dynamic surge pricing based on demand.
5. Full automated unit test suite.`,
    apiInterface: `class DispatchPlatform { ... };`,
    inputInteractionModel: 'Complete end-to-end system simulation.',
    expectedBehavior: 'All dispatch workflows operate with high architectural fidelity.',
    examples: 'Rider requests ride -> Nearest driver matched -> Trip completed -> Receipt generated.',
    constraintsAssumptions: '60-minute strict timer.',
    edgeCases: 'Driver timeout, rider cancellation, zero nearby drivers.',
    acceptanceCriteria: [
      'Comprehensive production-quality implementation.',
      'Full test suite passing.'
    ],
    whatToObserve: 'Notice how 60 minutes allows demonstrating advanced depth like state machines and spatial indexing.',
    thinkAbout: 'How does spatial partitioning (QuadTree/GeoHash) scale driver search?'
  })
};

PHASE5_REWRITE['LLDP5-D5.4.1'] = {
  taskName: 'Foundation Tier Full Mock Simulation',
  taskDescription: formatDrillDescription({
    title: 'Foundation Tier Mock: Coffee Maker with Dynamic Customization',
    problemStatement: 'Simulate a complete 45-minute interview round designing a Coffee Maker that brews standard recipes and supports dynamic add-ons, evaluated against the 4-dimension FAANG scoring rubric.',
    contextScenario: 'Evaluates baseline object-oriented modeling, invariant defense, and clean design.',
    startingPoint: 'Blank editor window. Prompt: "Design an automated smart coffee machine".',
    yourTask: `1. Scope requirements and inventory canisters.
2. Model Recipe and Add-ons using clean composition/decorator design.
3. Implement atomic ingredient deduction.
4. Score your submission against the 4-dimension rubric.`,
    apiInterface: `class CoffeeMachine { ... };`,
    inputInteractionModel: 'Execute brewing workflows and inspect inventory.',
    expectedBehavior: 'Atomic deduction of ingredients; accurate recipe customization.',
    examples: 'Brew Cappuccino + Extra Shot -> Deducts ingredients atomically.',
    constraintsAssumptions: '45 minutes.',
    edgeCases: 'Insufficient ingredient aborts transaction with zero deductions.',
    acceptanceCriteria: [
      'Achieves passing grade on all 4 rubric dimensions.',
      'Zero leaky getters or public state corruption.'
    ],
    whatToObserve: 'Notice how cleanly add-ons compose onto base recipes.',
    thinkAbout: 'How would you explain your design to a non-technical product manager?'
  })
};

PHASE5_REWRITE['LLDP5-D5.4.2'] = {
  taskName: 'Intermediate Resource Allocation Mock with Curveball',
  taskDescription: formatDrillDescription({
    title: 'Intermediate Resource Allocation Mock: Hotel Room Reservation Engine',
    problemStatement: 'Simulate a complete 45-minute interview round designing a Hotel Reservation Engine managing room categories, date ranges, and absorb a curveball: "Dynamic weekend surge pricing and amenity add-ons".',
    contextScenario: 'Evaluates temporal interval checking, resource allocation, and curveball resilience.',
    startingPoint: 'Blank editor window. Prompt: "Design hotel room booking engine".',
    yourTask: `1. Model Hotel, Room (Deluxe, Suite), and DateRange.
2. Implement date overlap collision checking.
3. Absorb curveball: add amenity packages (Breakfast, Spa) and weekend pricing.
4. Evaluate submission against rubric.`,
    apiInterface: `class HotelReservationEngine { ... };`,
    inputInteractionModel: 'Book rooms across date ranges and verify collision detection.',
    expectedBehavior: 'Overlapping bookings for same room rejected; non-overlapping succeed.',
    examples: 'Book Room 101 March 1-5; Attempt to book March 3-7 rejected.',
    constraintsAssumptions: '45 minutes.',
    edgeCases: 'Checkout date equal to next check-in date (same-day turnover allowed).',
    acceptanceCriteria: [
      'Temporal booking collisions prevented.',
      'Curveball amenities integrate with zero architectural friction.'
    ],
    whatToObserve: 'Notice how encapsulating DateRange simplified overlap math.',
    thinkAbout: 'How does interval collision logic apply to calendar booking systems like Google Calendar?'
  })
};

PHASE5_REWRITE['LLDP5-D5.4.3'] = {
  taskName: 'Advanced High-Concurrency System Mock Simulation',
  taskDescription: formatDrillDescription({
    title: 'Advanced High-Concurrency Mock: BookMyShow Seat Locking Engine',
    problemStatement: 'Simulate an advanced 45-minute Staff-level interview round designing the BookMyShow temporary seat locking engine with multi-threaded concurrency, TTL expiration, and race condition defense.',
    contextScenario: 'Evaluates production concurrency, mutex locking, temporal leasing, and interview defense.',
    startingPoint: 'Blank editor window. Prompt: "Design concurrent movie seat locking system".',
    yourTask: `1. Model Theater, Show, and Seat entities.
2. Implement thread-safe 10-minute temporary seat lease mechanism.
3. Spawn 20 concurrent threads racing for same seats and verify zero double-bookings.
4. Implement automatic lease expiration cleanup.`,
    apiInterface: `class SeatLockService { ... };`,
    inputInteractionModel: 'Multi-threaded stress test execution.',
    expectedBehavior: 'Atomic lock acquisition; expired locks become free automatically.',
    examples: '20 threads race for Seat A1 -> Exactly 1 succeeds; 19 rejected gracefully.',
    constraintsAssumptions: '45 minutes. Multi-threaded C++17.',
    edgeCases: 'Payment completed at 9m59s vs 10m01s (boundary race).',
    acceptanceCriteria: [
      'Zero double-bookings under concurrent race conditions.',
      'Expired locks automatically reclaimed.',
      'High architectural score on Staff rubric.'
    ],
    whatToObserve: 'Notice how mastering this problem prepares you for any resource locking question in tech interviews.',
    thinkAbout: 'How do you defend your choice between optimistic locking vs pessimistic locking?'
  })
};

fs.writeFileSync(path.resolve(__dirname, 'phase5_rewritten_data.json'), JSON.stringify(PHASE5_REWRITE, null, 2));
console.log(`✓ Phase 5 successfully generated: ${Object.keys(PHASE5_REWRITE).length} records authored.`);

/**
 * Sarthi LLD Curriculum v2.1 — Phase 5 Data
 * Phase 5: The LLD Interview Arena: Live Defense, Communication & Mocks
 * Hierarchy: Phase -> Module -> Learning Unit -> Practical Drill
 *            Phase -> Major Problem -> Problem Version
 */

export const phase5Data = {
  key: "LLDP5",
  name: "LLD Phase 5: The LLD Interview Arena: Live Defense, Communication & Mocks",
  description: "Perform the complete LLD process under real interview constraints: scoping, ambiguity, design, coding, communication, trade-offs, pushback, curveballs, and mocks.",
  modules: [
    {
      taskId: "LLDP5-M1",
      taskName: "Module 5.1: The 45-Minute Interview Execution Protocol",
      taskDescription: "Master the time-boxed execution discipline required to structure, scope, design, code, and defend Low Level Design problems in high-stakes interviews.",
      taskPriority: "high",
      units: [
        {
          taskId: "LLDP5-U5.1.1",
          taskName: "Unit 5.1.1: Scoping & Ambiguity Elimination Protocol",
          unitCode: "5.1.1",
          taskDescription: "Formulate systematic scoping inquiries within the opening minutes of an interview, clarifying scale, constraints, and agreed core use cases.",
          conceptTopics: [
            "Functional vs non-functional boundary identification",
            "Eliminating ambiguity in open-ended prompts",
            "Negotiating MVP scope with the interviewer",
            "Establishing input/output contracts"
          ],
          targetTimeMinutes: 15,
          drills: [
            {
              taskId: "LLDP5-D5.1.1",
              taskName: "5-Minute Scoping & Ambiguity Elimination Drill",
              taskDescription: "Given a vague one-line prompt ('Design Amazon Locker' or 'Design a Rate Limiter'):\n1. Formulate the 5 essential scoping questions (functional vs non-functional boundaries).\n2. Clarify scale, concurrency, and persistence assumptions.\n3. Explicitly agree on the top 3 use cases to code with the interviewer.",
              actionVerb: "BUILD",
              level: "A",
              levelName: "Concept Drill",
              targetTimeMinutes: 15,
              difficulty: "easy"
            }
          ]
        },
        {
          taskId: "LLDP5-U5.1.2",
          taskName: "Unit 5.1.2: Rapid Entity Extraction & Contract Definition",
          unitCode: "5.1.2",
          taskDescription: "Extract foundational domain entities, value objects, and public API interfaces within 10 minutes before writing implementation logic.",
          conceptTopics: [
            "Identifying candidate entities and value objects",
            "Drafting public class contracts & method signatures",
            "Separating domain models from storage mechanisms",
            "Fast UML whiteboard sketching"
          ],
          targetTimeMinutes: 25,
          drills: [
            {
              taskId: "LLDP5-D5.1.2",
              taskName: "Rapid Entity Extraction & Interface Definition Exercise",
              taskDescription: "In 10 minutes, extract core domain entities, value objects, and public API interfaces for an in-memory Cache before writing any implementation details.",
              actionVerb: "BUILD",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 25,
              difficulty: "medium"
            }
          ]
        },
        {
          taskId: "LLDP5-U5.1.3",
          taskName: "Unit 5.1.3: Clean Production Coding Under Time Pressure",
          unitCode: "5.1.3",
          taskDescription: "Write production-quality, bug-free, encapsulated domain logic under strict 20-minute implementation time limits.",
          conceptTopics: [
            "Pacing and code structuring under pressure",
            "Defensive coding and invariant guards",
            "Writing self-documenting method names",
            "Avoiding compilation blockers during interviews"
          ],
          targetTimeMinutes: 30,
          drills: [
            {
              taskId: "LLDP5-D5.1.3",
              taskName: "Clean Production Coding Under 20-Minute Time Limits",
              taskDescription: "Implement a working, encapsulated domain module in 20 minutes with descriptive variable names, invariant validation, and zero syntax errors.",
              actionVerb: "BUILD",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 30,
              difficulty: "medium"
            }
          ]
        },
        {
          taskId: "LLDP5-U5.1.4",
          taskName: "Unit 5.1.4: Absorbing Curveball Requirement Pivots",
          unitCode: "5.1.4",
          taskDescription: "Adapt existing class contracts and workflows cleanly when an interviewer introduces mid-session requirement changes.",
          conceptTopics: [
            "Evaluating impact of requirement pivots",
            "Leveraging OCP to minimize ripple effects",
            "Refactoring without panic or code rewrites",
            "Explaining design trade-offs live"
          ],
          targetTimeMinutes: 20,
          drills: [
            {
              taskId: "LLDP5-D5.1.4",
              taskName: "Live Requirement Pivot Defense Exercise",
              taskDescription: "Scenario: At minute 35, the interviewer says: 'Now what if users can reserve lockers for someone else and cancel mid-transit?'\nDemonstrate how to adapt your class contracts cleanly without panic.",
              actionVerb: "DEFEND",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 20,
              difficulty: "medium"
            }
          ]
        }
      ]
    },
    {
      taskId: "LLDP5-M2",
      taskName: "Module 5.2: Communication, Pushback & Defense Drills",
      taskDescription: "Develop verbal articulacy, learn to think aloud continuously, and defend architectural choices constructively when interviewers challenge your design.",
      taskPriority: "high",
      units: [
        {
          taskId: "LLDP5-U5.2.1",
          taskName: "Unit 5.2.1: Defending Against Over-Engineering Pushback",
          unitCode: "5.2.1",
          taskDescription: "Justify abstractions, interfaces, and patterns concisely when challenged by interviewers favoring simplistic procedural code.",
          conceptTopics: [
            "Premature complexity vs necessary abstraction",
            "Articulating Open-Closed extensibility benefits",
            "90-second structured technical justification",
            "Respectful and collaborative defense posture"
          ],
          targetTimeMinutes: 15,
          drills: [
            {
              taskId: "LLDP5-D5.2.1",
              taskName: "Justifying Abstraction Under Scrutiny Defense Drill",
              taskDescription: "The interviewer challenges: 'Why did you create an interface and strategy pattern here instead of a simple switch statement?'\nDeliver a structured 90-second technical rationale explaining extensibility vs premature complexity.",
              actionVerb: "DEFEND",
              level: "A",
              levelName: "Concept Drill",
              targetTimeMinutes: 15,
              difficulty: "easy"
            }
          ]
        },
        {
          taskId: "LLDP5-U5.2.2",
          taskName: "Unit 5.2.2: Articulating Performance & Concurrency Trade-Offs",
          unitCode: "5.2.2",
          taskDescription: "Explain thread contention, lock granularity, memory consumption, and cache locality when interviewers probe scale limits.",
          conceptTopics: [
            "Coarse vs fine-grained lock contention",
            "Throughput vs latency trade-offs in LLD",
            "Memory overhead of pattern abstractions",
            "Lock-free and optimistic concurrency alternatives"
          ],
          targetTimeMinutes: 15,
          drills: [
            {
              taskId: "LLDP5-D5.2.2",
              taskName: "Explaining Concurrency Bottlenecks & Lock Granularity",
              taskDescription: "The interviewer asks: 'What happens when 5,000 requests hit your synchronized method every second?'\nExplain thread contention, coarse vs fine-grained locking, and lock-free alternative approaches.",
              actionVerb: "DEFEND",
              level: "A",
              levelName: "Concept Drill",
              targetTimeMinutes: 15,
              difficulty: "easy"
            }
          ]
        },
        {
          taskId: "LLDP5-U5.2.3",
          taskName: "Unit 5.2.3: Continuous Verbal Think-Aloud Discipline",
          unitCode: "5.2.3",
          taskDescription: "Narrate architectural reasoning continuously during live modeling to keep the interviewer engaged and aligned.",
          conceptTopics: [
            "Avoiding prolonged silence during design",
            "Verbalizing hypotheses and decision branches",
            "Soliciting interviewer buy-in at key junctures",
            "Signaling confidence without arrogance"
          ],
          targetTimeMinutes: 20,
          drills: [
            {
              taskId: "LLDP5-D5.2.3",
              taskName: "Verbal Think-Aloud Modeling Exercise",
              taskDescription: "Record a verbal design walkthrough: narrate your thought process while mapping candidate classes for a Doctor Appointment Scheduling System without long pauses.",
              actionVerb: "BUILD",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 20,
              difficulty: "medium"
            }
          ]
        }
      ]
    },
    {
      taskId: "LLDP5-M3",
      taskName: "Module 5.3: Timed Pressure Sprints",
      taskDescription: "Build speed, stamina, and fluency by tackling unseen problem prompts under strict time-boxed conditions.",
      taskPriority: "high",
      units: [
        {
          taskId: "LLDP5-U5.3.1",
          taskName: "Unit 5.3.1: 30-Minute Rapid Scoping & Interface Sprint",
          unitCode: "5.3.1",
          taskDescription: "Accelerate through scoping, class extraction, and method signatures on an unseen problem in 30 minutes.",
          conceptTopics: [
            "Rapid domain mapping",
            "Strict milestone time-boxing",
            "Minimalist interface drafting",
            "Pacing control under tight constraints"
          ],
          targetTimeMinutes: 30,
          drills: [
            {
              taskId: "LLDP5-D5.3.1",
              taskName: "30-Minute Fast Scoping & Interface Sprint",
              taskDescription: "Prompt: Design an In-Memory Key-Value Store with TTL Expiration.\nProduce a complete class hierarchy and public interface contracts in 30 minutes.",
              actionVerb: "BUILD",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 30,
              difficulty: "medium"
            }
          ]
        },
        {
          taskId: "LLDP5-U5.3.2",
          taskName: "Unit 5.3.2: 45-Minute Standard Interview Sprint",
          unitCode: "5.3.2",
          taskDescription: "Simulate a standard 45-minute FAANG/top-tier LLD interview session from prompt to verified code.",
          conceptTopics: [
            "Full interview milestone allocation",
            "Conflict resolution logic modeling",
            "Balancing depth vs breadth in implementation",
            "Handling self-identified edge cases"
          ],
          targetTimeMinutes: 45,
          drills: [
            {
              taskId: "LLDP5-D5.3.2",
              taskName: "45-Minute Standard Interview Sprint",
              taskDescription: "Prompt: Design a Meeting Room Scheduler.\nEnd-to-end design, conflict detection logic, and working code implementation in 45 minutes.",
              actionVerb: "BUILD",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 45,
              difficulty: "medium"
            }
          ]
        },
        {
          taskId: "LLDP5-U5.3.3",
          taskName: "Unit 5.3.3: 60-Minute Comprehensive System Sprint",
          unitCode: "5.3.3",
          taskDescription: "Tackle a multi-faceted concurrent system prompt within an extended 60-minute evaluation session.",
          conceptTopics: [
            "Complex lifecycle modeling under pressure",
            "Thread pool and queue coordination",
            "Cancellation and failure recovery semantics",
            "Stamina and architectural composure"
          ],
          targetTimeMinutes: 60,
          drills: [
            {
              taskId: "LLDP5-D5.3.3",
              taskName: "60-Minute Comprehensive System Sprint",
              taskDescription: "Prompt: Design an In-Memory Task Scheduler (Cron Engine).\nHandle thread pools, priority queues, periodic recurrence, and task cancellation in 60 minutes.",
              actionVerb: "BUILD",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 60,
              difficulty: "hard"
            }
          ]
        }
      ]
    },
    {
      taskId: "LLDP5-M4",
      taskName: "Module 5.4: Full Mock Interview Simulations (4-Dimension Rubric)",
      taskDescription: "Comprehensive full-length mock interviews evaluated against Sarthi's 4-dimension objective engineering rubric.",
      taskPriority: "high",
      units: [
        {
          taskId: "LLDP5-U5.4.1",
          taskName: "Unit 5.4.1: Foundation Tier System Mock Simulation",
          unitCode: "5.4.1",
          taskDescription: "Execute a full mock interview on an unseen hardware or self-service system, scoring performance against the 4 dimensions.",
          conceptTopics: [
            "Rubric Dimension 1: Domain Modeling & Responsibility Cleanliness (25%)",
            "Rubric Dimension 2: SOLID & Pattern Application (25%)",
            "Rubric Dimension 3: Requirement Change Resilience (25%)",
            "Rubric Dimension 4: Code Quality & Communication (25%)"
          ],
          targetTimeMinutes: 45,
          drills: [
            {
              taskId: "LLDP5-D5.4.1",
              taskName: "Foundation Tier Full Mock Simulation",
              taskDescription: "Target Domain: Unseen Self-Service Hardware System.\nComplete scoping, design, and code, followed by self-evaluation against the 4-dimension rubric.",
              actionVerb: "BUILD",
              level: "C",
              levelName: "Full Mock",
              targetTimeMinutes: 60,
              difficulty: "medium"
            }
          ]
        },
        {
          taskId: "LLDP5-U5.4.2",
          taskName: "Unit 5.4.2: Intermediate Resource Allocation System Mock",
          unitCode: "5.4.2",
          taskDescription: "Execute a full mock interview with mid-point curveball injection on an unseen resource allocation or reservation domain.",
          conceptTopics: [
            "Mid-session requirement injection resilience",
            "Temporal conflict resolution",
            "Live refactoring under scrutiny",
            "Calibrated rubric scoring"
          ],
          targetTimeMinutes: 45,
          drills: [
            {
              taskId: "LLDP5-D5.4.2",
              taskName: "Intermediate Resource Allocation Mock with Curveball",
              taskDescription: "Target Domain: Unseen Reservation & Fleet Allocation Platform.\nFull mock session with mid-point requirement curveball injection.",
              actionVerb: "BUILD",
              level: "C",
              levelName: "Full Mock",
              targetTimeMinutes: 45,
              difficulty: "hard"
            }
          ]
        },
        {
          taskId: "LLDP5-U5.4.3",
          taskName: "Unit 5.4.3: Advanced High-Concurrency System Mock",
          unitCode: "5.4.3",
          taskDescription: "Execute a high-intensity mock interview demanding thread synchronization, race condition elimination, and rigorous trade-off defense.",
          conceptTopics: [
            "Concurrent state machine design",
            "Live multi-threaded defense against interviewer challenges",
            "Deadlock and starvation elimination proof",
            "Comprehensive post-interview rubric debrief"
          ],
          targetTimeMinutes: 60,
          drills: [
            {
              taskId: "LLDP5-D5.4.3",
              taskName: "Advanced High-Concurrency System Mock Simulation",
              taskDescription: "Target Domain: High-Concurrency Matchmaking or Bidding Engine.\nHandle race conditions, thread synchronization, and live pushback on design choices.",
              actionVerb: "BUILD",
              level: "C",
              levelName: "Full Mock",
              targetTimeMinutes: 60,
              difficulty: "hard"
            }
          ]
        }
      ]
    }
  ],
  majorProblems: []
};

/**
 * Sarthi LLD Curriculum v2.1 — Phase 2 Data
 * Phase 2: Code Smells, SOLID Principles & Architectural Decisions
 * Hierarchy: Phase -> Module -> Learning Unit -> Practical Drill
 *            Phase -> Major Problem -> Problem Version
 */

export const phase2Data = {
  key: "LLDP2",
  name: "LLD Phase 2: Code Smells, SOLID Principles & Architectural Decisions",
  description: "Learn to recognize bad designs, understand design pain, apply SOLID/clean architecture principles via refactoring, and make deliberate architectural choices.",
  modules: [
    {
      taskId: "LLDP2-M1",
      taskName: "Module 2.1: Code Smells & High Cohesion (SRP & ISP)",
      taskDescription: "Master smell detection in legacy systems. Learn to identify God classes, primitive obsession, and fat interfaces, breaking them down into cohesive, focused collaborators.",
      taskPriority: "high",
      units: [
        {
          taskId: "LLDP2-U2.1.1",
          taskName: "Unit 2.1.1: Single Responsibility & Dismantling God Classes",
          unitCode: "2.1.1",
          taskDescription: "Recognize the single reason to change per class, extracting cohesive domain services from bloated orchestrator classes.",
          conceptTopics: [
            "Single Responsibility Principle (SRP) definition",
            "Detecting God Class antipatterns and high coupling",
            "Extract Class and Move Method refactoring techniques",
            "Separation of business logic from infrastructure I/O"
          ],
          targetTimeMinutes: 35,
          drills: [
            {
              taskId: "LLDP2-D2.1.1",
              taskName: "Dismantling the God Class UserManager",
              taskDescription: "An 800-line UserManager handles: password hashing, SQL database persistence, email validation, session tokens, and PDF invoice generation. A bug fix in PDF formatting breaks user login. Extract cohesive sub-components: PasswordService, UserRepository, TokenManager, and InvoiceGenerator. Ensure UserService strictly orchestrates business workflows without touching raw I/O.",
              actionVerb: "REFACTOR",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 30,
              difficulty: "medium"
            }
          ]
        },
        {
          taskId: "LLDP2-U2.1.2",
          taskName: "Unit 2.1.2: Interface Segregation & Client-Specific Contracts",
          unitCode: "2.1.2",
          taskDescription: "Prevent fat interface pollution by creating role-specific contracts tailored to individual client needs.",
          conceptTopics: [
            "Interface Segregation Principle (ISP) definition",
            "The smell of throwing UnsupportedOperationException",
            "Role-based interfaces vs header interfaces",
            "Decoupling consumer dependencies"
          ],
          targetTimeMinutes: 25,
          drills: [
            {
              taskId: "LLDP2-D2.1.2",
              taskName: "Segregating Bloated CloudStorageProvider",
              taskDescription: "A CloudStorageProvider interface contains: upload(), download(), transcodeVideo(), generateThumbnail(), and billTenant(). Simple text-storage clients are forced to implement video methods with throw new UnsupportedOperationException(). Segregate into role-tailored interfaces: StorageReader, StorageWriter, and MediaProcessor, refactoring clients to depend only on the minimal interface they require.",
              actionVerb: "REFACTOR",
              level: "A",
              levelName: "Concept Drill",
              targetTimeMinutes: 15,
              difficulty: "easy"
            }
          ]
        }
      ]
    },
    {
      taskId: "LLDP2-M2",
      taskName: "Module 2.2: Extensibility & Polymorphic Subtyping (OCP & LSP)",
      taskDescription: "Learn to write code that is open for extension but closed for modification, and ensure derived classes honor behavioral contracts without runtime surprises.",
      taskPriority: "high",
      units: [
        {
          taskId: "LLDP2-U2.2.1",
          taskName: "Unit 2.2.1: Open/Closed Principle via Polymorphic Dispatch",
          unitCode: "2.2.1",
          taskDescription: "Eliminate cascading if-else and switch statements by delegating to polymorphic strategy interfaces and registries.",
          conceptTopics: [
            "Open/Closed Principle (OCP) definition",
            "Smell of type-code switch statements across codebases",
            "Polymorphic strategies and dynamic registration",
            "Adding new variants with zero modification to tested code"
          ],
          targetTimeMinutes: 30,
          drills: [
            {
              taskId: "LLDP2-D2.2.1",
              taskName: "Replacing Type-Code Switch with Polymorphic Strategy",
              taskDescription: "A TaxCalculator contains a 40-line switch(regionCode) statement. Every quarter when new tax jurisdictions are added, tested code must be modified, risking global regression. Extract an abstract TaxComputationStrategy interface and implement a registry map allowing dynamic registration of regional tax calculators without modifying existing classes.",
              actionVerb: "REFACTOR",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 25,
              difficulty: "medium"
            }
          ]
        },
        {
          taskId: "LLDP2-U2.2.2",
          taskName: "Unit 2.2.2: Liskov Substitution & Behavioral Subtyping",
          unitCode: "2.2.2",
          taskDescription: "Ensure derived classes substitute base contracts without corrupting system invariants or violating client expectations.",
          conceptTopics: [
            "Liskov Substitution Principle (LSP) formal definition",
            "Classic Square extends Rectangle geometric trap",
            "ReadOnlyCollection extends Collection runtime crash",
            "Preconditions cannot be strengthened, postconditions cannot be weakened"
          ],
          targetTimeMinutes: 25,
          drills: [
            {
              taskId: "LLDP2-D2.2.2",
              taskName: "Spotting Liskov Substitution Violations",
              taskDescription: "Analyze two classic subtyping traps: Square extends Rectangle where setting width mutates height, and ReadOnlyCollection extends Collection where .add() throws runtime exceptions. Write clean, LSP-compliant refactorings separating mutable from immutable hierarchies.",
              actionVerb: "COMPARE",
              level: "A",
              levelName: "Concept Drill",
              targetTimeMinutes: 15,
              difficulty: "easy"
            }
          ]
        }
      ]
    },
    {
      taskId: "LLDP2-M3",
      taskName: "Module 2.3: Decoupling & Inversion of Control (DIP)",
      taskDescription: "Learn to decouple high-level business rules from low-level infrastructure details by depending on abstractions, making software easily testable.",
      taskPriority: "high",
      units: [
        {
          taskId: "LLDP2-U2.3.1",
          taskName: "Unit 2.3.1: Dependency Inversion & Mockable Ports",
          unitCode: "2.3.1",
          taskDescription: "Apply Dependency Inversion using abstract ports and constructor injection to enable fast, reliable unit testing without external systems.",
          conceptTopics: [
            "Dependency Inversion Principle (DIP) definition",
            "High-level policy decoupling from low-level detail",
            "Constructor Dependency Injection without magic frameworks",
            "Testability via Fake/Mock port implementations"
          ],
          targetTimeMinutes: 35,
          drills: [
            {
              taskId: "LLDP2-D2.3.1",
              taskName: "Manual Constructor Injection & Fake Ports",
              taskDescription: "Build an OrderFulfillmentService that depends on abstract PaymentPort and NotificationPort. Provide production implementations (StripeGateway, SendgridMailer). Write unit tests using FakePaymentPort and FakeNotificationPort asserting behavior without network calls.",
              actionVerb: "BUILD",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 30,
              difficulty: "medium"
            }
          ]
        }
      ]
    },
    {
      taskId: "LLDP2-M4",
      taskName: "Module 2.4: Dedicated Design Decision Drills",
      taskDescription: "Develop conscious architectural judgment. Train yourself to explain the 'WHY' behind structural trade-offs under interviewer examination.",
      taskPriority: "high",
      units: [
        {
          taskId: "LLDP2-U2.4.1",
          taskName: "Unit 2.4.1: Fundamental Structural Trade-Offs",
          unitCode: "2.4.1",
          taskDescription: "Master the key architectural decisions: inheritance vs composition, switch vs polymorphism, and concrete vs abstract vs interface.",
          conceptTopics: [
            "Inheritance vs Composition decision checklist",
            "Switch vs Strategy threshold analysis",
            "Interface vs Abstract Class usage criteria",
            "Identifying and trimming speculative over-engineering (YAGNI)"
          ],
          targetTimeMinutes: 45,
          drills: [
            {
              taskId: "LLDP2-D2.4.1",
              taskName: "Inheritance vs Composition Trade-offs",
              taskDescription: "Evaluate 8 concrete scenarios and justify whether inheritance or composition provides superior maintainability, testability, and resilience to requirement changes.",
              actionVerb: "DEFEND",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 20,
              difficulty: "medium"
            },
            {
              taskId: "LLDP2-D2.4.2",
              taskName: "Switch vs Polymorphism: Defining the Threshold",
              taskDescription: "When is a 3-case switch statement completely acceptable, and when does it become an antipattern? Establish the 4-question decision checklist to avoid over-engineering.",
              actionVerb: "COMPARE",
              level: "A",
              levelName: "Concept Drill",
              targetTimeMinutes: 15,
              difficulty: "easy"
            },
            {
              taskId: "LLDP2-D2.4.3",
              taskName: "Concrete Class vs Abstract Class vs Interface",
              taskDescription: "Classify when to use pure interfaces (behavioral contracts) vs abstract base classes (shared state and template method hooks).",
              actionVerb: "COMPARE",
              level: "A",
              levelName: "Concept Drill",
              targetTimeMinutes: 15,
              difficulty: "easy"
            },
            {
              taskId: "LLDP2-D2.4.4",
              taskName: "YAGNI & Over-Engineering Audit",
              taskDescription: "Take an over-engineered codebase with 6 unnecessary interfaces and 2 factories for a feature that only has 1 implementation, and refactor it to simple, robust code.",
              actionVerb: "REFACTOR",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 25,
              difficulty: "medium"
            },
            {
              taskId: "LLDP2-D2.4.5",
              taskName: "Predicting OCP Failures in Notification Engine",
              taskDescription: "Analyze an existing notification service and predict which future requirements will trigger cascade edits. Formulate the proactive design modification.",
              actionVerb: "PREDICT",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 20,
              difficulty: "medium"
            }
          ]
        }
      ]
    }
  ],
  majorProblems: [
    {
      taskId: "LLDP2-P1",
      taskName: "Problem 5 — Design a Multi-Floor Parking Lot",
      difficulty: "medium",
      targetTime: "90 mins",
      taskPriority: "high",
      taskDescription: `## Problem 5 — Design a Multi-Floor Parking Lot

* **Difficulty:** Medium
* **Target Time:** 90 minutes
* **Category:** Multi-Entity Resource Allocation & Dynamic Billing

---

### 1. Real-World Context
A commercial shopping mall requires an automated parking management system to govern vehicle entries, exits, real-time spot allocations across multiple floors, and dynamic fee calculations. The system must operate autonomously with minimal human attendant intervention.

---

### 2. Functional Requirements
1. **Vehicle & Spot Sizing:**
   * Vehicle types: Motorcycle, Car, Large Truck.
   * Spot types: Small, Compact, Large.
   * Fit rules: Motorcycle fits in any spot; Car fits in Compact or Large; Truck fits only in Large.
2. **Multi-Floor Organization:**
   * $F$ floors, each having $S$ designated spots.
   * Floor-level automated display boards displaying available spots per vehicle category in real time.
3. **Entry Workflow:**
   * Vehicle arrives at entry gate; system determines spot via configured allocation strategy.
   * If available: assigns spot, prints immutable \`ParkingTicket\` (Ticket ID, Entry Timestamp, Vehicle Registration, Spot ID).
   * If full: rejects vehicle with \`ParkingLotFullException\`.
4. **Exit Workflow & Billing:**
   * Vehicle presents ticket at exit gate; system computes parking fee via configured pricing strategy, accepts payment, releases spot, and marks ticket paid.

---

### 3. Supported Operations (Interface Contract)
\`\`\`java
public interface IParkingLotController {
    ParkingTicket processEntry(Vehicle vehicle, Gate entryGate);
    Receipt processExit(ParkingTicket ticket, Gate exitGate, PaymentMethod payment);
    int getAvailableSpotCount(int floorNumber, SpotType spotType);
    void setAllocationStrategy(ParkingAllocationStrategy strategy);
    void setPricingStrategy(PricingStrategy strategy);
}
\`\`\`

---

### 4. Progressive Evolving Versions (Subtask Checklist)
* **Version 1 (Single Floor Baseline):** Basic entry/exit, single floor, car-only, static hourly fee.
* **Version 2 (Vehicle & Spot Multiplicity):** Introduce Motorcycle, Car, Truck and Small, Compact, Large spots with fit constraints.
* **Version 3 (Multi-Floor Topology & Displays):** Multiple floors, gate routing, floor display boards updating dynamically.
* **Version 4 (Pluggable Spot Allocation Strategies):** Strategy 1: Nearest to Entrance; Strategy 2: Lowest Floor First; Strategy 3: Distributed Load Balance.
* **Version 5 (Dynamic Tiered Fee Structures):** Flat rate, hourly rate, tiered time pricing (first 2 hours free, subsequent hours progressive).
* **Version 6 (Requirement Change — EV Charging Bays):** Introduce Electric Vehicles with charging bays (kWh consumed + parking duration billing).
* **Version 7 (Comprehensive Design Review):** Evaluate encapsulation boundaries, gate orchestrators, ticket immutability, and OCP extension points.`,
      versions: [
        {
          taskId: "LLDP2-P1-V1",
          taskName: "Version 1: Single Floor Baseline",
          taskDescription: "Basic entry/exit, single floor, car-only, flat hourly fee.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        },
        {
          taskId: "LLDP2-P1-V2",
          taskName: "Version 2: Vehicle & Spot Multiplicity",
          taskDescription: "Model distinct vehicle and spot sizes with hierarchical fit validation.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP2-P1-V3",
          taskName: "Version 3: Multi-Floor Topology & Displays",
          taskDescription: "Coordinate multiple floors and dynamic real-time display boards.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP2-P1-V4",
          taskName: "Version 4: Pluggable Spot Allocation Strategies",
          taskDescription: "Implement interchangeable allocation algorithms (Nearest, Lowest Floor First).",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP2-P1-V5",
          taskName: "Version 5: Dynamic Tiered Fee Structures",
          taskDescription: "Implement tiered hourly billing with vehicle type multipliers.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP2-P1-V6",
          taskName: "Version 6: Requirement Change — EV Charging Bays",
          taskDescription: "Introduce electric vehicles, charging stations, and dual energy/parking metering.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP2-P1-V7",
          taskName: "Version 7: Comprehensive Design Review & Invariant Audit",
          taskDescription: "Audit ticket immutability, gate coordination, and OCP compliance.",
          targetTimeMinutes: 30,
          difficulty: "medium"
        }
      ]
    },
    {
      taskId: "LLDP2-P2",
      taskName: "Problem 6 — Design an Automated Teller Machine (ATM)",
      difficulty: "medium",
      targetTime: "90 mins",
      taskPriority: "medium",
      taskDescription: `## Problem 6 — Design an Automated Teller Machine (ATM)

* **Difficulty:** Medium
* **Target Time:** 90 minutes
* **Category:** Hardware Workflow & Transaction Safety

---

### 1. Real-World Context
Design the core controller software for a bank ATM. The system manages card authentication, customer pin validation, account balance inquiry, cash dispensing from physical cassettes, and transactional rollbacks.

---

### 2. Functional Requirements
1. **User Authentication Flow:**
   * Insert card -> Enter PIN -> System validates with core banking service.
   * Lock card after 3 consecutive invalid PIN attempts.
2. **Supported Operations:**
   * Check Balance, Deposit Cash, Withdraw Cash.
3. **Cash Dispenser & Denomination Logic:**
   * Machine contains cassettes for $10, $20, $50, and $100 notes.
   * When withdrawing, dispense optimal combination of notes.
   * If requested amount cannot be formed using available notes, reject transaction before debiting account.
4. **Hardware Failure Rollback:**
   * If cash jams during dispensing, the debit transaction must be rolled back.

---

### 3. Progressive Evolving Versions (Subtask Checklist)
* **Version 1 (Card & PIN Flow):** Card insertion, PIN validation, balance inquiry.
* **Version 2 (State-Driven User Lifecycle):** Formalize ATM states (\`Idle\`, \`HasCard\`, \`Authenticated\`, \`Dispensing\`).
* **Version 3 (Cash Cassettes & Dispensing Algorithm):** Multi-denomination cash inventory and greedy note dispensing.
* **Version 4 (Requirement Change — Transaction Rollback & Audit):** Handle dispensing hardware faults and audit logging.
* **Version 5 (Design Review):** Audit state transitions and financial rollback invariants.`,
      versions: [
        {
          taskId: "LLDP2-P2-V1",
          taskName: "Version 1: Card & PIN Flow",
          taskDescription: "Card insertion, PIN validation, and balance inquiry.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        },
        {
          taskId: "LLDP2-P2-V2",
          taskName: "Version 2: State-Driven User Lifecycle",
          taskDescription: "Implement state lifecycle preventing illegal sequence of operations.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP2-P2-V3",
          taskName: "Version 3: Cash Cassettes & Dispensing Algorithm",
          taskDescription: "Build multi-denomination cash inventory and note combination algorithm.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP2-P2-V4",
          taskName: "Version 4: Requirement Change — Transaction Rollback & Audit",
          taskDescription: "Implement compensating transaction rollback upon hardware fault.",
          targetTimeMinutes: 30,
          difficulty: "medium"
        },
        {
          taskId: "LLDP2-P2-V5",
          taskName: "Version 5: Design Review & Invariant Audit",
          taskDescription: "Audit security boundaries, PIN handling, and transaction safety.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        }
      ]
    },
    {
      taskId: "LLDP2-P3",
      taskName: "Problem 7 — Design a Car Rental System",
      difficulty: "medium",
      targetTime: "90 mins",
      taskPriority: "medium",
      taskDescription: `## Problem 7 — Design a Car Rental System

* **Difficulty:** Medium
* **Target Time:** 90 minutes
* **Category:** Fleet Inventory & Temporal Reservations

---

### 1. Real-World Context
Design an enterprise vehicle rental platform (such as Hertz or Avis). The platform manages fleets across multiple store locations, handles time-window reservations, supports dynamic vehicle add-ons (GPS, child seats), and processes returns with damage inspections and overdue penalties.

---

### 2. Functional Requirements
1. **Fleet & Store Multiplicity:**
   * Vehicle categories: Compact, SUV, Luxury, Van.
   * Multiple physical store branches where vehicles can be picked up and returned.
2. **Temporal Reservation Engine:**
   * Search available vehicles by category, location, and date-time window $[t_{start}, t_{end}]$.
   * Reserve a vehicle with automated confirmation.
3. **Add-on Services & Pricing:**
   * Daily base rate per vehicle type.
   * Add-ons: GPS navigation, Child seat, Additional driver, Full insurance.
4. **Return & Overdue Penalty Engine:**
   * Inspect vehicle on return (fuel level, damage).
   * Calculate late return penalties if returned past reservation window.

---

### 3. Progressive Evolving Versions (Subtask Checklist)
* **Version 1 (Fleet Catalog & Basic Reservation):** Vehicles, locations, single-day rental checkout.
* **Version 2 (Temporal Conflict Resolution):** Validate overlapping date ranges to prevent double-booking.
* **Version 3 (Add-on Services & Dynamic Decorators):** Pluggable add-on pricing (insurance, GPS, child seats).
* **Version 4 (Requirement Change — One-Way Rentals & Penalties):** Support dropping off at a different store location with inter-branch transfer fees.
* **Version 5 (Design Review):** Audit date calculation invariants and pricing composition.`,
      versions: [
        {
          taskId: "LLDP2-P3-V1",
          taskName: "Version 1: Fleet Catalog & Basic Reservation",
          taskDescription: "Model vehicles, branches, and single-day checkout.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        },
        {
          taskId: "LLDP2-P3-V2",
          taskName: "Version 2: Temporal Conflict Resolution",
          taskDescription: "Implement date-range overlap validation preventing double-booking.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP2-P3-V3",
          taskName: "Version 3: Add-on Services & Dynamic Pricing",
          taskDescription: "Model pluggable rental add-ons with cumulative daily rates.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        },
        {
          taskId: "LLDP2-P3-V4",
          taskName: "Version 4: Requirement Change — One-Way Rentals & Penalties",
          taskDescription: "Handle different drop-off locations and late return penalties.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP2-P3-V5",
          taskName: "Version 5: Design Review & Invariant Audit",
          taskDescription: "Audit reservation lifecycle, vehicle status transitions, and rate calculations.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        }
      ]
    }
  ]
};

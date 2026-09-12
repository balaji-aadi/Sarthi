# Sarthi LLD Curriculum: Full Parent-Child, Notes & System Audit

**Audit Date**: 2026-09-05T09:23:31.717Z  
**Scope**: All 5 Phases (Modules, Units, Drills, Problems, Versions, and DSA Baseline)  
**Database Connection**: MongoDB Atlas Verified  

---

## 1. Executive Summary & Freeze Verification

| Metric | Target / Frozen | Audited in DB | Status |
| :--- | :---: | :---: | :---: |
| **Total LLD Records** | **202** | **202** |  MATCH / FROZEN |
| **DSA Baseline Tasks** | **458** | **458** |  UNTOUCHED |
| **Modules (Parent Root)** | **17** | **17** |  PASS |
| **Learning Units (Teaching Nodes)** | **43** | **43** |  PASS |
| **Practical Drills (Practice Nodes)** | **48** | **48** |  PASS |
| **Major Problems (System Root)** | **15** | **15** |  PASS |
| **Problem Versions (Evolving Specs)** | **79** | **79** |  PASS |
| **Units with Concept Notes** | **43** | **43** |  100% COVERAGE |
| **Units with C++ Snippets** | **43** | **43** |  100% COVERAGE |
| **Parent-Child Integrity** | **170 links** | **170 valid / 0 broken** |  100% VALID |

---

## 2. Global Pedagogical Structure & Architecture

Each phase strictly implements the 3-layer architecture:
```
Parent Module / System Root
  │
  ├── Learning Unit (Teaching Node)
  │     └── 💡 Concept Notes & Theory Layer (What is it? Why does it matter?)
  │     └── 💻 Tiny C++ Example (Monospace code block with copy action)
  │     └── 👁️ What to Observe & Notice
  │     └── 🎯 Direct link to Practice Drill
  │
  ├── Practical Drill (Practice Node)
  │     └── 💡 Auto-Embedded Theory Layer from Parent Unit
  │     └── 🎯 Concrete Problem Statement
  │     └── 🧭 Scenario & Starting Point C++ Boilerplate
  │     └── 🛠️ Step-by-Step Task & Acceptance Criteria
  │
  └── Major Problems & Evolving Versions
        └── 15 LeetCode-grade multi-version system design challenges (V1 to V5/V6)
        └── Safe prerequisites & version context
```

---

## 3.1 Phase 1: Object & C++ Foundations

**Phase Summary**: 4 Modules · 8 Units · 9 Drills · 4 Major Problems · 17 Versions (42 Total Records)

### Modules & Learning Units Breakdown

#### 📦 LLDP1-M1: Module 1.1: How C++ Creates, Holds, and Destroys Objects

| Unit ID | Learning Unit Title | Concept Notes Topic | Theory & C++ | Child Drills | Drill Level/Time | Parent Link |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **LLDP1-U1.1.1** | Unit 1.1.1: What Happens to an Object When We Leave the Block Where It Was Created? | **Object Lifetime & Resource Management** |  (Notes + C++) | `LLDP1-D1.1.1` Stack vs Heap Lifetime Drill | A · 15m · easy |  Valid |
| **LLDP1-U1.1.2** | Unit 1.1.2: Sharing an Object vs Making a Copy | **Pointers, References, and the this Pointer** |  (Notes + C++) | `LLDP1-D1.1.2` Object Ownership & Safe Borrowing Refactor | A · 15m · easy |  Valid |
| **LLDP1-U1.1.3** | Unit 1.1.3: When One Variable Can Represent Different Types | **Abstraction, Inheritance & Polymorphism** |  (Notes + C++) | `LLDP1-D1.1.3` When One Pointer Can Represent Different Types Drill | A · 15m · easy |  Valid |

#### 📦 LLDP1-M2: Module 1.2: Protecting an Object’s Internal Data

| Unit ID | Learning Unit Title | Concept Notes Topic | Theory & C++ | Child Drills | Drill Level/Time | Parent Link |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **LLDP1-U1.2.1** | Unit 1.2.1: Why Making Variables Public Causes Hidden Bugs | **Encapsulation and Invariants** |  (Notes + C++) | `LLDP1-D1.2.1` Defending Shopping Cart Invariants Drill | B · 30m · medium |  Valid |
| **LLDP1-U1.2.2** | Unit 1.2.2: When Data Should Never Change Once Created | **Value Objects and Immutability** |  (Notes + C++) | `LLDP1-D1.2.2` Building an Immutable Money Value Object Drill | A · 15m · easy |  Valid |

#### 📦 LLDP1-M3: Module 1.3: Connecting Objects Together

| Unit ID | Learning Unit Title | Concept Notes Topic | Theory & C++ | Child Drills | Drill Level/Time | Parent Link |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **LLDP1-U1.3.1** | Unit 1.3.1: Who Owns This Object, and How Many Objects Can Exist? | **Relationships: Composition, Aggregation, Association & Dependency** |  (Notes + C++) | `LLDP1-D1.3.1` University Course Enrollment Ownership Model | A · 15m · easy |  Valid |
| **LLDP1-U1.3.2** | Unit 1.3.2: Why Combining Small Objects Is Better Than Long Inheritance Chains | **Composition Over Inheritance** |  (Notes + C++) | `LLDP1-D1.3.2` Dismantling Inheritance Class Explosion Drill<br>`LLDP1-D1.3.3` Fixing Broken Subclass Assumptions Drill | B · 30m · medium<br>B · 20m · medium |  Valid |

#### 📦 LLDP1-M4: Module 1.4: From English Requirements to Working Classes

| Unit ID | Learning Unit Title | Concept Notes Topic | Theory & C++ | Child Drills | Drill Level/Time | Parent Link |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **LLDP1-U1.4.1** | Unit 1.4.1: Turning a Real-World Story into Code | **OOAD Responsibility Assignment and Noun-Verb Analysis** |  (Notes + C++) | `LLDP1-D1.4.1` Digital Wallet Domain Model & Responsibility Breakdown | B · 35m · medium |  Valid |

### Major Problems & Evolving Versions Breakdown

#### 🏛️ LLDP1-P1: Problem 1 — Design a Vending Machine (5 Versions)

| Version ID | Version Title | Target Time | Context Header | Requirements Header | Parent Link |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **LLDP1-P1-V1** | Version 1: Baseline In-Memory Dispense | 30 min | Version Context | Requirements |  Valid |
| **LLDP1-P1-V2** | Version 2: Multi-Item Catalog & State Management | 45 min | What Changed | What Is New |  Valid |
| **LLDP1-P1-V3** | Version 3: Cash Float & Exact Change Algorithm | 45 min | What Changed | What Is New |  Valid |
| **LLDP1-P1-V4** | Version 4: Requirement Change — Card Payments & Discounts | 45 min | What Changed | What Is New |  Valid |
| **LLDP1-P1-V5** | Version 5: Architectural Review & Invariant Audit | 30 min | What Changed | What Is New |  Valid |

#### 🏛️ LLDP1-P2: Problem 2 — Design Tic Tac Toe (4 Versions)

| Version ID | Version Title | Target Time | Context Header | Requirements Header | Parent Link |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **LLDP1-P2-V1** | Version 1: Classic 3x3 Grid Engine | 30 min | Version Context | Requirements |  Valid |
| **LLDP1-P2-V2** | Version 2: N x N Scaling & O(1) Win Checking | 45 min | What Changed | What Is New |  Valid |
| **LLDP1-P2-V3** | Version 3: Requirement Change — Move History & Undo | 30 min | What Changed | What Is New |  Valid |
| **LLDP1-P2-V4** | Version 4: Design Review & Invariant Audit | 30 min | What Changed | What Is New |  Valid |

#### 🏛️ LLDP1-P3: Problem 3 — Design a Coffee Maker (4 Versions)

| Version ID | Version Title | Target Time | Context Header | Requirements Header | Parent Link |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **LLDP1-P3-V1** | Version 1: Fixed Recipes & Inventory Tracking | 30 min | Version Context | Requirements |  Valid |
| **LLDP1-P3-V2** | Version 2: Dynamic Recipe Customization | 30 min | What Changed | What Is New |  Valid |
| **LLDP1-P3-V3** | Version 3: Requirement Change — Tea & Specialty Drinks | 30 min | What Changed | What Is New |  Valid |
| **LLDP1-P3-V4** | Version 4: Design Review & Invariant Audit | 30 min | What Changed | What Is New |  Valid |

#### 🏛️ LLDP1-P4: Problem 4 — Design a Library Management System (4 Versions)

| Version ID | Version Title | Target Time | Context Header | Requirements Header | Parent Link |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **LLDP1-P4-V1** | Version 1: Catalog & Physical Copy Multiplicity | 30 min | Version Context | Requirements |  Valid |
| **LLDP1-P4-V2** | Version 2: Borrowing Policies & FIFO Reservation Queue | 45 min | What Changed | What Is New |  Valid |
| **LLDP1-P4-V3** | Version 3: Overdue Fine Engine & Member Suspension | 30 min | What Changed | What Is New |  Valid |
| **LLDP1-P4-V4** | Version 4: Design Review & Invariant Audit | 30 min | What Changed | What Is New |  Valid |

---

## 3.2 Phase 2: SOLID Principles & Pragmatic Architecture

**Phase Summary**: 4 Modules · 6 Units · 10 Drills · 3 Major Problems · 17 Versions (40 Total Records)

### Modules & Learning Units Breakdown

#### 📦 LLDP2-M1: Module 2.1: Spotting Messy Code & Giving Classes One Job

| Unit ID | Learning Unit Title | Concept Notes Topic | Theory & C++ | Child Drills | Drill Level/Time | Parent Link |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **LLDP2-U2.1.1** | Unit 2.1.1: What Happens When One Class Tries to Do Everything? | **Single Responsibility Principle (SRP)** |  (Notes + C++) | `LLDP2-D2.1.1` Dismantling the God Class UserManager | B · 30m · medium |  Valid |
| **LLDP2-U2.1.2** | Unit 2.1.2: Forcing Classes to Implement Methods They Do Not Need | **Interface Segregation Principle (ISP)** |  (Notes + C++) | `LLDP2-D2.1.2` Segregating Bloated CloudStorageProvider | A · 15m · easy |  Valid |

#### 📦 LLDP2-M2: Module 2.2: Adding New Features Without Breaking Old Code

| Unit ID | Learning Unit Title | Concept Notes Topic | Theory & C++ | Child Drills | Drill Level/Time | Parent Link |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **LLDP2-U2.2.1** | Unit 2.2.1: What Happens When Every New Option Forces Us to Edit the Same Big If/Else? | **Open/Closed Principle (OCP)** |  (Notes + C++) | `LLDP2-D2.2.1` Replacing Type-Code Switch with Polymorphic Strategy | B · 25m · medium |  Valid |
| **LLDP2-U2.2.2** | Unit 2.2.2: When a Child Class Breaks the Promises Made by Its Parent | **Liskov Substitution Principle (LSP)** |  (Notes + C++) | `LLDP2-D2.2.2` Spotting Liskov Substitution Violations | A · 15m · easy |  Valid |

#### 📦 LLDP2-M3: Module 2.3: Decoupling Classes with Interfaces and Injection

| Unit ID | Learning Unit Title | Concept Notes Topic | Theory & C++ | Child Drills | Drill Level/Time | Parent Link |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **LLDP2-U2.3.1** | Unit 2.3.1: How Do We Stop One Class From Creating Everything It Needs? | **Dependency Inversion Principle (DIP)** |  (Notes + C++) | `LLDP2-D2.3.1` Manual Constructor Injection & Fake Ports | B · 30m · medium |  Valid |

#### 📦 LLDP2-M4: Module 2.4: Trade-offs & Defending Your Design in Interviews

| Unit ID | Learning Unit Title | Concept Notes Topic | Theory & C++ | Child Drills | Drill Level/Time | Parent Link |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **LLDP2-U2.4.1** | Unit 2.4.1: When Is a Simple Design Better Than 10 Abstractions? | **Code Smells, YAGNI, and Pragmatic Architecture** |  (Notes + C++) | `LLDP2-D2.4.1` Inheritance vs Composition Trade-offs<br>`LLDP2-D2.4.2` Switch vs Polymorphism: Defining the Threshold<br>`LLDP2-D2.4.3` Concrete Class vs Abstract Class vs Interface<br>`LLDP2-D2.4.4` YAGNI & Over-Engineering Audit<br>`LLDP2-D2.4.5` Predicting OCP Failures in Notification Engine | B · 20m · medium<br>A · 15m · easy<br>A · 15m · easy<br>B · 25m · medium<br>B · 20m · medium |  Valid |

### Major Problems & Evolving Versions Breakdown

#### 🏛️ LLDP2-P1: Problem 5 — Design a Multi-Floor Parking Lot (7 Versions)

| Version ID | Version Title | Target Time | Context Header | Requirements Header | Parent Link |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **LLDP2-P1-V1** | Version 1: Single Floor Baseline | 30 min | Version Context | Requirements |  Valid |
| **LLDP2-P1-V2** | Version 2: Vehicle & Spot Multiplicity | 45 min | What Changed | What Is New |  Valid |
| **LLDP2-P1-V3** | Version 3: Multi-Floor Topology & Displays | 45 min | What Changed | What Is New |  Valid |
| **LLDP2-P1-V4** | Version 4: Pluggable Spot Allocation Strategies | 45 min | What Changed | What Is New |  Valid |
| **LLDP2-P1-V5** | Version 5: Dynamic Tiered Fee Structures | 45 min | What Changed | What Is New |  Valid |
| **LLDP2-P1-V6** | Version 6: Requirement Change — EV Charging Bays | 45 min | What Changed | What Is New |  Valid |
| **LLDP2-P1-V7** | Version 7: Comprehensive Design Review & Invariant Audit | 30 min | What Changed | What Is New |  Valid |

#### 🏛️ LLDP2-P2: Problem 6 — Design an Automated Teller Machine (ATM) (5 Versions)

| Version ID | Version Title | Target Time | Context Header | Requirements Header | Parent Link |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **LLDP2-P2-V1** | Version 1: Card & PIN Flow | 30 min | Version Context | Requirements |  Valid |
| **LLDP2-P2-V2** | Version 2: State-Driven User Lifecycle | 45 min | What Changed | What Is New |  Valid |
| **LLDP2-P2-V3** | Version 3: Cash Cassettes & Dispensing Algorithm | 45 min | What Changed | What Is New |  Valid |
| **LLDP2-P2-V4** | Version 4: Requirement Change — Transaction Rollback & Audit | 30 min | What Changed | What Is New |  Valid |
| **LLDP2-P2-V5** | Version 5: Design Review & Invariant Audit | 30 min | What Changed | What Is New |  Valid |

#### 🏛️ LLDP2-P3: Problem 7 — Design a Car Rental System (5 Versions)

| Version ID | Version Title | Target Time | Context Header | Requirements Header | Parent Link |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **LLDP2-P3-V1** | Version 1: Fleet Catalog & Basic Reservation | 30 min | Version Context | Requirements |  Valid |
| **LLDP2-P3-V2** | Version 2: Temporal Conflict Resolution | 45 min | What Changed | What Is New |  Valid |
| **LLDP2-P3-V3** | Version 3: Add-on Services & Dynamic Pricing | 30 min | What Changed | What Is New |  Valid |
| **LLDP2-P3-V4** | Version 4: Requirement Change — One-Way Rentals & Penalties | 45 min | What Changed | What Is New |  Valid |
| **LLDP2-P3-V5** | Version 5: Design Review & Invariant Audit | 30 min | What Changed | What Is New |  Valid |

---

## 3.3 Phase 3: Design Patterns by Discovery (Zero-Spoiler)

**Phase Summary**: 4 Modules · 14 Units · 14 Drills · 4 Major Problems · 21 Versions (57 Total Records)

### Modules & Learning Units Breakdown

#### 📦 LLDP3-M1: Module 3.1: Discovering How Objects Communicate and React

| Unit ID | Learning Unit Title | Concept Notes Topic | Theory & C++ | Child Drills | Drill Level/Time | Parent Link |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **LLDP3-U3.1.1** | Unit 3.1.1: What Happens When Our Calculation Rules Keep Changing? | **Interchangeable Algorithms via Pluggable Contracts** |  (Notes + C++) | `LLDP3-D3.1.1` Dynamic Shipping Cost Engine Refactor | B · 30m · medium |  Valid |
| **LLDP3-U3.1.2** | Unit 3.1.2: How Can Multiple Services React to an Event Without Calling Each Other Directly? | **Decoupled Event Broadcasting and Subscriber Lists** |  (Notes + C++) | `LLDP3-D3.1.2` Decoupled Order Event Broker | B · 30m · medium |  Valid |
| **LLDP3-U3.1.3** | Unit 3.1.3: What Happens When an Object Behaves Differently Depending on Its Status? | **State-Driven Behavior and Encapsulated Transitions** |  (Notes + C++) | `LLDP3-D3.1.3` Document Workflow Lifecycle State Machine | B · 30m · medium |  Valid |
| **LLDP3-U3.1.4** | Unit 3.1.4: How Do We Record, Queue, and Undo Actions? | **Reversible Actions, Queuing, and Request Encapsulation** |  (Notes + C++) | `LLDP3-D3.1.4` Transactional Undo/Redo Text Buffer Engine | B · 30m · medium |  Valid |
| **LLDP3-U3.1.5** | Unit 3.1.5: How Do We Pass a Request Through a Series of Checks? | **Sequential Validation and Handler Pipelines** |  (Notes + C++) | `LLDP3-D3.1.5` Extensible Request Filter Pipeline | B · 25m · medium |  Valid |

#### 📦 LLDP3-M2: Module 3.2: Discovering How Objects Are Built and Connected

| Unit ID | Learning Unit Title | Concept Notes Topic | Theory & C++ | Child Drills | Drill Level/Time | Parent Link |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **LLDP3-U3.2.1** | Unit 3.2.1: How Do We Create Objects When Constructors Are Too Complicated? | **Decoupled Object Instantiation and Construction Encapsulation** |  (Notes + C++) | `LLDP3-D3.2.1` Document Exporter Factory & HTTP Config Builder | B · 35m · medium |  Valid |
| **LLDP3-U3.2.2** | Unit 3.2.2: Adding Features to an Object at Runtime & Bridging Incompatible Classes | **Dynamic Behavior Stacking and Interface Adaptation** |  (Notes + C++) | `LLDP3-D3.2.2` Dynamic Beverage Addons & Legacy Payment Bridge | B · 35m · medium |  Valid |
| **LLDP3-U3.2.3** | Unit 3.2.3: Treating Single Items and Groups of Items Exactly the Same | **Uniform Hierarchies and Tree Structures** |  (Notes + C++) | `LLDP3-D3.2.3` In-Memory FileSystem Tree Hierarchy | B · 30m · medium |  Valid |

#### 📦 LLDP3-M3: Module 3.3: Understanding More Specialized Object Structures

| Unit ID | Learning Unit Title | Concept Notes Topic | Theory & C++ | Child Drills | Drill Level/Time | Parent Link |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **LLDP3-U3.3.1** | Unit 3.3.1: Controlling Access, Hiding Complexity & Standardizing Algorithms | **Controlled Access, Facades, and Template Methods** |  (Notes + C++) | `LLDP3-D3.3.1` Proxy, Facade & Template Method Implementation Drill | B · 35m · medium |  Valid |
| **LLDP3-U3.3.2** | Unit 3.3.2: Why Global Singletons Cause Hidden Problems | **Single-Instance Management, Hazards & Controlled Sharing** |  (Notes + C++) | `LLDP3-D3.3.2` Singleton Antipattern & Thread Safety Refactor | B · 25m · medium |  Valid |
| **LLDP3-U3.3.3** | Unit 3.3.3: Specialized Designs: Sharing Identical Data & Centralizing Dialogs | **Resource Sharing via Flyweights & Centralized Mediation** |  (Notes + C++) | `LLDP3-D3.3.3` Specialized GoF Patterns Comparison Drill | B · 25m · medium |  Valid |

#### 📦 LLDP3-M4: Module 3.4: Choosing the Right Design When Patterns Look Similar

| Unit ID | Learning Unit Title | Concept Notes Topic | Theory & C++ | Child Drills | Drill Level/Time | Parent Link |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **LLDP3-U3.4.1** | Unit 3.4.1: Strategy vs State: Spotting the Difference | **Strategy vs State: Spotting the Key Architectural Differences** |  (Notes + C++) | `LLDP3-D3.4.1` Strategy vs State Discrimination Decision Drill | A · 15m · easy |  Valid |
| **LLDP3-U3.4.2** | Unit 3.4.2: Decorator vs Adapter vs Proxy: Choosing the Right Wrapper | **Decorator vs Adapter vs Proxy: Choosing the Right Wrapper** |  (Notes + C++) | `LLDP3-D3.4.2` Decorator vs Adapter vs Proxy Decision Drill | A · 15m · easy |  Valid |
| **LLDP3-U3.4.3** | Unit 3.4.3: Predicting Which Pattern Will Emerge as Requirements Grow | **Predicting Pattern Emergence as Requirements Evolve** |  (Notes + C++) | `LLDP3-D3.4.3` E-Commerce Architecture Pattern Prediction Exercise | B · 20m · medium |  Valid |

### Major Problems & Evolving Versions Breakdown

#### 🏛️ LLDP3-P1: Problem 8 — Design an Elevator Control System (6 Versions)

| Version ID | Version Title | Target Time | Context Header | Requirements Header | Parent Link |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **LLDP3-P1-V1** | Version 1: Single Car Baseline | 30 min | Version Context | Requirements |  Valid |
| **LLDP3-P1-V2** | Version 2: LOOK & SCAN Scheduling Algorithms | 45 min | What Changed | What Is New |  Valid |
| **LLDP3-P1-V3** | Version 3: Multi-Car Bank Controller | 45 min | What Changed | What Is New |  Valid |
| **LLDP3-P1-V4** | Version 4: Door Obstruction & Weight Invariants | 30 min | What Changed | What Is New |  Valid |
| **LLDP3-P1-V5** | Version 5: Requirement Change — VIP & Maintenance Modes | 45 min | What Changed | What Is New |  Valid |
| **LLDP3-P1-V6** | Version 6: Design Review & Invariant Audit | 30 min | What Changed | What Is New |  Valid |

#### 🏛️ LLDP3-P2: Problem 9 — Design Splitwise (6 Versions)

| Version ID | Version Title | Target Time | Context Header | Requirements Header | Parent Link |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **LLDP3-P2-V1** | Version 1: User & Group Foundation | 30 min | Version Context | Requirements |  Valid |
| **LLDP3-P2-V2** | Version 2: Pluggable Split Strategies | 45 min | What Changed | What Is New |  Valid |
| **LLDP3-P2-V3** | Version 3: Rounding & Currency Invariants | 30 min | What Changed | What Is New |  Valid |
| **LLDP3-P2-V4** | Version 4: Debt Simplification Graph Algorithm | 45 min | What Changed | What Is New |  Valid |
| **LLDP3-P2-V5** | Version 5: Requirement Change — Multi-Currency & Activity Feed | 45 min | What Changed | What Is New |  Valid |
| **LLDP3-P2-V6** | Version 6: Design Review & Invariant Audit | 30 min | What Changed | What Is New |  Valid |

#### 🏛️ LLDP3-P3: Problem 10 — Design Snake & Ladder (4 Versions)

| Version ID | Version Title | Target Time | Context Header | Requirements Header | Parent Link |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **LLDP3-P10-V1** | Version 1: Classic Board & Movement | 30 min | Version Context | Requirements |  Valid |
| **LLDP3-P10-V2** | Version 2: Extensible Jump Entities | 30 min | What Changed | What Is New |  Valid |
| **LLDP3-P10-V3** | Version 3: Requirement Change — Multiple Dice & Turn Rules | 30 min | What Changed | What Is New |  Valid |
| **LLDP3-P10-V4** | Version 4: Design Review & Invariant Audit | 30 min | What Changed | What Is New |  Valid |

#### 🏛️ LLDP3-P4: Problem 11 — Design a Multi-Channel Notification Engine (5 Versions)

| Version ID | Version Title | Target Time | Context Header | Requirements Header | Parent Link |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **LLDP3-P11-V1** | Version 1: Basic Multi-Channel Dispatch | 30 min | Version Context | Requirements |  Valid |
| **LLDP3-P11-V2** | Version 2: Template & Formatting Decorators | 45 min | What Changed | What Is New |  Valid |
| **LLDP3-P11-V3** | Version 3: Rate Limiting & Filter Pipeline | 45 min | What Changed | What Is New |  Valid |
| **LLDP3-P11-V4** | Version 4: Requirement Change — Provider Failover & Retry | 45 min | What Changed | What Is New |  Valid |
| **LLDP3-P11-V5** | Version 5: Design Review & Invariant Audit | 30 min | What Changed | What Is New |  Valid |

---

## 3.4 Phase 4: Concurrency & Real-World System Mechanics

**Phase Summary**: 1 Modules · 2 Units · 2 Drills · 4 Major Problems · 24 Versions (33 Total Records)

### Modules & Learning Units Breakdown

#### 📦 LLDP4-M1: Module 4.1: Handling Multiple Users at Once (Concurrency)

| Unit ID | Learning Unit Title | Concept Notes Topic | Theory & C++ | Child Drills | Drill Level/Time | Parent Link |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **LLDP4-U4.1.1** | Unit 4.1.1: What Happens When Two People Buy the Last Seat at the Same Second? | **Race Conditions, Mutexes, and Thread Safety** |  (Notes + C++) | `LLDP4-D4.1.1` Thread-Safe Bounded Queue Implementation Drill | B · 30m · medium |  Valid |
| **LLDP4-U4.1.2** | Unit 4.1.2: Holding a Seat for 10 Minutes While the User Pays | **Resource Leases, Time-outs, and Compensating Rollbacks** |  (Notes + C++) | `LLDP4-D4.1.2` Expiring Lock Manager with Compensating Release | B · 35m · hard |  Valid |

### Major Problems & Evolving Versions Breakdown

#### 🏛️ LLDP4-P1: Problem 12 — Design BookMyShow (Movie Booking & Seat Locking) (7 Versions)

| Version ID | Version Title | Target Time | Context Header | Requirements Header | Parent Link |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **LLDP4-P1-V1** | Version 1: Cinema Topology & Catalog Hierarchy | 30 min | Version Context | Requirements |  Valid |
| **LLDP4-P1-V2** | Version 2: Temporary Seat Locking Mechanism | 45 min | What Changed | What Is New |  Valid |
| **LLDP4-P1-V3** | Version 3: Payment Integration & Booking Confirmation | 30 min | What Changed | What Is New |  Valid |
| **LLDP4-P1-V4** | Version 4: Timeout Compensation Engine | 45 min | What Changed | What Is New |  Valid |
| **LLDP4-P1-V5** | Version 5: Dynamic Occupancy-Based Pricing | 30 min | What Changed | What Is New |  Valid |
| **LLDP4-P1-V6** | Version 6: Concurrent Stress Testing Suite | 45 min | What Changed | What Is New |  Valid |
| **LLDP4-P1-V7** | Version 7: Comprehensive Design Review & Invariant Audit | 30 min | What Changed | What Is New |  Valid |

#### 🏛️ LLDP4-P2: Problem 13 — Design a Ride-Sharing Dispatch Platform (Cab Booking) (6 Versions)

| Version ID | Version Title | Target Time | Context Header | Requirements Header | Parent Link |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **LLDP4-P2-V1** | Version 1: Spatial Domain & Matching | 30 min | Version Context | Requirements |  Valid |
| **LLDP4-P2-V2** | Version 2: Trip State Machine Lifecycle | 45 min | What Changed | What Is New |  Valid |
| **LLDP4-P2-V3** | Version 3: Dynamic Fare & Surge Pricing | 30 min | What Changed | What Is New |  Valid |
| **LLDP4-P2-V4** | Version 4: Driver Acceptance Timeout & Cascading | 45 min | What Changed | What Is New |  Valid |
| **LLDP4-P2-V5** | Version 5: Requirement Change — Shared Pool Rides | 45 min | What Changed | What Is New |  Valid |
| **LLDP4-P2-V6** | Version 6: Design Review & Invariant Audit | 30 min | What Changed | What Is New |  Valid |

#### 🏛️ LLDP4-P3: Problem 14 — Design a Chess Game Engine (5 Versions)

| Version ID | Version Title | Target Time | Context Header | Requirements Header | Parent Link |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **LLDP4-P3-V1** | Version 1: Board & Basic Piece Movements | 30 min | Version Context | Requirements |  Valid |
| **LLDP4-P3-V2** | Version 2: Path Obstruction & Capture Rules | 45 min | What Changed | What Is New |  Valid |
| **LLDP4-P3-V3** | Version 3: Special Moves (Castling, En Passant, Promotion) | 45 min | What Changed | What Is New |  Valid |
| **LLDP4-P3-V4** | Version 4: Check & Checkmate Detection | 45 min | What Changed | What Is New |  Valid |
| **LLDP4-P3-V5** | Version 5: Design Review & Invariant Audit | 30 min | What Changed | What Is New |  Valid |

#### 🏛️ LLDP4-P4: Problem 15 — Design a Food Ordering & Delivery Platform (6 Versions)

| Version ID | Version Title | Target Time | Context Header | Requirements Header | Parent Link |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **LLDP4-P4-V1** | Version 1: Catalog & Cart Foundation | 30 min | Version Context | Requirements |  Valid |
| **LLDP4-P4-V2** | Version 2: Order Lifecycle State Machine | 45 min | What Changed | What Is New |  Valid |
| **LLDP4-P4-V3** | Version 3: Courier Assignment & Matchmaking | 45 min | What Changed | What Is New |  Valid |
| **LLDP4-P4-V4** | Version 4: Promotional Engine & Dynamic Fees | 30 min | What Changed | What Is New |  Valid |
| **LLDP4-P4-V5** | Version 5: Real-time Event Notifications | 45 min | What Changed | What Is New |  Valid |
| **LLDP4-P4-V6** | Version 6: Design Review & Invariant Audit | 30 min | What Changed | What Is New |  Valid |

---

## 3.5 Phase 5: Interview Excellence & Live System Design

**Phase Summary**: 4 Modules · 13 Units · 13 Drills · 0 Major Problems · 0 Versions (30 Total Records)

### Modules & Learning Units Breakdown

#### 📦 LLDP5-M1: Module 5.1: The 45-Minute Interview Strategy

| Unit ID | Learning Unit Title | Concept Notes Topic | Theory & C++ | Child Drills | Drill Level/Time | Parent Link |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **LLDP5-U5.1.1** | Unit 5.1.1: What Questions to Ask in the First 5 Minutes | **The First 5 Minutes: Scoping, Assumptions & Invariant Clarification** |  (Notes + C++) | `LLDP5-D5.1.1` 5-Minute Scoping & Ambiguity Elimination Drill | A · 15m · easy |  Valid |
| **LLDP5-U5.1.2** | Unit 5.1.2: Finding Classes and Method Names in 10 Minutes | **Domain Boundary Mapping and API Contract Definition** |  (Notes + C++) | `LLDP5-D5.1.2` Rapid Entity Extraction & Interface Definition Exercise | B · 25m · medium |  Valid |
| **LLDP5-U5.1.3** | Unit 5.1.3: Writing Clean, Working Code in 20 Minutes | **20-Minute Working Implementation and Invariant Defense** |  (Notes + C++) | `LLDP5-D5.1.3` Clean Production Coding Under 20-Minute Time Limits | B · 30m · medium |  Valid |
| **LLDP5-U5.1.4** | Unit 5.1.4: What to Do When the Interviewer Changes the Rules Mid-Way | **Handling Mid-Interview Requirement Pivots and Curveballs** |  (Notes + C++) | `LLDP5-D5.1.4` Live Requirement Pivot Defense Exercise | B · 20m · medium |  Valid |

#### 📦 LLDP5-M2: Module 5.2: Talking to Your Interviewer & Explaining Your Choices

| Unit ID | Learning Unit Title | Concept Notes Topic | Theory & C++ | Child Drills | Drill Level/Time | Parent Link |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **LLDP5-U5.2.1** | Unit 5.2.1: Defending Your Code When an Interviewer Says "Isn’t This Over-Engineered?" | **Defending Simplicity vs Over-Engineering in Interviews** |  (Notes + C++) | `LLDP5-D5.2.1` Justifying Abstraction Under Scrutiny Defense Drill | A · 15m · easy |  Valid |
| **LLDP5-U5.2.2** | Unit 5.2.2: Explaining Why Locks Slow Down Your Code | **Concurrency Bottlenecks and Lock Contention Defense** |  (Notes + C++) | `LLDP5-D5.2.2` Explaining Concurrency Bottlenecks & Lock Granularity | B · 20m · medium |  Valid |
| **LLDP5-U5.2.3** | Unit 5.2.3: Thinking Out Loud So the Interviewer Can Follow You | **Thinking Out Loud and Collaborative Trade-Off Communication** |  (Notes + C++) | `LLDP5-D5.2.3` Verbal Think-Aloud Modeling Exercise | B · 20m · medium |  Valid |

#### 📦 LLDP5-M3: Module 5.3: Timed Practice Sprints

| Unit ID | Learning Unit Title | Concept Notes Topic | Theory & C++ | Child Drills | Drill Level/Time | Parent Link |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **LLDP5-U5.3.1** | Unit 5.3.1: The 30-Minute Fast Scoping & Interface Sprint | **The 30-Minute Fast Scoping and Interface Sprint** |  (Notes + C++) | `LLDP5-D5.3.1` 30-Minute Fast Scoping & Interface Sprint | B · 30m · medium |  Valid |
| **LLDP5-U5.3.2** | Unit 5.3.2: The Standard 45-Minute Interview Sprint | **The Standard 45-Minute End-to-End Interview Sprint** |  (Notes + C++) | `LLDP5-D5.3.2` 45-Minute Standard Interview Sprint | B · 45m · medium |  Valid |
| **LLDP5-U5.3.3** | Unit 5.3.3: The 60-Minute Comprehensive System Sprint | **The 60-Minute Comprehensive Production Architecture Sprint** |  (Notes + C++) | `LLDP5-D5.3.3` 60-Minute Comprehensive System Sprint | C · 60m · hard |  Valid |

#### 📦 LLDP5-M4: Module 5.4: Full Mock Interview Simulations

| Unit ID | Learning Unit Title | Concept Notes Topic | Theory & C++ | Child Drills | Drill Level/Time | Parent Link |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **LLDP5-U5.4.1** | Unit 5.4.1: Foundation Tier System Mock Simulation | **Foundational System Mock Simulation** |  (Notes + C++) | `LLDP5-D5.4.1` Foundation Tier Full Mock Simulation | C · 60m · medium |  Valid |
| **LLDP5-U5.4.2** | Unit 5.4.2: Resource Allocation Mock with Curveball | **Resource Allocation Mock with Dynamic Curveball** |  (Notes + C++) | `LLDP5-D5.4.2` Intermediate Resource Allocation Mock with Curveball | C · 60m · hard |  Valid |
| **LLDP5-U5.4.3** | Unit 5.4.3: High-Concurrency System Mock Simulation | **High-Concurrency System Mock Simulation** |  (Notes + C++) | `LLDP5-D5.4.3` Advanced High-Concurrency System Mock Simulation | C · 60m · hard |  Valid |

### Major Problems & Evolving Versions Breakdown

---

## 4. Complete Verification Checklist

- [x] **Every Learning Unit has concise Concept Notes**: Verified 43/43 units contain structured notes.
- [x] **Fundamental concepts explicitly taught**:
  - *Classes & Objects, Stack/Heap, Destructors, Object Lifetime*: `LLDP1-U1.1.1`
  - *Pointers, References, and the `this` pointer*: `LLDP1-U1.1.2`
  - *Abstraction, Polymorphism, and Virtual Destructors*: `LLDP1-U1.1.3`
  - *Encapsulation & Invariants*: `LLDP1-U1.2.1`
  - *Value Objects & Immutability*: `LLDP1-U1.2.2`
  - *Composition, Aggregation, Association & Dependency*: `LLDP1-U1.3.1`
  - *Composition Over Inheritance*: `LLDP1-U1.3.2`
  - *OOAD Responsibility Assignment & Noun-Verb Analysis*: `LLDP1-U1.4.1`
  - *SOLID Principles (SRP, ISP, OCP, LSP, DIP)*: `LLDP2-U2.1.1` to `LLDP2-U2.3.1`
  - *Code Smells & YAGNI*: `LLDP2-U2.4.1`
  - *Design Patterns by Discovery (Zero-Spoiler)*: `LLDP3-U3.1.1` to `LLDP3-U3.4.3`
  - *Concurrency Fundamentals (Race conditions, Mutexes, Locks, Leases)*: `LLDP4-U4.1.1` & `U4.1.2`
  - *Interview Scoping, Defense, and Live Architecture*: `LLDP5-U5.1.1` to `LLDP5-U5.4.3`
- [x] **No tasks added or removed**: Exactly 202 LLD records and 458 DSA tasks.
- [x] **Zero Raw Markdown**: Fenced code parsed into native code blocks with copy action.
- [x] **Automatic Theory Injection**: When a learner opens any Drill, the parent Unit's Concept Notes are auto-embedded right at the top.
- [x] **Natural Sequential Board Sorting**: Units appear immediately before their corresponding drills on the dashboard.

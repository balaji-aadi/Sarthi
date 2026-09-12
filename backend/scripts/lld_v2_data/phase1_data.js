/**
 * Sarthi LLD Curriculum v2.1 — Phase 1 Data
 * Phase 1: Object-Oriented Domain Modeling & Practical OOAD
 * Hierarchy: Phase -> Module -> Learning Unit -> Practical Drill
 *            Phase -> Major Problem -> Problem Version
 */

export const phase1Data = {
  key: "LLDP1",
  name: "LLD Phase 1: Object-Oriented Domain Modeling & Practical OOAD",
  description: "Learn to think in objects, responsibilities, relationships, encapsulation, abstraction, and composition by modeling real systems.",
  modules: [
    {
      taskId: "LLDP1-M1",
      taskName: "Module 1.1: C++ Foundations for Low Level Design",
      taskDescription: "Understand language mechanics, memory semantics, runtime method dispatch, and object ownership strictly as needed for object-oriented system design.",
      taskPriority: "high",
      units: [
        {
          taskId: "LLDP1-U1.1.1",
          taskName: "Unit 1.1.1: Memory Semantics & Object Lifecycles",
          unitCode: "1.1.1",
          taskDescription: "Master the trade-offs between stack and heap allocation, method execution context via the this pointer, constructor initialization, and destructor cleanup.",
          conceptTopics: [
            "Stack vs Heap allocation in LLD",
            "The this pointer and execution context",
            "Constructors & Member Initialization Lists",
            "Destructor cleanup responsibilities",
            "RAII (Resource Acquisition Is Initialization)"
          ],
          targetTimeMinutes: 30,
          drills: [
            {
              taskId: "LLDP1-D1.1.1",
              taskName: "Stack vs Heap Allocation & Lifetime Drill",
              taskDescription: "Implement a resource-holding ConnectionPool class demonstrating stack vs heap instantiation and proper destructor cleanup.\n\n### Objective:\n1. Stack instantiation vs Heap instantiation with new.\n2. Proper lifecycle cleanup in destructor to prevent memory leaks.\n3. Preventing copy construction or assignment when a class owns exclusive system handles.\n\n### Acceptance Criteria:\n* Class allocates and cleans up its own buffer without leaking.\n* Destructor logs destruction sequence proving cleanup upon stack frame exit.",
              actionVerb: "BUILD",
              level: "A",
              levelName: "Concept Drill",
              targetTimeMinutes: 15,
              difficulty: "easy"
            }
          ]
        },
        {
          taskId: "LLDP1-U1.1.2",
          taskName: "Unit 1.1.2: Pointers, References & Object Ownership",
          unitCode: "1.1.2",
          taskDescription: "Learn value semantics vs reference semantics, passing conventions, object ownership boundaries, and preventing dangling references.",
          conceptTopics: [
            "Value vs Reference semantics (Vehicle& vs Vehicle*)",
            "Object ownership boundaries (Composition vs Aggregation)",
            "Const reference passing for read-only efficiency",
            "Dangling pointers and object lifecycle tracking"
          ],
          targetTimeMinutes: 30,
          drills: [
            {
              taskId: "LLDP1-D1.1.2",
              taskName: "Object Ownership & Reference Passing Refactor",
              taskDescription: "Given buggy code where a Car holds a raw pointer to an Engine created on the stack that goes out of scope, refactor the code to clearly enforce whether the Car owns the engine (Composition) or borrows it (Aggregation), passing by const reference where mutation is forbidden.",
              actionVerb: "REFACTOR",
              level: "A",
              levelName: "Concept Drill",
              targetTimeMinutes: 15,
              difficulty: "easy"
            }
          ]
        },
        {
          taskId: "LLDP1-U1.1.3",
          taskName: "Unit 1.1.3: Dynamic Polymorphism & VTable Mental Model",
          unitCode: "1.1.3",
          taskDescription: "Understand runtime method dispatch, pure virtual contracts, and why base class destructors must be declared virtual.",
          conceptTopics: [
            "Base pointer to derived object (Base* b = new Derived())",
            "VTable and VPtr runtime dispatch mechanism",
            "Pure virtual functions and Abstract Classes as strict contracts",
            "Virtual destructors and avoiding incomplete deletion memory leaks"
          ],
          targetTimeMinutes: 30,
          drills: [
            {
              taskId: "LLDP1-D1.1.3",
              taskName: "Dynamic Method Dispatch & Virtual Destructors",
              taskDescription: "Demonstrate runtime dispatch with a base contract pointer. Implement pure virtual function pay(int amount) = 0. Demonstrate the memory leak caused when the base class destructor is not virtual, then fix it with virtual ~PaymentMethod() = default.",
              actionVerb: "BUILD",
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
      taskId: "LLDP1-M2",
      taskName: "Module 1.2: Encapsulation, State Guards & Value Objects",
      taskDescription: "Learn why public setters and naked primitives corrupt business invariants, and how to build self-validating, immutable domain value objects.",
      taskPriority: "high",
      units: [
        {
          taskId: "LLDP1-U1.2.1",
          taskName: "Unit 1.2.1: State Encapsulation & Defending Invariants",
          unitCode: "1.2.1",
          taskDescription: "Defend class state boundaries against external mutation by eliminating naked getters/setters and returning unmodifiable views.",
          conceptTopics: [
            "Why public getters/setters violate encapsulation",
            "Defensive copying of internal collections",
            "Domain business methods vs property setters",
            "Invariant validation guards on mutation"
          ],
          targetTimeMinutes: 30,
          drills: [
            {
              taskId: "LLDP1-D1.2.1",
              taskName: "Defending State Invariants in Shopping Cart",
              taskDescription: "A ShoppingCart exposes getItems() returning a raw mutable list. External calling code bypasses validation by clearing the list directly or pushing negative price items. Encapsulate all cart mutations behind business methods (addItem, removeItem, applyCoupon) and return unmodifiable collection views.",
              actionVerb: "REFACTOR",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 30,
              difficulty: "medium"
            }
          ]
        },
        {
          taskId: "LLDP1-U1.2.2",
          taskName: "Unit 1.2.2: Immutable Domain Value Objects",
          unitCode: "1.2.2",
          taskDescription: "Understand the distinction between Identity-based Entities and structural Value Objects, implementing self-validating immutable types.",
          conceptTopics: [
            "Entity (Identity) vs Value Object (Structural Equality)",
            "Immutability for thread safety and side-effect prevention",
            "Financial precision: integer cents vs floating point drift",
            "Self-validating invariants upon construction"
          ],
          targetTimeMinutes: 30,
          drills: [
            {
              taskId: "LLDP1-D1.2.2",
              taskName: "Immutable Money Value Object with Invariant Guards",
              taskDescription: "Build an immutable Money Value Object handling integer cents and ISO currency codes. Enforce validation: cents cannot be negative, currency cannot be empty. Invariant guard: adding Money of different currencies throws a typed CurrencyMismatchException. Implement structural value equality.",
              actionVerb: "BUILD",
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
      taskId: "LLDP1-M3",
      taskName: "Module 1.3: Object Relationships & Composition vs Inheritance",
      taskDescription: "Master the 3 core relationships that define all OO architectures: Association, Aggregation, and Composition, and discover why favoring composition prevents brittle class hierarchies.",
      taskPriority: "high",
      units: [
        {
          taskId: "LLDP1-U1.3.1",
          taskName: "Unit 1.3.1: Ownership Semantics & Multiplicity Mapping",
          unitCode: "1.3.1",
          taskDescription: "Distinguish uses-a, has-a (shared lifetime), and owns-a (exclusive lifecycle) object relationships.",
          conceptTopics: [
            "Association (uses-a relationship)",
            "Aggregation (has-a shared lifecycle)",
            "Composition (owns-a exclusive lifecycle)",
            "Cardinality and Multiplicity modeling"
          ],
          targetTimeMinutes: 30,
          drills: [
            {
              taskId: "LLDP1-D1.3.1",
              taskName: "Mapping Association, Aggregation & Composition",
              taskDescription: "Analyze 6 real-world domain pairs: Order <-> OrderItem, Department <-> Professor, Doctor <-> Patient, House <-> Room, Driver <-> Car, PaymentGateway <-> CheckoutController. Write constructor signatures and lifecycle management logic for each.",
              actionVerb: "COMPARE",
              level: "A",
              levelName: "Concept Drill",
              targetTimeMinutes: 15,
              difficulty: "easy"
            }
          ]
        },
        {
          taskId: "LLDP1-U1.3.2",
          taskName: "Unit 1.3.2: Composition Over Inheritance & Class Explosion",
          unitCode: "1.3.2",
          taskDescription: "Understand the fragile base class problem, how subclassing breaks when features vary across multiple dimensions, and how to compose behaviors.",
          conceptTopics: [
            "Fragile Base Class problem",
            "Class Explosion across multiple variation axes",
            "Pluggable strategies and decorator composition",
            "Predicting inheritance collapse under future requirements"
          ],
          targetTimeMinutes: 40,
          drills: [
            {
              taskId: "LLDP1-D1.3.2",
              taskName: "Dismantling Fragile Base Class in Notification System",
              taskDescription: "A notification system was modeled with deep inheritance: Notification -> EmailNotification -> EncryptedEmailNotification -> PriorityEncryptedEmailNotification... Refactor the architecture using composition: separate dispatch channel from formatting and priority behaviors so new channels can be added with 1 class instead of 8.",
              actionVerb: "REFACTOR",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 30,
              difficulty: "medium"
            },
            {
              taskId: "LLDP1-D1.3.3",
              taskName: "Anticipating Inheritance Breakdowns",
              taskDescription: "Given a game character hierarchy (Character -> Warrior, Mage, Archer), predict what happens when the game introduces dual-class characters or dynamic weapon-swapping at runtime. Formulate the concrete design pivot needed before writing code.",
              actionVerb: "PREDICT",
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
      taskId: "LLDP1-M4",
      taskName: "Module 1.4: Practical OOAD: Requirements to Domain Architecture",
      taskDescription: "Learn the systematic workflow of translating unstructured business requirements into cohesive domain models, CRC cards, and runtime sequence interactions.",
      taskPriority: "high",
      units: [
        {
          taskId: "LLDP1-U1.4.1",
          taskName: "Unit 1.4.1: Noun-Verb Analysis & CRC Responsibility Mapping",
          unitCode: "1.4.1",
          taskDescription: "Extract clean candidate entities from requirement prose and define strict single responsibilities using CRC (Class-Responsibility-Collaborators) cards.",
          conceptTopics: [
            "Noun-Verb extraction technique",
            "Filtering out primitive attributes vs genuine domain entities",
            "CRC (Class-Responsibility-Collaborators) modeling",
            "Mapping message passing lifelines with UML Sequence diagrams"
          ],
          targetTimeMinutes: 35,
          drills: [
            {
              taskId: "LLDP1-D1.4.1",
              taskName: "Digital Wallet Domain Model & CRC Extraction",
              taskDescription: "Read a 3-paragraph specification for a Peer-to-Peer Digital Wallet. Extract candidate entities (filtering out primitive data and helpers), write CRC cards establishing single responsibility per entity, and trace a sequence diagram for transferFunds().",
              actionVerb: "BUILD",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 35,
              difficulty: "medium"
            }
          ]
        }
      ]
    }
  ],
  majorProblems: [
    {
      taskId: "LLDP1-P1",
      taskName: "Problem 1 — Design a Vending Machine",
      difficulty: "medium",
      targetTime: "75 mins",
      taskPriority: "high",
      taskDescription: `## Problem 1 — Design a Vending Machine

* **Difficulty:** Medium
* **Target Time:** 75 minutes
* **Category:** Self-Service Hardware System / State Management

---

### 1. Real-World Context
You are tasked with engineering the core in-memory control software for a modern self-service automated vending machine. The system interfaces with physical hardware controllers: coin and bill acceptors, a keypad selection panel, an item delivery coil, and a digital customer display. It must rigorously safeguard intake currency, dispense the selected item only when full payment is collected, return exact change, and preserve state integrity.

---

### 2. Functional Requirements
1. **Inventory Management:**
   * The machine contains numbered item slots (e.g., Code \`A1\`, \`A2\`, \`B1\`).
   * Each slot maintains an item name, unit price, and available stock count.
2. **Payment Collection:**
   * Accepts standard currency denominations: Coins (1¢, 5¢, 10¢, 25¢) and Bills ($1, $5).
   * Accumulates user-inserted currency during an active transaction.
3. **Item Selection & Dispense:**
   * User selects a slot code via keypad.
   * If stock > 0 and inserted money >= price: dispense item, calculate change, decrement stock, and reset balance.
   * If inserted money < price: display remaining balance required.
   * If stock == 0: reject selection with clear user message.
4. **Transaction Cancellation & Refund:**
   * Prior to dispensing, the user can cancel and receive 100% of inserted money back.
5. **Cash Float & Exact Change:**
   * The machine maintains an internal float of cash to return change.
   * If the machine cannot dispense exact change, it must abort the transaction and refund inserted money.

---

### 3. Supported Operations (Interface Contract)
\`\`\`java
public interface IVendingMachine {
    void insertCurrency(Currency currency);
    void selectItem(String slotCode);
    DispenseResult dispense();
    List<Currency> cancelTransaction();
    
    // Maintenance operations
    void restockItem(String slotCode, Item item, int quantity);
    void loadCashFloat(Map<Currency, Integer> cash);
    int getMachineCashBalance();
}
\`\`\`

---

### 4. State & Lifecycle Rules
The machine exists in one of the following operational states at any instant:
* \`IDLE\`: Awaiting user interaction or currency.
* \`ACCEPTING_PAYMENT\`: Currency inserted; waiting for sufficient balance or additional coins.
* \`ITEM_SELECTED\`: Item chosen; checking stock and price match.
* \`DISPENSING\`: Dispensing product and calculating change.
* \`REFUNDING\`: Returning inserted coins upon user cancellation or failure.
* \`OUT_OF_SERVICE\`: Hardware fault, empty machine, or critical cash shortage.

*Invalid operation rule:* Calling \`dispense()\` in \`IDLE\` state must throw an \`InvalidOperationException\`.

---

### 5. Constraints & Edge Cases
* **Financial Precision:** All monetary amounts must be calculated in integer cents (e.g., $1.25 = 125 cents) or an immutable \`Money\` Value Object to eliminate floating-point rounding errors.
* **Insufficient Change Invariant:** If a user inserts a $5 bill for a $1.25 item, but the machine only has $1 bills (no quarters), it cannot return $3.75 exact change. The machine must detect this BEFORE dispensing, reject the transaction, and refund the $5 bill.
* **Double Dispense Guard:** A hardware failure during dispensing must not deduct inventory or consume user funds without confirmation.

---

### 6. Progressive Evolving Versions (Subtask Checklist)
* **Version 1 (Baseline In-Memory Dispense):** Single product, exact money only, happy-path dispense.
* **Version 2 (Multi-Item Catalog & State Machine):** Multiple slot codes, stock tracking, full state lifecycle (\`IDLE\`, \`ACCEPTING\`, \`DISPENSING\`, \`REFUNDING\`), cancellation support.
* **Version 3 (Cash Float & Exact Change Algorithm):** Internal cash float repository. Greedy change return algorithm. Handling \`InsufficientChangeException\` with automatic refund.
* **Version 4 (Requirement Change — Card & Promotional Discounts):** Support alphanumeric promotional discount codes and contactless card payments alongside cash.
* **Version 5 (Architectural Review & Invariant Audit):** Audit for state transition leaks, God classes, and financial precision bugs.`,
      versions: [
        {
          taskId: "LLDP1-P1-V1",
          taskName: "Version 1: Baseline In-Memory Dispense",
          taskDescription: "Implement single-product catalog, exact coin insertion, and happy-path dispensing.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        },
        {
          taskId: "LLDP1-P1-V2",
          taskName: "Version 2: Multi-Item Catalog & State Machine",
          taskDescription: "Introduce slot codes, stock tracking, full state lifecycle, and transaction cancellation.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP1-P1-V3",
          taskName: "Version 3: Cash Float & Exact Change Algorithm",
          taskDescription: "Build cash float inventory, greedy coin change calculation, and insufficient change refund rollback.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP1-P1-V4",
          taskName: "Version 4: Requirement Change — Card & Promotional Discounts",
          taskDescription: "Support contactless card payments and percentage/fixed promo voucher codes.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP1-P1-V5",
          taskName: "Version 5: Architectural Review & Invariant Audit",
          taskDescription: "Audit against state transition leaks, tight coupling, and floating-point financial bugs.",
          targetTimeMinutes: 30,
          difficulty: "medium"
        }
      ]
    },
    {
      taskId: "LLDP1-P2",
      taskName: "Problem 2 — Design Tic Tac Toe",
      difficulty: "easy",
      targetTime: "60 mins",
      taskPriority: "medium",
      taskDescription: `## Problem 2 — Design Tic Tac Toe

* **Difficulty:** Easy / Foundation
* **Target Time:** 60 minutes
* **Category:** Grid-Based Game Engine / State Evaluation

---

### 1. Real-World Context
Design an in-memory game engine for Tic Tac Toe. While the standard game is played on a 3x3 grid between two players (X and O), your architecture must be extensible to support an $N \times N$ board, multiple players ($M$ players with distinct custom pieces), and efficient winning-line checks.

---

### 2. Functional Requirements
1. **Board Representation:**
   * Dynamic dimension $N \times N$ (default 3x3).
   * Empty cells and occupied cells with piece identification.
2. **Player Management:**
   * Supports 2 or more players taking turns in round-robin order.
   * Each player has a name and a unique piece symbol.
3. **Move Execution & Validation:**
   * Coordinates $(row, col)$ must be within valid bounds: $0 \le row, col < N$.
   * Cell must be currently unoccupied.
   * Out-of-turn moves, out-of-bounds moves, or moves on occupied cells throw \`InvalidMoveException\`.
4. **Game End Detection:**
   * Detect win condition: complete row, column, main diagonal, or anti-diagonal occupied by the same player.
   * Detect tie/draw condition: all cells occupied with no winner.
5. **Efficiency Requirement:**
   * Win evaluation must execute in $O(1)$ time complexity per move rather than scanning the entire $N \times N$ board ($O(N^2)$).

---

### 3. Progressive Evolving Versions (Subtask Checklist)
* **Version 1 (Classic 3x3 Grid):** Basic 3x3 board, 2 players, standard turn validation.
* **Version 2 (N x N Board Scaling & O(1) Win Checking):** Arbitrary $N \times N$ board size; maintain row, col, and diagonal count arrays for constant-time win checking.
* **Version 3 (Requirement Change — Move History & Undo):** Implement reversible moves allowing players to undo turns without corrupting board state.
* **Version 4 (Design Review):** Audit board encapsulation and separation of game coordination from win evaluation rules.`,
      versions: [
        {
          taskId: "LLDP1-P2-V1",
          taskName: "Version 1: Classic 3x3 Grid Engine",
          taskDescription: "Basic 3x3 board, 2 players, turn alternation, and simple win checks.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        },
        {
          taskId: "LLDP1-P2-V2",
          taskName: "Version 2: N x N Scaling & O(1) Win Evaluation",
          taskDescription: "Support arbitrary N dimensions and implement O(1) row/col/diag count arrays for constant time win checking.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP1-P2-V3",
          taskName: "Version 3: Requirement Change — Move History & Undo",
          taskDescription: "Implement move history stack allowing undo/redo operations preserving board state.",
          targetTimeMinutes: 30,
          difficulty: "medium"
        },
        {
          taskId: "LLDP1-P2-V4",
          taskName: "Version 4: Design Review & Invariant Audit",
          taskDescription: "Review separation of rules engine from board entity; verify encapsulation.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        }
      ]
    },
    {
      taskId: "LLDP1-P3",
      taskName: "Problem 3 — Design a Coffee Maker",
      difficulty: "easy",
      targetTime: "60 mins",
      taskPriority: "medium",
      taskDescription: `## Problem 3 — Design a Coffee Maker

* **Difficulty:** Easy / Foundation
* **Target Time:** 60 minutes
* **Category:** Resource Consumption & Recipe Composition *(No Concurrency)*

---

### 1. Real-World Context
Design the control engine for an automated office coffee machine. The machine manages an internal inventory of raw ingredients (water, milk, coffee beans, sugar) and dispenses customized beverage recipes (Espresso, Latte, Cappuccino).

---

### 2. Functional Requirements
1. **Inventory Management:**
   * Tracks current capacity and available quantity for each raw ingredient in standard units (ml, grams).
   * Refill operation to replenish ingredient levels.
2. **Recipe Composition:**
   * Each beverage type has a predefined recipe specifying required ingredient quantities.
   * Customization: Allow users to specify extra milk, extra sugar, or light coffee.
3. **Dispensing Workflow:**
   * Validates if sufficient ingredients are available before starting preparation.
   * If ingredients are sufficient: atomically deduct inventory and dispense beverage.
   * If any ingredient is insufficient: reject request with clear details on which ingredient is depleted.
4. **Alerts & Maintenance:**
   * Trigger a warning alert when any ingredient falls below 20% threshold.

---

### 3. Progressive Evolving Versions (Subtask Checklist)
* **Version 1 (Fixed Recipes & Inventory):** Static recipes for Espresso and Americano, inventory consumption, and insufficient stock errors.
* **Version 2 (Dynamic Recipe Customization):** Add-on modifiers (extra milk, double shot) modifying base recipe requirements dynamically.
* **Version 3 (Requirement Change — New Beverage Categories):** Add Hot Chocolate and Green Tea with novel ingredients without altering existing drink logic.
* **Version 4 (Design Review):** Audit recipe composition vs. inheritance and inventory encapsulation.`,
      versions: [
        {
          taskId: "LLDP1-P3-V1",
          taskName: "Version 1: Fixed Recipes & Inventory Tracking",
          taskDescription: "Model ingredients, recipe definitions, and atomic inventory deduction.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        },
        {
          taskId: "LLDP1-P3-V2",
          taskName: "Version 2: Dynamic Recipe Customization",
          taskDescription: "Support add-on modifiers altering ingredient requirements dynamically.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        },
        {
          taskId: "LLDP1-P3-V3",
          taskName: "Version 3: Requirement Change — Tea & Specialty Drinks",
          taskDescription: "Introduce non-coffee beverages and novel ingredients with minimal code changes.",
          targetTimeMinutes: 30,
          difficulty: "medium"
        },
        {
          taskId: "LLDP1-P3-V4",
          taskName: "Version 4: Design Review & Audit",
          taskDescription: "Evaluate recipe coupling, inventory guards, and OCP compliance.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        }
      ]
    },
    {
      taskId: "LLDP1-P4",
      taskName: "Problem 4 — Design a Library Management System",
      difficulty: "medium",
      targetTime: "75 mins",
      taskPriority: "medium",
      taskDescription: `## Problem 4 — Design a Library Management System

* **Difficulty:** Medium
* **Target Time:** 75 minutes
* **Category:** Asset Tracking & Loan Lifecycle Management

---

### 1. Real-World Context
Design an automated library catalog and asset tracking system. The system governs book titles, individual physical copies, member borrowing limits, reservation queues, and automated overdue fine calculations.

---

### 2. Functional Requirements
1. **Catalog & Copy Multiplicity:**
   * Distinguish between a \`Book\` (metadata: ISBN, Title, Author, Subject) and a physical \`BookCopy\` (barcode, rack number, loan status).
2. **Search Capabilities:**
   * Search books by Title, Author, Subject, or Publication Date.
3. **Member Borrowing Rules:**
   * Members can checkout a maximum of 5 books simultaneously.
   * Standard loan duration is 14 days.
   * A member with overdue books or outstanding fines > $10 cannot borrow additional books.
4. **Reservation Queue:**
   * If all copies of a book are currently loaned out, members can place a reservation in a FIFO queue.
   * When a copy is returned, it is held for the first member in the reservation queue for 48 hours.
5. **Overdue Fine Engine:**
   * Calculates fines daily for overdue copies (e.g., $0.50 per day past due date).

---

### 3. Progressive Evolving Versions (Subtask Checklist)
* **Version 1 (Catalog & Copy Multiplicity):** Books, physical copies, search index, and checkout/return basics.
* **Version 2 (Borrowing Policies & Reservation Queue):** 5-book limit, 14-day borrowing duration, FIFO reservation waitlist.
* **Version 3 (Fine Calculation Engine & Suspension):** Daily overdue fine computation and borrowing privileges suspension.
* **Version 4 (Design Review):** Audit entity relationships (Book vs Copy) and lifecycle state transitions.`,
      versions: [
        {
          taskId: "LLDP1-P4-V1",
          taskName: "Version 1: Catalog & Physical Copy Multiplicity",
          taskDescription: "Model distinct Book titles and physical BookCopies with barcode tracking and search.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        },
        {
          taskId: "LLDP1-P4-V2",
          taskName: "Version 2: Borrowing Policies & FIFO Reservation Queue",
          taskDescription: "Enforce loan limits, 14-day duration, and waitlists for loaned-out books.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP1-P4-V3",
          taskName: "Version 3: Overdue Fine Engine & Member Suspension",
          taskDescription: "Automate fine calculation and enforce account suspension on unpaid fines.",
          targetTimeMinutes: 30,
          difficulty: "medium"
        },
        {
          taskId: "LLDP1-P4-V4",
          taskName: "Version 4: Design Review & Invariant Audit",
          taskDescription: "Evaluate reservation queue invariants, date calculations, and catalog search index coupling.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        }
      ]
    }
  ]
};

/**
 * Sarthi LLD Curriculum v2.1 — Phase 3 Data
 * Phase 3: Design Pattern Discovery Through Recurring Requirement Pain
 * Hierarchy: Phase -> Module -> Learning Unit -> Practical Drill
 *            Phase -> Major Problem -> Problem Version
 */

export const phase3Data = {
  key: "LLDP3",
  name: "LLD Phase 3: Design Pattern Discovery Through Recurring Requirement Pain",
  description: "Learn design patterns by discovering them as solutions to recurring design bottlenecks and requirement pivots, rather than memorizing pattern definitions.",
  modules: [
    {
      taskId: "LLDP3-M1",
      taskName: "Module 3.1: Tier 1 Deep Behavioral Patterns",
      taskDescription: "Discover the core patterns that govern object interaction, algorithms, state evolution, and message passing through concrete design pain.",
      taskPriority: "high",
      units: [
        {
          taskId: "LLDP3-U3.1.1",
          taskName: "Unit 3.1.1: Strategy Pattern — Decoupling Algorithm Families",
          unitCode: "3.1.1",
          taskDescription: "Extract interchangeable algorithm families behind common interfaces, allowing algorithms to vary independently from clients that use them.",
          conceptTopics: [
            "Strategy Pattern intent & mechanics",
            "Dynamic algorithm selection at runtime",
            "Decoupling clients from algorithmic variants",
            "Composition over inheritance in algorithm evolution"
          ],
          targetTimeMinutes: 30,
          drills: [
            {
              taskId: "LLDP3-D3.1.1",
              taskName: "Dynamic Shipping Cost Engine Refactor",
              taskDescription: "A ShippingRateCalculator has hardcoded rules for FedEx, DHL, and Postal. Adding dynamic holiday discounts and overnight courier calculation causes sprawling conditionals.\n\n### Requirements:\n1. Extract an interchangeable ShippingPricingStrategy interface.\n2. Implement concrete strategies and configure them dynamically at checkout.\n3. Write tests verifying strategy swapping without modifying CheckoutService.",
              actionVerb: "REFACTOR",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 30,
              difficulty: "medium"
            }
          ]
        },
        {
          taskId: "LLDP3-U3.1.2",
          taskName: "Unit 3.1.2: Observer Pattern — Event Broadcasting & State Sync",
          unitCode: "3.1.2",
          taskDescription: "Implement loosely coupled one-to-many event notification topologies, maintaining state consistency across disparate domain services.",
          conceptTopics: [
            "Observer Pattern intent & pub-sub mechanics",
            "Dynamic listener subscription and unsubscription",
            "Loose coupling between subject and observers",
            "Error isolation during broadcast loops"
          ],
          targetTimeMinutes: 30,
          drills: [
            {
              taskId: "LLDP3-D3.1.2",
              taskName: "Decoupled Order Event Broker",
              taskDescription: "Build an in-memory pub-sub OrderEventManager:\n1. When an order is placed, notify InventoryService, EmailService, AnalyticsService, and BillingService.\n2. Allow listeners to subscribe/unsubscribe dynamically at runtime.\n3. Handle exceptions thrown by one listener without terminating the notification loop.",
              actionVerb: "BUILD",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 30,
              difficulty: "medium"
            }
          ]
        },
        {
          taskId: "LLDP3-U3.1.3",
          taskName: "Unit 3.1.3: State Pattern — Encapsulating Lifecycle Transitions",
          unitCode: "3.1.3",
          taskDescription: "Eliminate sprawling conditional logic by modeling system states as independent first-class objects that govern behavioral mutations.",
          conceptTopics: [
            "State Pattern intent & state transitions",
            "Eliminating conditionals on object state",
            "State object context delegation",
            "Illegal transition exception handling"
          ],
          targetTimeMinutes: 30,
          drills: [
            {
              taskId: "LLDP3-D3.1.3",
              taskName: "Document Workflow Lifecycle State Machine",
              taskDescription: "A publishing platform models a Document with nested `if (status == DRAFT) ... else if (status == REVIEW)`. Invalid transitions happen silently.\n\n### Requirements:\n1. Extract a DocumentState interface.\n2. Encapsulate state-specific behaviors (edit(), review(), publish(), archive()) in concrete state classes.\n3. Throw typed exceptions for illegal transitions (e.g., editing an Archived document).",
              actionVerb: "REFACTOR",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 30,
              difficulty: "medium"
            }
          ]
        },
        {
          taskId: "LLDP3-U3.1.4",
          taskName: "Unit 3.1.4: Command Pattern — Encapsulating Operations & Undo/Redo",
          unitCode: "3.1.4",
          taskDescription: "Encapsulate requests as standalone objects with execution, reversal, queuing, and audit-logging capabilities.",
          conceptTopics: [
            "Command Pattern intent & encapsulation",
            "Command execution and rollback/undo mechanics",
            "Command history stacks",
            "Transactional command queueing"
          ],
          targetTimeMinutes: 30,
          drills: [
            {
              taskId: "LLDP3-D3.1.4",
              taskName: "Transactional Undo/Redo Text Buffer Engine",
              taskDescription: "Build a transactional canvas or text buffer:\n1. Encapsulate actions (InsertTextCommand, DeleteTextCommand, FormatCommand) as objects with execute() and undo().\n2. Maintain command history stacks supporting arbitrary multi-level Undo and Redo operations.",
              actionVerb: "BUILD",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 30,
              difficulty: "medium"
            }
          ]
        },
        {
          taskId: "LLDP3-U3.1.5",
          taskName: "Unit 3.1.5: Chain of Responsibility — Extensible Request Pipelines",
          unitCode: "3.1.5",
          taskDescription: "Decouple request senders from handlers by passing requests along dynamic handler chains until processed.",
          conceptTopics: [
            "Chain of Responsibility intent",
            "Handler linkage and dispatch order",
            "Early exit vs pipeline pass-through",
            "Decoupled filtering & validation"
          ],
          targetTimeMinutes: 25,
          drills: [
            {
              taskId: "LLDP3-D3.1.5",
              taskName: "Extensible Request Filter Pipeline",
              taskDescription: "Construct a web request filter pipeline:\n1. Chain handlers: RateLimitHandler -> AuthenticationHandler -> SanitizationHandler -> PayloadValidationHandler.\n2. Allow any handler in the chain to abort the request or pass it to next().",
              actionVerb: "BUILD",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 25,
              difficulty: "medium"
            }
          ]
        }
      ]
    },
    {
      taskId: "LLDP3-M2",
      taskName: "Module 3.2: Tier 1 Deep Creational & Structural Patterns",
      taskDescription: "Master flexible object creation mechanisms and structural composition patterns that prevent subclass explosions and decouple callers from concrete classes.",
      taskPriority: "high",
      units: [
        {
          taskId: "LLDP3-U3.2.1",
          taskName: "Unit 3.2.1: Factory Method & Fluent Builder Patterns",
          unitCode: "3.2.1",
          taskDescription: "Separate complex object instantiation and configuration from domain representation, guaranteeing invariant validation before construction.",
          conceptTopics: [
            "Factory Method intent and creator hierarchy",
            "Builder pattern intent & fluent API construction",
            "Invariant enforcement during step-by-step building",
            "Decoupling callers from concrete instantiation"
          ],
          targetTimeMinutes: 35,
          drills: [
            {
              taskId: "LLDP3-D3.2.1",
              taskName: "Document Exporter Factory & HTTP Config Builder",
              taskDescription: "1. Build a DocumentExporterFactory returning PdfExporter, MarkdownExporter, or HtmlExporter.\n2. Build an immutable HttpRequestConfig using a fluent Builder enforcing mandatory URL and headers before .build().",
              actionVerb: "BUILD",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 35,
              difficulty: "medium"
            }
          ]
        },
        {
          taskId: "LLDP3-U3.2.2",
          taskName: "Unit 3.2.2: Decorator & Adapter Patterns",
          unitCode: "3.2.2",
          taskDescription: "Augment behavior dynamically at runtime without inheritance, and bridge incompatible interfaces cleanly across subsystem boundaries.",
          conceptTopics: [
            "Decorator pattern intent & recursive wrapping",
            "Dynamic runtime behavior augmentation without subclass explosion",
            "Adapter pattern intent & interface translation",
            "Wrapping legacy or external vendor SDKs"
          ],
          targetTimeMinutes: 35,
          drills: [
            {
              taskId: "LLDP3-D3.2.2",
              taskName: "Dynamic Beverage Addons & Legacy Payment Bridge",
              taskDescription: "1. Build a dynamic beverage ordering system where toppings (Milk, Syrup, WhipCream) wrap Beverage instances dynamically at runtime.\n2. Build an ExternalStripeAdapter wrapping a legacy third-party vendor SDK into our domain's PaymentProcessor interface.",
              actionVerb: "BUILD",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 35,
              difficulty: "medium"
            }
          ]
        },
        {
          taskId: "LLDP3-U3.2.3",
          taskName: "Unit 3.2.3: Composite Pattern — Uniform Tree Hierarchies",
          unitCode: "3.2.3",
          taskDescription: "Treat individual objects and nested tree hierarchies uniformly through common structural interfaces.",
          conceptTopics: [
            "Composite pattern intent",
            "Uniform treatment of leaves and composites",
            "Recursive tree traversal algorithms",
            "Component interface design"
          ],
          targetTimeMinutes: 30,
          drills: [
            {
              taskId: "LLDP3-D3.2.3",
              taskName: "In-Memory FileSystem Tree Hierarchy",
              taskDescription: "Build an in-memory FileSystem modeling File and Directory:\n1. Both implement FileSystemNode exposing getSize(), printTree(), delete().\n2. A directory computes its size by recursively summing all child files and subdirectories uniformly.",
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
      taskId: "LLDP3-M3",
      taskName: "Module 3.3: Tier 2 & Tier 3 Pattern Masterclass",
      taskDescription: "Complete coverage of all remaining Gang of Four patterns with pragmatic focus on interview recognition, architectural trade-offs, and critical pitfalls.",
      taskPriority: "medium",
      units: [
        {
          taskId: "LLDP3-U3.3.1",
          taskName: "Unit 3.3.1: Tier 2 Structural & Behavioral Patterns",
          unitCode: "3.3.1",
          taskDescription: "Apply Proxy, Facade, Template Method, Bridge, Iterator, and Mediator to common architectural bottlenecks.",
          conceptTopics: [
            "Proxy pattern: Caching, virtual, and protection proxies",
            "Facade pattern: High-level unified subsystem interface",
            "Template Method: Invariant algorithm skeleton with hooks",
            "Mediator vs Observer: Centralized vs distributed communication"
          ],
          targetTimeMinutes: 35,
          drills: [
            {
              taskId: "LLDP3-D3.3.1",
              taskName: "Proxy, Facade & Template Method Implementation Drill",
              taskDescription: "1. Implement a caching Image Proxy and a high-level Video Converter Facade.\n2. Build an algorithmic skeleton using Template Method with hook steps.\n3. Compare Mediator vs Observer: Centralized hub vs distributed pub-sub.",
              actionVerb: "COMPARE",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 35,
              difficulty: "medium"
            }
          ]
        },
        {
          taskId: "LLDP3-U3.3.2",
          taskName: "Unit 3.3.2: The Singleton Antipattern & Dependency Injection",
          unitCode: "3.3.2",
          taskDescription: "Diagnose testing bottlenecks and concurrency bugs caused by global singletons, refactoring toward constructor dependency injection.",
          conceptTopics: [
            "Singleton pattern intent & risks",
            "Double-Checked Locking and Bill Pugh idioms",
            "Global state issues and testing bottlenecks",
            "Refactoring to Dependency Injection"
          ],
          targetTimeMinutes: 20,
          drills: [
            {
              taskId: "LLDP3-D3.3.2",
              taskName: "Singleton Antipattern & Thread Safety Refactor",
              taskDescription: "A global mutable ConfigurationManager.getInstance() creates hidden dependencies, prevents unit testing parallelism, and breaks thread safety.\n\n### Requirements:\n1. Implement thread-safe Double-Checked Locking and Bill Pugh Singleton.\n2. Refactor callers to receive dependencies via constructor injection instead of calling .getInstance().",
              actionVerb: "REFACTOR",
              level: "A",
              levelName: "Concept Drill",
              targetTimeMinutes: 20,
              difficulty: "medium"
            }
          ]
        },
        {
          taskId: "LLDP3-U3.3.3",
          taskName: "Unit 3.3.3: Tier 3 Specialized GoF Patterns",
          unitCode: "3.3.3",
          taskDescription: "Recognize situational patterns (Flyweight, Memento, Visitor, Prototype) and evaluate trade-offs in specialized domains.",
          conceptTopics: [
            "Flyweight pattern: Intrinsic vs extrinsic state sharing",
            "Memento pattern: Snapshotting state without violating encapsulation",
            "Visitor pattern: Adding operations across node hierarchies",
            "Prototype pattern: Cloning prototype instances"
          ],
          targetTimeMinutes: 20,
          drills: [
            {
              taskId: "LLDP3-D3.3.3",
              taskName: "Specialized GoF Patterns Comparison Drill",
              taskDescription: "1. Flyweight: Sharing immutable font/character glyph state in a text rendering engine.\n2. Memento: Capturing private snapshot of game state without breaking encapsulation.\n3. Visitor: Adding XML and JSON export operations across an AST node hierarchy without editing node classes.",
              actionVerb: "COMPARE",
              level: "A",
              levelName: "Concept Drill",
              targetTimeMinutes: 20,
              difficulty: "easy"
            }
          ]
        }
      ]
    },
    {
      taskId: "LLDP3-M4",
      taskName: "Module 3.4: Pattern Decision & Prediction Drills",
      taskDescription: "Sharpen your pattern recognition reflexes. Learn to identify which pattern naturally solves a problem without being told upfront.",
      taskPriority: "high",
      units: [
        {
          taskId: "LLDP3-U3.4.1",
          taskName: "Unit 3.4.1: Strategy vs State Discrimination",
          unitCode: "3.4.1",
          taskDescription: "Master the subtle architectural and behavioral distinctions between Strategy and State patterns despite identical UML structures.",
          conceptTopics: [
            "Strategy vs State structural similarity vs behavioral intent",
            "Client awareness vs state-driven automatic transitions",
            "Class diagram comparison and discriminator tests"
          ],
          targetTimeMinutes: 15,
          drills: [
            {
              taskId: "LLDP3-D3.4.1",
              taskName: "Strategy vs State Discrimination Decision Drill",
              taskDescription: "Both Strategy and State delegate to an interface. Formulate the concrete mental test that determines whether you are solving an interchangeable algorithm problem or a state-driven behavior problem.",
              actionVerb: "COMPARE",
              level: "A",
              levelName: "Concept Drill",
              targetTimeMinutes: 15,
              difficulty: "easy"
            }
          ]
        },
        {
          taskId: "LLDP3-U3.4.2",
          taskName: "Unit 3.4.2: Decorator vs Adapter vs Proxy Comparison",
          unitCode: "3.4.2",
          taskDescription: "Disambiguate wrapper patterns by matching problem requirements against interface alteration, behavior extension, or access mediation.",
          conceptTopics: [
            "Wrapper patterns taxonomy",
            "Adapter: changing interface",
            "Decorator: augmenting behavior with same interface",
            "Proxy: controlling access with same interface"
          ],
          targetTimeMinutes: 15,
          drills: [
            {
              taskId: "LLDP3-D3.4.2",
              taskName: "Decorator vs Adapter vs Proxy Decision Drill",
              taskDescription: "All three wrap an object. Compare their intents:\n* Adapter changes the interface.\n* Decorator augments behavior while keeping the same interface.\n* Proxy controls access while keeping the same interface.",
              actionVerb: "COMPARE",
              level: "A",
              levelName: "Concept Drill",
              targetTimeMinutes: 15,
              difficulty: "easy"
            }
          ]
        },
        {
          taskId: "LLDP3-U3.4.3",
          taskName: "Unit 3.4.3: Predicting Pattern Emergence Under Scale",
          unitCode: "3.4.3",
          taskDescription: "Anticipate pattern needs in evolving codebases before rigid designs trigger costly refactoring cycles.",
          conceptTopics: [
            "Requirement pivot anticipation",
            "Recognizing friction points in evolving codebases",
            "Predicting pattern selection from user stories"
          ],
          targetTimeMinutes: 20,
          drills: [
            {
              taskId: "LLDP3-D3.4.3",
              taskName: "E-Commerce Architecture Pattern Prediction Exercise",
              taskDescription: "Given an e-commerce checkout handling coupon codes, order totals, and fulfillment.\nPredict which patterns emerge when the business adds: dynamic gift wrapping, multiple payment providers, and external webhook broadcasting.",
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
      taskId: "LLDP3-P1",
      taskName: "Problem 8 — Design an Elevator Control System",
      difficulty: "hard",
      targetTime: "90 mins",
      taskPriority: "high",
      taskDescription: `## Problem 8 — Design an Elevator Control System

* **Difficulty:** Hard
* **Target Time:** 90 minutes
* **Category:** Hardware Control & Scheduling Algorithms

---

### 1. Real-World Context
Design the central dispatching and control software for a bank of N elevators operating in a high-rise commercial office building with M floors. The system coordinates internal cabin requests (buttons pressed inside the elevator) and external hall calls (up/down buttons pressed on floor landings).

---

### 2. Functional Requirements
1. **Elevator Car State & Motion:**
   * Attributes: Current floor, Current direction (UP, DOWN, IDLE), Door status (OPEN, CLOSED), Passenger weight.
   * Motion loop: Move between floors, stop to service requests, open/close doors with safety sensors.
2. **Pluggable Scheduling Algorithms:**
   * First-Come First-Served (FCFS).
   * Shortest Seek Time First (SSTF).
   * SCAN / LOOK (Elevator Algorithm): Services requests in current direction until reaching boundary, then reverses.
3. **Elevator Bank Dispatcher:**
   * Receives external landing requests and assigns the optimal elevator car to minimize average passenger wait time.
4. **Emergency & Safety Controls:**
   * Weight capacity limit violation halts motion until load decreases.
   * Emergency stop and VIP dedicated modes.`,
      versions: [
        {
          taskId: "LLDP3-P1-V1",
          taskName: "Version 1: Single Car Baseline",
          taskDescription: "Model elevator car, floor buttons, and basic motion loop.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        },
        {
          taskId: "LLDP3-P1-V2",
          taskName: "Version 2: LOOK & SCAN Scheduling Algorithms",
          taskDescription: "Implement pluggable scheduling algorithms optimizing elevator travel distance.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP3-P1-V3",
          taskName: "Version 3: Multi-Car Bank Controller",
          taskDescription: "Coordinate a bank of elevators and optimize landing call dispatching.",
          targetTimeMinutes: 45,
          difficulty: "hard"
        },
        {
          taskId: "LLDP3-P1-V4",
          taskName: "Version 4: Door Obstruction & Weight Invariants",
          taskDescription: "Model sensor interrupts, door states, and weight capacity guards.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        },
        {
          taskId: "LLDP3-P1-V5",
          taskName: "Version 5: Requirement Change — VIP & Maintenance Modes",
          taskDescription: "Support dedicated VIP runs and dynamic car isolation for maintenance.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP3-P1-V6",
          taskName: "Version 6: Design Review & Invariant Audit",
          taskDescription: "Evaluate event dispatching, request queues, and state synchronization.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        }
      ]
    },
    {
      taskId: "LLDP3-P2",
      taskName: "Problem 9 — Design Splitwise",
      difficulty: "medium",
      targetTime: "90 mins",
      taskPriority: "high",
      taskDescription: `## Problem 9 — Design Splitwise

* **Difficulty:** Medium
* **Target Time:** 90 minutes
* **Category:** Financial Group Billing & Graph Algorithms

---

### 1. Real-World Context
Design an expense sharing and debt balance management system. Users create shared groups, record shared expenses with custom splitting rules, track who owes whom, and settle debts with automated transaction simplification.

---

### 2. Functional Requirements
1. **Users & Groups:**
   * Manage users and user groups with shared membership.
2. **Expense Splitting Strategies:**
   * Equal Split: Divided equally among participants (handling fractional cents rounding).
   * Exact Amount Split: Specific currency amounts per participant.
   * Percentage Split: Specific percentages summing exactly to 100.00%.
   * Share/Ratio Split: Weighted ratio splits.
3. **Balance Sheet & Ledger:**
   * Maintain pair-wise balances between users (User A owes User B $X).
4. **Debt Simplification Algorithm:**
   * Simplify transitive debts across group members to minimize total settling transactions.`,
      versions: [
        {
          taskId: "LLDP3-P2-V1",
          taskName: "Version 1: User & Group Foundation",
          taskDescription: "Model users, groups, and equal-split expenses.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        },
        {
          taskId: "LLDP3-P2-V2",
          taskName: "Version 2: Pluggable Split Strategies",
          taskDescription: "Implement exact, percent, and share split strategies with validation guards.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP3-P2-V3",
          taskName: "Version 3: Rounding & Currency Invariants",
          taskDescription: "Ensure fractional cents are distributed correctly and sum to exact total.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        },
        {
          taskId: "LLDP3-P2-V4",
          taskName: "Version 4: Debt Simplification Graph Algorithm",
          taskDescription: "Implement cash-flow simplification algorithm to minimize settling payments.",
          targetTimeMinutes: 45,
          difficulty: "hard"
        },
        {
          taskId: "LLDP3-P2-V5",
          taskName: "Version 5: Requirement Change — Multi-Currency & Activity Feed",
          taskDescription: "Support currency conversion rates and event notifications on balance changes.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP3-P2-V6",
          taskName: "Version 6: Design Review & Invariant Audit",
          taskDescription: "Evaluate financial precision, graph data structure encapsulation, and OCP compliance.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        }
      ]
    },
    {
      taskId: "LLDP3-P3",
      taskName: "Problem 10 — Design Snake & Ladder",
      difficulty: "easy",
      targetTime: "60 mins",
      taskPriority: "medium",
      taskDescription: `## Problem 10 — Design Snake & Ladder

* **Difficulty:** Easy
* **Target Time:** 60 minutes
* **Category:** Turn-Based Board Game Engine

---

### 1. Real-World Context
Design an extensible board game engine for Snake and Ladder. The game supports configurable board dimensions (N cells), multiple dice, multiple players taking turns, and special board jump entities (Snakes, Ladders, and extensible Special Portals).

---

### 2. Functional Requirements
1. **Configurable Board Topology:**
   * Board of size S (default 100 cells, from 1 to S).
   * Cells may contain jump entities (Snake: start > end, Ladder: start < end).
2. **Dice & Player Turns:**
   * 1 or more dice yielding values between 1 and 6 per die.
   * Turn alternation across registered players.
3. **Movement & Win Validation:**
   * Player rolls dice, advances by total roll.
   * If landing on a jump cell, player position moves to jump destination.
   * Must land on exact target cell S to win.`,
      versions: [
        {
          taskId: "LLDP3-P10-V1",
          taskName: "Version 1: Classic Board & Movement",
          taskDescription: "Model 100-cell board, single die, and turn alternation.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        },
        {
          taskId: "LLDP3-P10-V2",
          taskName: "Version 2: Extensible Jump Entities",
          taskDescription: "Model abstract jump entity supporting snakes, ladders, and mystery cells.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        },
        {
          taskId: "LLDP3-P10-V3",
          taskName: "Version 3: Requirement Change — Multiple Dice & Turn Rules",
          taskDescription: "Support multiple dice and exact-roll winning conditions.",
          targetTimeMinutes: 30,
          difficulty: "medium"
        },
        {
          taskId: "LLDP3-P10-V4",
          taskName: "Version 4: Design Review & Invariant Audit",
          taskDescription: "Review game loop coupling and dice mockability for testing.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        }
      ]
    },
    {
      taskId: "LLDP3-P4",
      taskName: "Problem 11 — Design a Multi-Channel Notification Engine",
      difficulty: "medium",
      targetTime: "75 mins",
      taskPriority: "high",
      taskDescription: `## Problem 11 — Design a Multi-Channel Notification Engine

* **Difficulty:** Medium
* **Target Time:** 75 minutes
* **Category:** Message Routing, Decorators & Pipeline Filters

---

### 1. Real-World Context
Design an enterprise-grade notification dispatch platform. The platform receives notification requests, formats messages using template decorators, enforces user delivery preferences, applies rate limits, and routes payloads across multiple delivery channels (SMS, Email, Push Notification, Slack).

---

### 2. Functional Requirements
1. **Multi-Channel Dispatch:**
   * Pluggable delivery channels: Email, SMS, In-App Push, Slack.
   * Dynamic addition of new channels without modifying core dispatcher.
2. **Template & Content Decorators:**
   * Dynamic message decorators: Header/Footer branding, Encryption, Localization/Translation, Audit logging.
3. **User Preferences & Rate Limiting:**
   * Users can opt out of specific channels or set quiet hours.
   * Rate limiting per user: Max 5 promotional SMS per hour.
4. **Failover Routing:**
   * If primary SMS provider fails, automatically failover to secondary backup provider.`,
      versions: [
        {
          taskId: "LLDP3-P11-V1",
          taskName: "Version 1: Basic Multi-Channel Dispatch",
          taskDescription: "Model channels (Email, SMS) and abstract delivery contracts.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        },
        {
          taskId: "LLDP3-P11-V2",
          taskName: "Version 2: Template & Formatting Decorators",
          taskDescription: "Implement decorator pattern for dynamic branding and encryption.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP3-P11-V3",
          taskName: "Version 3: Rate Limiting & Filter Pipeline",
          taskDescription: "Build filter pipeline enforcing user preferences and rate caps.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP3-P11-V4",
          taskName: "Version 4: Requirement Change — Provider Failover & Retry",
          taskDescription: "Implement automatic failover to backup delivery providers upon failure.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP3-P11-V5",
          taskName: "Version 5: Design Review & Invariant Audit",
          taskDescription: "Audit async dispatch boundaries, provider error isolation, and OCP compliance.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        }
      ]
    }
  ]
};

/**
 * Sarthi LLD Curriculum v2.1 — Phase 4 Data
 * Phase 4: Complex Production LLD Systems & Problem-Driven Concurrency
 * Hierarchy: Phase -> Module -> Learning Unit -> Practical Drill
 *            Phase -> Major Problem -> Problem Version
 */

export const phase4Data = {
  key: "LLDP4",
  name: "LLD Phase 4: Complex Production LLD Systems & Problem-Driven Concurrency",
  description: "Synthesize all previous knowledge into serious, progressively changing LLD systems, introducing concurrency only where the problem genuinely requires it.",
  modules: [
    {
      taskId: "LLDP4-M1",
      taskName: "Module 4.1: Problem-Driven Concurrency in Low Level Design",
      taskDescription: "Master thread safety, race condition prevention, and lock granularity strictly in contexts where real systems demand concurrent access.",
      taskPriority: "high",
      units: [
        {
          taskId: "LLDP4-U4.1.1",
          taskName: "Unit 4.1.1: Critical Sections & Thread-Safe Data Structures",
          unitCode: "4.1.1",
          taskDescription: "Identify shared mutable state, delineate critical sections, and implement synchronization primitives without performance degradation.",
          conceptTopics: [
            "Critical section identification",
            "Mutex locking and condition variables",
            "Thread-safe queues and bounded buffers",
            "Deadlock prevention and lock ordering"
          ],
          targetTimeMinutes: 20,
          drills: [
            {
              taskId: "LLDP4-D4.1.1",
              taskName: "Thread-Safe Bounded Queue Implementation Drill",
              taskDescription: "Build a thread-safe in-memory BoundedQueue without using built-in concurrent collections:\n1. Implement enqueue() and dequeue() using explicit mutex locks and condition variables.\n2. Ensure threads block safely when queue is full or empty.",
              actionVerb: "BUILD",
              level: "A",
              levelName: "Concept Drill",
              targetTimeMinutes: 20,
              difficulty: "medium"
            }
          ]
        },
        {
          taskId: "LLDP4-U4.1.2",
          taskName: "Unit 4.1.2: Temporal Resource Leasing & Lock Granularity",
          unitCode: "4.1.2",
          taskDescription: "Design time-bounded leases with compensating cleanup routines, evaluating coarse vs fine-grained locking under high contention.",
          conceptTopics: [
            "Coarse vs fine-grained locking trade-offs",
            "Time-bound resource leases & TTLs",
            "Compensating releases and cleanup timers",
            "Handling concurrent reservation contention"
          ],
          targetTimeMinutes: 35,
          drills: [
            {
              taskId: "LLDP4-D4.1.2",
              taskName: "Expiring Lock Manager with Compensating Release",
              taskDescription: "Build an ExpiringLockManager managing temporary reservations (e.g. cinema seats or hotel rooms):\n1. User locks a resource with a 10-minute TTL.\n2. A background timer releases expired locks if payment is not confirmed.\n3. Write unit tests demonstrating that expired locks become available to competing threads immediately.",
              actionVerb: "BUILD",
              level: "B",
              levelName: "Design Exercise",
              targetTimeMinutes: 35,
              difficulty: "hard"
            }
          ]
        }
      ]
    }
  ],
  majorProblems: [
    {
      taskId: "LLDP4-P1",
      taskName: "Problem 12 — Design BookMyShow (Movie Booking & Seat Locking)",
      difficulty: "hard",
      targetTime: "120 mins",
      taskPriority: "high",
      taskDescription: `## Problem 12 — Design BookMyShow (Movie Booking & Seat Locking)

* **Difficulty:** Hard
* **Target Time:** 120 minutes
* **Category:** High-Concurrency Ticketing & Temporal Seat Locking

---

### 1. Real-World Context
Design the core ticketing and reservation engine for an online cinema platform. The platform handles city catalogs, multiple theater complexes, auditoriums/screens, scheduled movie shows, seat tiers, temporary concurrent seat locking, and payment timeouts.

---

### 2. Functional Requirements
1. **Cinema Topology & Catalog:**
   * City -> Cinema Theaters -> Screens/Auditoriums -> Shows -> Seats.
   * Seat tiers: Silver, Gold, Platinum with distinct pricing.
2. **Temporary Seat Locking Mechanism:**
   * When a user selects seats, the system temporarily locks them for 10 minutes.
   * During this lease, no other user can select or book these seats.
   * If checkout completes: seats transition to BOOKED permanently.
   * If checkout times out or fails: locks automatically expire and revert to AVAILABLE.
3. **Concurrency Requirement:**
   * Two users selecting the exact same seat simultaneously must be handled safely; exactly one user acquires the lock.
4. **Dynamic Show Pricing:**
   * Adjust pricing based on show time, weekend multipliers, and auditorium occupancy.`,
      versions: [
        {
          taskId: "LLDP4-P1-V1",
          taskName: "Version 1: Cinema Topology & Catalog Hierarchy",
          taskDescription: "Model cities, theaters, screens, shows, and seat tiers.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        },
        {
          taskId: "LLDP4-P1-V2",
          taskName: "Version 2: Temporary Seat Locking Mechanism",
          taskDescription: "Implement thread-safe temporary seat locks with TTL lease times.",
          targetTimeMinutes: 45,
          difficulty: "hard"
        },
        {
          taskId: "LLDP4-P1-V3",
          taskName: "Version 3: Payment Integration & Booking Confirmation",
          taskDescription: "Complete booking transaction and transition seats to booked state permanently.",
          targetTimeMinutes: 30,
          difficulty: "medium"
        },
        {
          taskId: "LLDP4-P1-V4",
          taskName: "Version 4: Timeout Compensation Engine",
          taskDescription: "Build background scheduler releasing expired locks safely.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP4-P1-V5",
          taskName: "Version 5: Dynamic Occupancy-Based Pricing",
          taskDescription: "Implement surge pricing strategies based on auditorium occupancy and showtime.",
          targetTimeMinutes: 30,
          difficulty: "medium"
        },
        {
          taskId: "LLDP4-P1-V6",
          taskName: "Version 6: Concurrent Stress Testing Suite",
          taskDescription: "Write multi-threaded test suite proving zero double-booking under race conditions.",
          targetTimeMinutes: 45,
          difficulty: "hard"
        },
        {
          taskId: "LLDP4-P1-V7",
          taskName: "Version 7: Comprehensive Design Review & Invariant Audit",
          taskDescription: "Audit lock granularity, deadlock avoidance, and thread synchronization boundaries.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        }
      ]
    },
    {
      taskId: "LLDP4-P2",
      taskName: "Problem 13 — Design a Ride-Sharing Dispatch Platform (Cab Booking)",
      difficulty: "hard",
      targetTime: "120 mins",
      taskPriority: "high",
      taskDescription: `## Problem 13 — Design a Ride-Sharing Dispatch Platform (Cab Booking)

* **Difficulty:** Hard
* **Target Time:** 120 minutes
* **Category:** Spatial Matchmaking, Trip Lifecycles & Dynamic Pricing

---

### 1. Real-World Context
Design the core dispatching and trip management engine for an on-demand mobility platform. The system manages drivers, riders, spatial coordinate matching, trip lifecycle state machines, driver acceptance timeouts, and dynamic surge pricing.

---

### 2. Functional Requirements
1. **Spatial Proximity Search:**
   * Search available drivers within radius R of the rider's pickup location.
2. **Trip State Lifecycle Machine:**
   * Requested -> DriverAssigned -> DriverArrived -> InProgress -> Completed / Cancelled.
3. **Dispatch & Acceptance Cascading:**
   * Offer trip to the nearest driver with 30-second acceptance lease.
   * If rejected or timed out: cascade trip offer to the next nearest driver.
4. **Dynamic Surge Pricing:**
   * Base fare + distance cost + time cost + dynamic surge multiplier.`,
      versions: [
        {
          taskId: "LLDP4-P2-V1",
          taskName: "Version 1: Spatial Domain & Matching",
          taskDescription: "Model riders, drivers, vehicles, and proximity search algorithms.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        },
        {
          taskId: "LLDP4-P2-V2",
          taskName: "Version 2: Trip State Machine Lifecycle",
          taskDescription: "Implement state pattern governing valid trip transitions and cancellations.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP4-P2-V3",
          taskName: "Version 3: Dynamic Fare & Surge Pricing",
          taskDescription: "Implement pluggable fare calculation with real-time surge multiplier.",
          targetTimeMinutes: 30,
          difficulty: "medium"
        },
        {
          taskId: "LLDP4-P2-V4",
          taskName: "Version 4: Driver Acceptance Timeout & Cascading",
          taskDescription: "Build timed dispatch cascade routing requests across nearest drivers.",
          targetTimeMinutes: 45,
          difficulty: "hard"
        },
        {
          taskId: "LLDP4-P2-V5",
          taskName: "Version 5: Requirement Change — Shared Pool Rides",
          taskDescription: "Support carpooling with route overlap matching and shared fare calculation.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP4-P2-V6",
          taskName: "Version 6: Design Review & Invariant Audit",
          taskDescription: "Evaluate driver availability concurrency, geohash precision, and trip cancellation safety.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        }
      ]
    },
    {
      taskId: "LLDP4-P3",
      taskName: "Problem 14 — Design a Chess Game Engine",
      difficulty: "hard",
      targetTime: "105 mins",
      taskPriority: "high",
      taskDescription: `## Problem 14 — Design a Chess Game Engine

* **Difficulty:** Hard
* **Target Time:** 105 minutes
* **Category:** Complex Domain Modeling & Game Rules Engine

---

### 1. Real-World Context
Design a complete, object-oriented 2-player chess game engine. The engine models the 8x8 chessboard, distinct movement and capture rules for all piece types, special moves (Castling, En Passant, Pawn Promotion), move validation, check/checkmate detection, and move history for undo.

---

### 2. Functional Requirements
1. **Board & Piece Hierarchy:**
   * 8x8 grid of Cells.
   * Polymorphic Pieces: King, Queen, Rook, Bishop, Knight, Pawn with Color (White/Black).
2. **Move Validation Rules:**
   * Each piece type defines its legal movement paths and attack vectors.
   * Path obstruction validation (knights jump; others cannot jump over obstacles).
3. **Special Chess Rules:**
   * Castling (Kingside and Queenside) with prerequisite validation.
   * En Passant capture for pawns.
   * Pawn Promotion upon reaching the 8th rank.
4. **Game State & Win Conditions:**
   * Check detection (King under attack).
   * Checkmate detection (King in check with no legal moves).
   * Stalemate detection (No legal moves and not in check).`,
      versions: [
        {
          taskId: "LLDP4-P3-V1",
          taskName: "Version 1: Board & Basic Piece Movements",
          taskDescription: "Model 8x8 board, piece inheritance, and standard movement contracts.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        },
        {
          taskId: "LLDP4-P3-V2",
          taskName: "Version 2: Path Obstruction & Capture Rules",
          taskDescription: "Implement move validation with path clearing and capture handling.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP4-P3-V3",
          taskName: "Version 3: Special Moves (Castling, En Passant, Promotion)",
          taskDescription: "Implement castling prerequisites, en passant temporal capture, and pawn promotion.",
          targetTimeMinutes: 45,
          difficulty: "hard"
        },
        {
          taskId: "LLDP4-P3-V4",
          taskName: "Version 4: Check & Checkmate Detection",
          taskDescription: "Build check scanner and evaluate game termination (Checkmate, Stalemate).",
          targetTimeMinutes: 45,
          difficulty: "hard"
        },
        {
          taskId: "LLDP4-P3-V5",
          taskName: "Version 5: Design Review & Invariant Audit",
          taskDescription: "Evaluate board state immutability for move simulation and undo mechanics.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        }
      ]
    },
    {
      taskId: "LLDP4-P4",
      taskName: "Problem 15 — Design a Food Ordering & Delivery Platform",
      difficulty: "hard",
      targetTime: "120 mins",
      taskPriority: "high",
      taskDescription: `## Problem 15 — Design a Food Ordering & Delivery Platform

* **Difficulty:** Hard
* **Target Time:** 120 minutes
* **Category:** Multi-Sided Marketplace & Event Tracking

---

### 1. Real-World Context
Design an on-demand food ordering platform. The platform connects three independent user types: Customers (browse menus, customize items, place orders), Restaurants (manage catalogs, accept orders, update preparation states), and Delivery Partners (accept delivery jobs, pick up meals, navigate to customer location).

---

### 2. Functional Requirements
1. **Restaurant & Menu Hierarchy:**
   * Restaurants have menus, sections, items, and customizable addons.
2. **Cart & Order Validation:**
   * Carts hold items from a single restaurant at a time.
   * Calculates subtotal, restaurant packaging charges, delivery fees, and taxes.
3. **Order Lifecycle Pipeline:**
   * Placed -> AcceptedByRestaurant -> Preparing -> ReadyForPickup -> OutForDelivery -> Delivered.
4. **Courier Assignment Engine:**
   * Match available nearby delivery partner when order status becomes ReadyForPickup.
5. **Real-time Event Broadcasting:**
   * Notify customer app on every order status transition using Observer pattern.`,
      versions: [
        {
          taskId: "LLDP4-P4-V1",
          taskName: "Version 1: Catalog & Cart Foundation",
          taskDescription: "Model restaurant menus, customizable items, and single-restaurant cart invariants.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        },
        {
          taskId: "LLDP4-P4-V2",
          taskName: "Version 2: Order Lifecycle State Machine",
          taskDescription: "Implement state machine governing kitchen prep and delivery milestones.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP4-P4-V3",
          taskName: "Version 3: Courier Assignment & Matchmaking",
          taskDescription: "Match delivery partners by proximity and track courier acceptance workflows.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP4-P4-V4",
          taskName: "Version 4: Promotional Engine & Dynamic Fees",
          taskDescription: "Implement promo voucher strategies and weather/demand delivery surge fees.",
          targetTimeMinutes: 30,
          difficulty: "medium"
        },
        {
          taskId: "LLDP4-P4-V5",
          taskName: "Version 5: Real-time Event Notifications",
          taskDescription: "Build event notification broker publishing updates to customer, driver, and restaurant.",
          targetTimeMinutes: 45,
          difficulty: "medium"
        },
        {
          taskId: "LLDP4-P4-V6",
          taskName: "Version 6: Design Review & Invariant Audit",
          taskDescription: "Audit order immutability, payment callbacks, and multi-actor state integrity.",
          targetTimeMinutes: 30,
          difficulty: "easy"
        }
      ]
    }
  ]
};

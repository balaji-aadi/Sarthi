import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatUnitDescription, formatDrillDescription, formatMajorProblemDescription, formatProblemVersionDescription } from './content_formatters.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PHASE4_REWRITE = {};

// ============================================================================
// MODULES (1)
// ============================================================================
PHASE4_REWRITE['LLDP4-M1'] = {
  taskName: 'Module 4.1: Handling Multiple Users at Once (Concurrency)',
  taskDescription: 'Learn how to protect data when multiple threads read and write at the exact same millisecond, and how to build high-scale production systems like BookMyShow and Uber.'
};

// ============================================================================
// LEARNING UNITS (2)
// ============================================================================

// Unit 4.1.1
PHASE4_REWRITE['LLDP4-U4.1.1'] = {
  taskName: 'Unit 4.1.1: What Happens When Two People Buy the Last Seat at the Same Second?',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'If two customers both click "Book Seat A1" at the exact same instant, how do you make sure only one customer gets the ticket, while the other is told the seat is taken, without corrupting the database?',
    seeItWithASmallExample: `Without synchronization:
// Thread 1 (Alice) checks: isAvailable(A1) -> Returns true!
// Thread 2 (Bob) checks:   isAvailable(A1) -> Returns true!
// Thread 1 books seat A1!
// Thread 2 books seat A1!
// Disaster: Both Alice and Bob got ticket A1!`,
    whatIsGoingWrong: 'This is a "Race Condition". Because the check and the booking are two separate steps, multiple threads interleave and both see outdated information, causing double-bookings and corrupted financial ledgers.',
    theSimpleIdea: 'Put a lock around the critical code. Only one thread is allowed inside the room at a time. The first thread locks the door, checks availability, books the seat, and unlocks the door. The second thread waits outside until the door unlocks, enters, and sees that the seat is already taken.',
    technicalWords: [
      { term: 'Race Condition', explanation: 'A bug where the outcome of a program depends on which thread happens to finish first.' },
      { term: 'Critical Section', explanation: 'The section of code that accesses shared data and must only be run by one thread at a time.' },
      { term: 'Mutex (Mutual Exclusion)', explanation: 'A lock object used to ensure only one thread can execute a critical section at a time.' },
      { term: 'Thread Safety', explanation: 'Code that functions correctly even when multiple threads execute it simultaneously.' }
    ],
    whyThisMattersInLLD: 'Ticketing platforms, banking ledgers, and ride-matching engines cannot survive without strict thread safety. This is a primary focus of senior LLD interviews.',
    tryIt: 'Create a shared counter variable. Have two threads increment it 100,000 times without a lock. See the final count come out wrong (e.g. 142,000 instead of 200,000). Now add `std::mutex` and watch it hit exactly 200,000.',
    nowChangeTheRequirement: 'Create a ThreadSafeQueue where a consumer thread waits until a producer thread pushes an item.',
    whatDidTheChangeTeachUs: 'Using a condition variable (`std::condition_variable`) allows threads to sleep efficiently without burning 100% CPU in a while loop.',
    canYouExplainIt: 'Can you explain why a fitting room in a clothing store has a lock on the door, and how that relates to a Mutex?'
  })
};

// Unit 4.1.2
PHASE4_REWRITE['LLDP4-U4.1.2'] = {
  taskName: 'Unit 4.1.2: Holding a Seat for 10 Minutes While the User Pays',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'When you select a movie seat on BookMyShow, the app holds it for you for 10 minutes while you enter your credit card. If you close your browser or your payment fails, how does the system release the seat back to other buyers automatically?',
    seeItWithASmallExample: `Temporary Hold Flow:
1. Alice selects Seat B4.
2. System sets status = "LOCKED" with expiration = current_time + 10 minutes.
3. If Alice pays within 10 minutes -> status = "BOOKED".
4. If 10 minutes elapse without payment -> system automatically unlocks B4 back to "AVAILABLE"!`,
    whatIsGoingWrong: 'If you lock the entire cinema theater just to hold one seat, no other customer can book any seat in the building (coarse locking). If you forget to clean up expired holds, seats become permanently stuck and unsold.',
    theSimpleIdea: 'Lock only the specific seat (fine-grained locking), and attach a time-to-live (TTL) lease. A background cleanup timer sweeps or checks expirations, automatically releasing any lease that has timed out.',
    technicalWords: [
      { term: 'Resource Lease', explanation: 'A temporary lock granted for a fixed period of time (e.g. 10 minutes).' },
      { term: 'TTL (Time-To-Live)', explanation: 'The duration after which a temporary hold expires automatically.' },
      { term: 'Lock Granularity', explanation: 'How much data a lock protects: locking the whole theater is Coarse; locking one seat is Fine-grained.' },
      { term: 'Compensating Action', explanation: 'An automatic rollback operation that releases reserved resources if a workflow fails or times out.' }
    ],
    whyThisMattersInLLD: 'Every major booking system (Airbnb, BookMyShow, Ticketmaster) relies on temporal leasing to prevent seat holding abuse while maximizing booking concurrency.',
    tryIt: 'Create a `SeatLockManager` where `lockSeat(seatId, userId, ttlSeconds)` stores a timestamp. Check if the seat is free after the TTL expires.',
    nowChangeTheRequirement: 'Bob tries to lock the same seat while Alice holds it. When Alice’s timer expires, Bob’s next attempt succeeds.',
    whatDidTheChangeTeachUs: 'The seat automatically became available without requiring human intervention or permanent database locks.',
    canYouExplainIt: 'Can you explain why a library holds a reserved book for 3 days before giving it to the next person in line?'
  })
};

// ============================================================================
// PRACTICAL DRILLS (2)
// ============================================================================

PHASE4_REWRITE['LLDP4-D4.1.1'] = {
  taskName: 'Thread-Safe Bounded Queue Implementation Drill',
  taskDescription: formatDrillDescription({
    title: 'Thread-Safe Bounded Queue Implementation Drill',
    problemStatement: 'Implement a thread-safe, bounded FIFO queue `BoundedQueue<T>` supporting multi-threaded concurrent producer and consumer access using explicit mutex locks and condition variables.',
    contextScenario: 'An async order logging engine needs a high-performance in-memory buffer. If the buffer is full, producers must wait. If the buffer is empty, consumers must wait without spinning the CPU.',
    startingPoint: 'Start from scratch. Implement BoundedQueue using `std::mutex` and `std::condition_variable`.',
    yourTask: `1. Implement \`BoundedQueue(size_t capacity)\`.
2. Implement \`void enqueue(T item)\`: if queue is full, block until space becomes available.
3. Implement \`T dequeue()\`: if queue is empty, block until an item is pushed.
4. Spawn 3 producer threads and 3 consumer threads, push 10,000 items, and verify zero data loss or deadlocks.`,
    apiInterface: `template <typename T>
class BoundedQueue {
private:
    std::queue<T> queue;
    size_t maxCapacity;
    std::mutex mtx;
    std::condition_variable notFull;
    std::condition_variable notEmpty;
public:
    explicit BoundedQueue(size_t capacity);
    void enqueue(T item);
    T dequeue();
    size_t size();
};`,
    inputInteractionModel: 'Producers and consumers concurrently call enqueue and dequeue.',
    expectedBehavior: 'All items produced are consumed exactly once in FIFO order without race conditions or memory corruption.',
    examples: 'Capacity 2: Producer enqueues 2 items; 3rd enqueue blocks until consumer dequeues 1 item.',
    constraintsAssumptions: 'Multi-threaded C++17 execution.',
    edgeCases: 'Spurious wakeups handled using condition variable wait predicates `[this] { return !queue.empty(); }`.',
    acceptanceCriteria: [
      'Zero race conditions or data loss under 10,000 concurrent operations.',
      'Blocking behavior verified when full and empty.',
      'Zero CPU spinning.'
    ],
    whatToObserve: 'Notice how condition variables put waiting threads to sleep so CPU usage remains near 0%.',
    thinkAbout: 'Why must condition variable wait statements always be wrapped in a while loop or predicate?'
  })
};

PHASE4_REWRITE['LLDP4-D4.1.2'] = {
  taskName: 'Expiring Lock Manager with Compensating Release',
  taskDescription: formatDrillDescription({
    title: 'Expiring Lock Manager with Compensating Release',
    problemStatement: 'Build a thread-safe `ExpiringLockManager` that issues temporary time-bounded leases on resource IDs (e.g. cinema seats), automatically releasing expired locks to competing threads if not confirmed.',
    contextScenario: 'In an online concert ticketing service, users select seats and have 10 minutes to pay. If payment fails or times out, the seat must revert to available immediately without leaving dangling locks.',
    startingPoint: 'Start from scratch. Implement ExpiringLockManager.',
    yourTask: `1. Implement \`bool acquireLock(string resourceId, string userId, int ttlSeconds)\`.
2. Implement \`bool releaseLock(string resourceId, string userId)\`.
3. Implement \`bool confirmLock(string resourceId, string userId)\` (makes lock permanent).
4. Implement automatic expiration: if TTL elapses, a competing user calling \`acquireLock()\` on the same resource succeeds.`,
    apiInterface: `class ExpiringLockManager {
public:
    bool acquireLock(const std::string& resourceId, const std::string& userId, int ttlSeconds);
    bool releaseLock(const std::string& resourceId, const std::string& userId);
    bool confirmLock(const std::string& resourceId, const std::string& userId);
    bool isLocked(const std::string& resourceId) const;
};`,
    inputInteractionModel: 'Threads attempt to acquire locks with simulated clock progression.',
    expectedBehavior: 'Resource is locked exclusively to userId. When TTL expires, other threads can acquire it immediately.',
    examples: 'Alice locks Seat #1 for 5s. Bob fails. 6s later, Bob succeeds.',
    constraintsAssumptions: 'Thread-safe in-memory map protected by mutex.',
    edgeCases: 'Releasing a lock owned by another user is rejected.',
    acceptanceCriteria: [
      'Atomic lock acquisition.',
      'Expired locks automatically treated as vacant.',
      'Zero thread deadlocks.'
    ],
    whatToObserve: 'Notice how combining timestamps with mutex locks creates self-cleaning resource management.',
    thinkAbout: 'How would you scale this to multiple server nodes? (Hint: Redis Distributed Lock / Redlock).'
  })
};

// ============================================================================
// MAJOR PROBLEMS (4) & VERSIONS (24)
// ============================================================================

// Problem 12: BookMyShow (P1)
PHASE4_REWRITE['LLDP4-P1'] = {
  taskName: 'Problem 12 — Design BookMyShow (Movie Booking & Seat Locking)',
  taskDescription: formatMajorProblemDescription({
    contextScenario: 'Design the core ticketing and reservation engine for an online cinema ticketing platform managing city catalogs, cinema theaters, screens, scheduled movie shows, seat tiers, concurrent temporary seat locking, and payment timeouts.',
    functionalRequirements: [
      'Cinema Topology: City -> Cinema Theaters -> Screens -> Shows -> Seats.',
      'Seat Tiers: Silver, Gold, Platinum with tiered pricing.',
      'Temporary Seat Locking: Hold selected seats for 10 minutes during checkout. Prevent other users from booking locked seats.',
      'Payment & Confirmation: Completing checkout transitions seats to BOOKED permanently; payment timeout reverts seats to AVAILABLE automatically.'
    ],
    operationsApi: [
      'std::vector<Show> searchShows(const std::string& city, const std::string& movieTitle);',
      'std::vector<Seat> getShowSeats(const std::string& showId);',
      'LockResult lockSeats(const std::string& showId, const std::vector<std::string>& seatIds, const std::string& userId);',
      'Booking confirmBooking(const std::string& lockId, const PaymentDetails& payment);'
    ],
    expectedBehavior: 'Concurrent attempts to lock the same seat result in exactly one winner. Unpaid seat locks expire after 10 minutes and become bookable again.',
    examplesScenarios: `Scenario 1: Concurrent Seat Contention
User A and User B simultaneously click "Lock Seat A1".
Result: User A succeeds (Lock #L-101 created). User B receives SeatAlreadyLockedException.`,
    constraintsAssumptions: ['Thread-safe in-memory simulation with simulated clock.', 'Integer currency cents.'],
    edgeCasesErrorHandling: ['Locking seats across multiple shows in a single transaction is rejected.', 'Payment arriving after 10-minute timeout is rejected and refunded.'],
    stateLifecycleRules: 'Seat states: AVAILABLE -> TEMPORARILY_LOCKED -> BOOKED.',
    acceptanceCriteria: ['Zero double-bookings under concurrent stress.', 'Accurate 10-minute timeout compensation.'],
    whatYouNeedToImplement: 'Implement Cinema, Screen, Show, SeatLockManager, and BookingService classes in C++.'
  })
};

PHASE4_REWRITE['LLDP4-P1-V1'] = {
  taskName: 'Version 1: Cinema Topology & Catalog Hierarchy',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Baseline cinema catalog hierarchy (City -> Theater -> Screen -> Movie -> Show -> Seats).',
    whyOldDesignStruggles: 'N/A — initial baseline.',
    newRequirements: ['Model multi-theater city topology.', 'Search shows by city and movie.', 'View seat layout.'],
    observableBehavior: 'Returns available shows and seats for a selected movie in a city.',
    examples: 'Query "Inception" in "New York" returns AMC Theater Screen 1 Show 7:00 PM.',
    acceptanceCriteria: ['Clean topology representation.']
  })
};

PHASE4_REWRITE['LLDP4-P1-V2'] = {
  taskName: 'Version 2: Temporary Seat Locking Mechanism',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added 10-minute temporary seat locking to prevent double-booking during checkout.',
    whyOldDesignStruggles: 'Without temporary locks, two users can start paying for the same seat simultaneously.',
    newRequirements: ['Lock seats exclusively for 10 minutes.', 'Prevent competing users from selecting locked seats.'],
    observableBehavior: 'User A locks A1; User B receives SeatLockedException.',
    examples: 'Seat A1 locked for 10 minutes.',
    acceptanceCriteria: ['Exclusive temporary locking enforced.']
  })
};

PHASE4_REWRITE['LLDP4-P1-V3'] = {
  taskName: 'Version 3: Payment Integration & Booking Confirmation',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added payment confirmation step that transitions locked seats to permanently BOOKED.',
    whyOldDesignStruggles: 'Locks must be confirmed by successful payment gateway response.',
    newRequirements: ['Process payment for locked seats.', 'Generate booking confirmation ID and ticket receipt.'],
    observableBehavior: 'Successful payment transitions seat to BOOKED permanently.',
    examples: 'Pay $30 for locked seats -> Booking confirmed.',
    acceptanceCriteria: ['Seats marked booked; receipt generated.']
  })
};

PHASE4_REWRITE['LLDP4-P1-V4'] = {
  taskName: 'Version 4: Timeout Compensation Engine',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added automatic expiration: if user does not pay within 10 minutes, lock is freed automatically.',
    whyOldDesignStruggles: 'Abandoned checkouts previously left seats locked indefinitely.',
    newRequirements: ['Background lease expiration check.', 'Revert expired locks back to AVAILABLE.'],
    observableBehavior: 'Seat locked at 10:00 AM automatically becomes available at 10:10:01 AM.',
    examples: 'Abandoned lock frees seat for other buyers.',
    acceptanceCriteria: ['Zero abandoned permanent locks.']
  })
};

PHASE4_REWRITE['LLDP4-P1-V5'] = {
  taskName: 'Version 5: Dynamic Occupancy-Based Pricing',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added dynamic surge pricing: as theater fills up (e.g. >80% booked), remaining seat prices increase.',
    whyOldDesignStruggles: 'Static seat prices fail to maximize revenue during blockbuster premieres.',
    newRequirements: ['Calculate real-time occupancy percentage.', 'Apply 20% price surge when occupancy > 80%.'],
    observableBehavior: 'Ticket price increases from $10 to $12 when show is almost full.',
    examples: 'Last 10 seats priced at dynamic surge rate.',
    acceptanceCriteria: ['Dynamic pricing applied accurately.']
  })
};

PHASE4_REWRITE['LLDP4-P1-V6'] = {
  taskName: 'Version 6: Concurrent Stress Testing Suite',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Spawn 50 concurrent threads attempting to book the same 5 hot premiere seats.',
    whyOldDesignStruggles: 'Validates thread safety under race conditions.',
    newRequirements: ['Multi-threaded concurrent booking harness.', 'Zero duplicate tickets issued.'],
    observableBehavior: 'Exactly 5 threads successfully book; 45 receive lock failure gracefully.',
    examples: '50 threads race for 5 seats -> Exactly 5 succeed.',
    acceptanceCriteria: ['100% race condition protection verified.']
  })
};

PHASE4_REWRITE['LLDP4-P1-V7'] = {
  taskName: 'Version 7: Comprehensive Design Review & Invariant Audit',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Final architectural review of BookMyShow system.',
    whyOldDesignStruggles: 'Validates complete ticketing lifecycle and lock invariants.',
    newRequirements: ['Full audit of lock timeouts, payments, and catalog navigation.'],
    observableBehavior: 'All booking workflows pass deterministically.',
    examples: '100% test pass across catalog, locking, and payments.',
    acceptanceCriteria: ['Clean separation between Topology, LockManager, and BookingService.'],
    designReviewNote: 'In post-attempt review: observe how separating seat locking from booking persistence ensured high concurrency without database bottlenecks.'
  })
};

// Problem 13: Uber / Cab Booking (P2)
PHASE4_REWRITE['LLDP4-P2'] = {
  taskName: 'Problem 13 — Design a Ride-Sharing Dispatch Platform (Cab Booking)',
  taskDescription: formatMajorProblemDescription({
    contextScenario: 'Design a ride-sharing dispatch platform (like Uber or Lyft) that tracks real-time driver locations, matches riders with nearby drivers, manages trip lifecycles, and computes dynamic surge pricing.',
    functionalRequirements: [
      'Spatial Location Tracking: Drivers periodically update their (latitude, longitude) coordinates.',
      'Trip Request & Matching: Rider requests ride; system finds nearest available driver within 5km radius.',
      'Driver Dispatch & Acceptance: Driver has 30 seconds to accept. If rejected or timed out, system cascades to next nearest driver.',
      'Trip Lifecycle & Billing: START -> IN_TRANSIT -> COMPLETED. Calculate fare based on distance, duration, and dynamic surge multiplier.'
    ],
    operationsApi: [
      'void updateDriverLocation(const std::string& driverId, double lat, double lon);',
      'TripRequest requestRide(const std::string& riderId, Location pickup, Location dropoff, RideType type);',
      'void driverRespond(const std::string& tripId, const std::string& driverId, bool accept);',
      'TripReceipt endTrip(const std::string& tripId);'
    ],
    expectedBehavior: 'Rider is matched with nearest eligible driver. Driver rejection automatically cascades to the next closest driver.',
    examplesScenarios: `Scenario 1: Driver Cascading
Rider requests ride at (0, 0).
Nearest Driver D1 (1km away) is offered ride -> D1 rejects.
System automatically dispatches to Driver D2 (2km away) -> D2 accepts!`,
    constraintsAssumptions: ['In-memory spatial index (e.g. QuadTree or GeoHash grid).', 'Simulated timer for 30s acceptance window.'],
    edgeCasesErrorHandling: ['No drivers within 5km throws NoDriversAvailableException.', 'Rider canceling after driver accepted charges cancellation fee.'],
    stateLifecycleRules: 'Trip states: REQUESTED -> MATCHING -> ACCEPTED -> ARRIVED -> IN_PROGRESS -> COMPLETED.',
    acceptanceCriteria: ['Accurate spatial distance matching.', 'Driver timeout cascading works reliably.'],
    whatYouNeedToImplement: 'Implement Rider, Driver, Location, SpatialIndex, and DispatchService classes in C++.'
  })
};

PHASE4_REWRITE['LLDP4-P2-V1'] = {
  taskName: 'Version 1: Spatial Domain & Matching',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Baseline location tracking and nearest driver Euclidean distance matching.',
    whyOldDesignStruggles: 'N/A — initial baseline.',
    newRequirements: ['Track driver coordinates.', 'Find nearest available driver using Euclidean distance.'],
    observableBehavior: 'Rider request matches driver with minimum distance.',
    examples: 'Driver A at 2km, Driver B at 5km -> Driver A selected.',
    acceptanceCriteria: ['Nearest driver resolved accurately.']
  })
};

PHASE4_REWRITE['LLDP4-P2-V2'] = {
  taskName: 'Version 2: Trip State Machine Lifecycle',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Enforced trip state machine (REQUESTED -> ACCEPTED -> IN_PROGRESS -> COMPLETED).',
    whyOldDesignStruggles: 'Without a state machine, trips could be ended before they started or cancelled after completion.',
    newRequirements: ['Model trip lifecycle states.', 'Reject illegal state transitions.'],
    observableBehavior: 'Calling endTrip on unaccepted ride throws InvalidTripStateException.',
    examples: 'Trip moves from Accepted to In_Progress when driver starts trip.',
    acceptanceCriteria: ['Strict state transitions enforced.']
  })
};

PHASE4_REWRITE['LLDP4-P2-V3'] = {
  taskName: 'Version 3: Dynamic Fare & Surge Pricing',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added dynamic surge pricing based on real-time rider demand vs driver supply in local zone.',
    whyOldDesignStruggles: 'Fixed fares do not balance supply and demand during rush hours.',
    newRequirements: ['Calculate surge multiplier (e.g. 1.5x) based on ratio of riders to drivers in zone.', 'Compute fare = (base + distance*rate + time*rate) * surge.'],
    observableBehavior: 'High demand area charges 1.8x normal fare.',
    examples: 'Base $10 fare becomes $18 under 1.8x surge.',
    acceptanceCriteria: ['Surge multiplier calculated dynamically.']
  })
};

PHASE4_REWRITE['LLDP4-P2-V4'] = {
  taskName: 'Version 4: Driver Acceptance Timeout & Cascading',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added 30-second driver acceptance timeout with cascading fallback to next nearest driver.',
    whyOldDesignStruggles: 'If a driver ignores the ride request, the rider was stuck waiting forever.',
    newRequirements: ['Offer ride to Driver 1 with 30s timeout.', 'If timed out or rejected, automatically offer to Driver 2.'],
    observableBehavior: 'Driver 1 timeout immediately pings Driver 2 without rider re-requesting.',
    examples: 'Timeout cascades seamlessly to next closest driver.',
    acceptanceCriteria: ['Cascading dispatch operates automatically.']
  })
};

PHASE4_REWRITE['LLDP4-P2-V5'] = {
  taskName: 'Version 5: Requirement Change — Shared Pool Rides',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added shared rides (UberPool) where two riders with overlapping routes share the same cab.',
    whyOldDesignStruggles: 'Single-rider assumption breaks when a cab can have multiple pickups and dropoffs.',
    newRequirements: ['Support up to 2 riders in same vehicle if route overlap > 70%.', 'Split fares with discount.'],
    observableBehavior: 'Driver picks up Rider A, stops to pick up Rider B, drops off A, then drops off B.',
    examples: 'Both riders pay 30% discounted fare.',
    acceptanceCriteria: ['Multi-rider trip route optimization works cleanly.']
  })
};

PHASE4_REWRITE['LLDP4-P2-V6'] = {
  taskName: 'Version 6: Design Review & Invariant Audit',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Final architectural review of Ride-Sharing platform.',
    whyOldDesignStruggles: 'Validates spatial indexing, cascading timeouts, and pooled trips.',
    newRequirements: ['Full integration test with 100 drivers and 50 concurrent ride requests.'],
    observableBehavior: 'All trips dispatched and completed with zero deadlocks.',
    examples: '100% test pass across all dispatch flows.',
    acceptanceCriteria: ['Clean separation between SpatialIndex, Dispatcher, and TripLifecycle.'],
    designReviewNote: 'In post-attempt review: examine how the State pattern governed the trip lifecycle and how Strategy decoupled the surge pricing formula.'
  })
};

// Problem 14: Chess Game Engine (P3)
PHASE4_REWRITE['LLDP4-P3'] = {
  taskName: 'Problem 14 — Design a Chess Game Engine',
  taskDescription: formatMajorProblemDescription({
    contextScenario: 'Design an extensible in-memory Chess game engine supporting all standard 8x8 rules, piece movements (Pawn, Knight, Bishop, Rook, Queen, King), path obstruction, captures, check/checkmate detection, and special moves.',
    functionalRequirements: [
      'Board & Pieces: 8x8 board with standard starting piece setup.',
      'Move Validation: Validate piece movement geometry and path obstruction (Knight leaps; Rook, Bishop, Queen require clear path).',
      'Special Moves: Pawn double-step, En Passant, Castling (kingside/queenside), and Pawn Promotion.',
      'Game State: Detect In Check, Checkmate, and Stalemate.'
    ],
    operationsApi: [
      'void initializeBoard();',
      'bool makeMove(PlayerColor turn, Position from, Position to);',
      'bool isKingInCheck(PlayerColor color) const;',
      'GameResult getGameStatus() const;'
    ],
    expectedBehavior: 'Only legal moves are permitted. Moves that leave the player’s King in check are rejected. Checkmate terminates the game.',
    examplesScenarios: `Scenario 1: Scholar's Mate
White executes 4-move checkmate -> System detects Black King has no legal escape and is in check -> Game status transitions to WHITE_WINNER.`,
    constraintsAssumptions: ['Standard FIDE chess rules.', 'In-memory board representation.'],
    edgeCasesErrorHandling: ['Moving out of turn throws InvalidTurnException.', 'Moving through occupied path for Bishop/Rook throws PathObstructedException.'],
    stateLifecycleRules: 'Game states: ACTIVE -> CHECK -> CHECKMATE / STALEMATE.',
    acceptanceCriteria: ['All piece movements verified.', 'Accurate Check and Checkmate detection.'],
    whatYouNeedToImplement: 'Implement Board, Piece hierarchy (Pawn, Knight, etc.), MoveValidator, and ChessGame classes in C++.'
  })
};

PHASE4_REWRITE['LLDP4-P3-V1'] = {
  taskName: 'Version 1: Board & Basic Piece Movements',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Baseline 8x8 board and basic geometric moves for Rook, Bishop, Knight, and King.',
    whyOldDesignStruggles: 'N/A — initial baseline.',
    newRequirements: ['8x8 grid.', 'Validate step geometry (e.g. Rook moves straight, Bishop diagonally).'],
    observableBehavior: 'Rook moves horizontally; diagonal move rejected.',
    examples: 'Rook at (0,0) moves to (0,5).',
    acceptanceCriteria: ['Geometric move validation working.']
  })
};

PHASE4_REWRITE['LLDP4-P3-V2'] = {
  taskName: 'Version 2: Path Obstruction & Capture Rules',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added path obstruction checks and capturing rules.',
    whyOldDesignStruggles: 'Rooks and Bishops were jumping over pieces like Knights.',
    newRequirements: ['Verify all intermediate cells between source and destination are empty.', 'Allow landing on enemy piece to capture.'],
    observableBehavior: 'Rook cannot move past a friendly pawn.',
    examples: 'Rook at (0,0) blocked by Pawn at (0,1).',
    acceptanceCriteria: ['Path obstruction enforced for sliding pieces.']
  })
};

PHASE4_REWRITE['LLDP4-P3-V3'] = {
  taskName: 'Version 3: Special Moves (Castling, En Passant, Promotion)',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added Castling, En Passant pawn captures, and Pawn Promotion.',
    whyOldDesignStruggles: 'Standard basic moves do not cover FIDE special rules.',
    newRequirements: ['Kingside and queenside castling (neither King nor Rook has moved; path clear and unthreatened).', 'Pawn reaching 8th rank promotes to Queen/Rook/Bishop/Knight.', 'En Passant capture.'],
    observableBehavior: 'Castling moves both King and Rook atomically.',
    examples: 'White King at e1 castles with Rook at h1 -> King to g1, Rook to f1.',
    acceptanceCriteria: ['Special moves strictly enforced.']
  })
};

PHASE4_REWRITE['LLDP4-P3-V4'] = {
  taskName: 'Version 4: Check & Checkmate Detection',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Implemented King In Check, Checkmate, and Stalemate detection.',
    whyOldDesignStruggles: 'Without check detection, kings can be captured or players can make illegal self-check moves.',
    newRequirements: ['Detect if King is under attack.', 'Reject any move that leaves own King in check.', 'Checkmate detected when in check with zero legal escape moves.'],
    observableBehavior: 'Move that does not resolve check is rejected.',
    examples: 'King in check must move, block, or capture attacker.',
    acceptanceCriteria: ['Check and Checkmate accurately evaluated.']
  })
};

PHASE4_REWRITE['LLDP4-P3-V5'] = {
  taskName: 'Version 5: Design Review & Invariant Audit',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Final architectural review of Chess Game Engine.',
    whyOldDesignStruggles: 'Validates move history, stalemate rules, and performance.',
    newRequirements: ['Replay classic grandmaster games verifying 100% rule fidelity.'],
    observableBehavior: 'Full game simulation passes all legal moves and ends at checkmate.',
    examples: '100% test pass on standard chess test suites.',
    acceptanceCriteria: ['Clean polymorphism across Piece hierarchy; zero rules leaking into UI.'],
    designReviewNote: 'In post-attempt review: examine how polymorphic `Piece::getPossibleMoves()` kept the board engine clean and extensible.'
  })
};

// Problem 15: Swiggy / Food Ordering (P4)
PHASE4_REWRITE['LLDP4-P4'] = {
  taskName: 'Problem 15 — Design a Food Ordering & Delivery Platform',
  taskDescription: formatMajorProblemDescription({
    contextScenario: 'Design an end-to-end food ordering and delivery system (like Swiggy or DoorDash) managing restaurant menus, shopping carts, order lifecycles, delivery courier dispatch, promotional vouchers, and real-time tracking.',
    functionalRequirements: [
      'Restaurant Catalog: Restaurants manage menus partitioned by categories and dietary tags.',
      'Cart & Ordering: Customer adds items from a single restaurant to cart and places order.',
      'Order Lifecycle State Machine: PLACED -> RESTAURANT_ACCEPTED -> PREPARING -> READY_FOR_PICKUP -> OUT_FOR_DELIVERY -> DELIVERED.',
      'Courier Assignment: When food is preparing, assign the nearest available delivery courier.',
      'Promotions & Fees: Apply promo vouchers and dynamic delivery fee based on distance.'
    ],
    operationsApi: [
      'Cart addToCart(const std::string& customerId, const std::string& restaurantId, const std::string& itemId, int qty);',
      'Order placeOrder(const std::string& customerId, const PaymentDetails& payment);',
      'void updateOrderStatus(const std::string& orderId, OrderStatus newStatus);',
      'void assignCourier(const std::string& orderId, const std::string& courierId);'
    ],
    expectedBehavior: 'Order transitions through strict lifecycle states. Courier is dispatched to restaurant when food is ready. Cart items must belong to only one restaurant at a time.',
    examplesScenarios: `Scenario 1: Happy Path Order
1. Customer adds 2 Burgers from Shake Shack.
2. Customer pays -> Order PLACED.
3. Restaurant accepts -> PREPARING.
4. Courier assigned -> OUT_FOR_DELIVERY -> DELIVERED.`,
    constraintsAssumptions: ['In-memory execution with integer cents.'],
    edgeCasesErrorHandling: ['Adding items from two different restaurants clears cart or prompts user confirmation.', 'Order cancellation after preparation begins incurs cancellation fee.'],
    stateLifecycleRules: 'Order status transitions strictly sequentially.',
    acceptanceCriteria: ['Single-restaurant cart invariant defended.', 'Courier dispatch coordinates with kitchen preparation.'],
    whatYouNeedToImplement: 'Implement Restaurant, MenuItem, Cart, Order, Courier, and DeliveryService classes in C++.'
  })
};

PHASE4_REWRITE['LLDP4-P4-V1'] = {
  taskName: 'Version 1: Catalog & Cart Foundation',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Baseline restaurant menu catalog and shopping cart.',
    whyOldDesignStruggles: 'N/A — initial baseline.',
    newRequirements: ['Browse restaurant menus.', 'Add items to cart and compute subtotal.'],
    observableBehavior: 'Cart calculates total item price accurately.',
    examples: 'Add 2 Pizzas ($15 each) -> Cart subtotal = $30.',
    acceptanceCriteria: ['Cart accurately tallies items.']
  })
};

PHASE4_REWRITE['LLDP4-P4-V2'] = {
  taskName: 'Version 2: Order Lifecycle State Machine',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Enforced order lifecycle state machine (Placed -> Accepted -> Cooking -> Ready -> Delivered).',
    whyOldDesignStruggles: 'Unregulated status updates allowed delivering orders before restaurant accepted them.',
    newRequirements: ['Enforce sequential state transitions.', 'Notify customer on each transition.'],
    observableBehavior: 'Order transitions sequentially through all states.',
    examples: 'Cannot transition from Placed directly to Delivered.',
    acceptanceCriteria: ['Strict lifecycle transitions enforced.']
  })
};

PHASE4_REWRITE['LLDP4-P4-V3'] = {
  taskName: 'Version 3: Courier Assignment & Matchmaking',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added delivery courier tracking and automated assignment to orders when food is ready.',
    whyOldDesignStruggles: 'Manual assignment fails at high order volumes.',
    newRequirements: ['Track courier availability.', 'Assign nearest courier when order status reaches PREPARING.'],
    observableBehavior: 'Nearest free courier assigned to pick up order.',
    examples: 'Courier 5 minutes away assigned to Shake Shack order.',
    acceptanceCriteria: ['Automated courier matchmaking operational.']
  })
};

PHASE4_REWRITE['LLDP4-P4-V4'] = {
  taskName: 'Version 4: Promotional Engine & Dynamic Fees',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added promotional discount codes (e.g. 20% off) and distance-based delivery fees.',
    whyOldDesignStruggles: 'Fixed delivery fees cause financial losses on long-distance deliveries.',
    newRequirements: ['Apply percentage and flat promo codes.', 'Compute delivery fee = $2 base + $1 per km.'],
    observableBehavior: 'Order for delivery 5km away charges $7 delivery fee.',
    examples: 'Bill = Subtotal - Promo + Delivery Fee.',
    acceptanceCriteria: ['Promo codes and delivery fees calculated accurately.']
  })
};

PHASE4_REWRITE['LLDP4-P4-V5'] = {
  taskName: 'Version 5: Real-time Event Notifications',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added real-time notification broadcasting to Customer, Restaurant, and Courier apps.',
    whyOldDesignStruggles: 'Hardcoding push notifications in the order service tightly couples business logic to notification SDKs.',
    newRequirements: ['Publish order state change events.', 'Subscribers (Customer App, Courier App, Analytics) react automatically.'],
    observableBehavior: 'State change to "OUT_FOR_DELIVERY" triggers SMS and push notification to customer.',
    examples: 'Customer receives real-time delivery update.',
    acceptanceCriteria: ['Observer pattern decouples notifications from core order engine.']
  })
};

PHASE4_REWRITE['LLDP4-P4-V6'] = {
  taskName: 'Version 6: Design Review & Invariant Audit',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Final architectural review of Food Ordering & Delivery Platform.',
    whyOldDesignStruggles: 'Validates multi-party coordination under high volume.',
    newRequirements: ['Comprehensive simulation test with 50 restaurants, 200 couriers, and 500 simultaneous orders.'],
    observableBehavior: 'All orders fulfilled cleanly with zero lost state.',
    examples: '100% test pass across all ordering and delivery workflows.',
    acceptanceCriteria: ['Clean separation between Catalog, Cart, OrderStateMachine, and CourierMatchmaker.'],
    designReviewNote: 'In post-attempt review: examine how the State pattern governed the order workflow and how Observer handled multi-app push notifications cleanly.'
  })
};

fs.writeFileSync(path.resolve(__dirname, 'phase4_rewritten_data.json'), JSON.stringify(PHASE4_REWRITE, null, 2));
console.log(`✓ Phase 4 successfully generated: ${Object.keys(PHASE4_REWRITE).length} records authored.`);

/**
 * Curated, Problem-Specific Specifications for all 15 Major LLD Problems
 * 10-Section LeetCode-Grade Structure
 * Strict Zero-Spoiler Rule: No design pattern names (Strategy, State, Factory, etc.)
 */

export const MAJOR_PROBLEMS_CONTENT_MAP = {
  // Problem 1: Vending Machine
  "LLDP1-P1": {
    context: "A commercial automated vending machine operates in public transit hubs, serving cold drinks, snacks, and hot coffee. The machine must autonomously handle currency insertion, item selection, exact change dispensing, real-time inventory deduction, and transaction cancellations without human attendant intervention.",
    functionalRequirements: [
      "Catalog Management: Maintain inventory across multiple shelf slots with unique slot codes (e.g. A1, B2), distinct item names, unit prices, and quantities.",
      "Currency Handling: Accept physical currency in defined coin denominations (1, 5, 10, 25 cents) and bills ($1, $5). Maintain an internal cash float for dispensing change.",
      "Transaction Workflow: User inserts currency -> selects slot code -> system verifies stock and balance -> dispenses product -> returns exact change.",
      "Cancellation & Refund: User may cancel at any point prior to dispensing; system refunds all inserted currency and returns to idle.",
      "Maintenance Operations: Authorize maintenance technician to restock items and replenish cash float."
    ],
    coreOperationsApi: [
      "void insertCurrency(Coin coin); // Accepts coin and increments active balance",
      "void insertNote(Note note); // Accepts bill and increments active balance",
      "Item selectSlot(string slotCode); // Verifies slot validity, stock, and price",
      "DispenseResult dispense(); // Dispenses item and calculates change; deducts inventory",
      "vector<Currency> cancelTransaction(); // Refunds full inserted balance and resets machine",
      "void restock(string slotCode, Item item, int quantity); // Maintenance stock addition",
      "void loadCashFloat(map<Currency, int> coins); // Maintenance cash replenish"
    ],
    expectedBehavior: "All state transitions must be deterministic. If an item costs $1.25 and user inserts $2.00, selecting the slot must transition the machine to ready-to-dispense, deduct item count by 1, dispense the product, and return exactly $0.75 in change.",
    examplesScenarios: "Scenario 1: Happy Path\n1. User inserts $1 bill, inserts 25¢ coin (Total balance: $1.25).\n2. User selects slot 'A1' (Soda, Price: $1.25, Stock: 5).\n3. Machine dispenses Soda. Change returned: $0.00. Stock becomes 4.\n\nScenario 2: Insufficient Change Invariant\n1. User inserts $5 bill for $1.00 water.\n2. Machine cash float only has $1 bills (no quarters or dimes) and cannot form $4.00 change.\n3. Machine alerts 'Exact Change Required', rejects $5 bill, returns full refund, and preserves inventory.",
    constraintsAssumptions: [
      "Financial calculations must be done in integer cents (e.g. $1.25 = 125 cents) to prevent floating-point rounding drift.",
      "Single-threaded in-memory execution model for core interview scope.",
      "Physical dispenser hardware failure is simulated via return status."
    ],
    edgeCasesErrorHandling: [
      "Selecting an empty slot: throw OutOfStockException and keep user balance intact.",
      "Selecting an invalid slot code (e.g. 'Z9'): throw InvalidSlotException.",
      "Calling dispense() before inserting enough money: throw InsufficientBalanceException.",
      "Machine unable to return exact change: abort transaction, refund inserted money, throw InsufficientChangeException."
    ],
    stateLifecycleRules: "The machine transitions through strict states: IDLE -> ACCEPTING_CURRENCY -> ITEM_SELECTED -> DISPENSING -> REFUNDING. Direct external mutation of machine states is forbidden; state transitions occur strictly through domain operations.",
    acceptanceCriteria: [
      "100% test coverage over cash float change calculations.",
      "Inventory never becomes negative.",
      "Financial totals are invariant: insertedMoney == itemPrice + returnedChange.",
      "Clean separation between hardware interfaces, domain models, and cash register."
    ],
    whatYouNeedToImplement: "Implement the vending machine system described above, including item selection, inventory tracking, payment processing, change calculation, and refund operations in clean C++. Write a self-contained test suite verifying all 5 test scenarios."
  },

  // Problem 5: Multi-Floor Parking Lot
  "LLDP2-P1": {
    context: "A commercial shopping mall operates a multi-floor parking facility with multiple entry and exit gates. The facility needs an automated parking management system to govern vehicle entry, spot allocation across floors, ticketing, dynamic hourly billing, and real-time floor display boards without human attendant bottlenecks.",
    functionalRequirements: [
      "Vehicle & Spot Categorization: Support Motorcycle, Car, and Large Truck. Maintain Small, Compact, and Large spots. Enforce fit rules: Motorcycle fits any spot; Car fits Compact or Large; Truck fits only Large.",
      "Multi-Floor Architecture: Support F floors, each containing S designated spots partitioned by size.",
      "Entry Processing: Vehicle arrives at an entry gate; system finds an available spot matching vehicle size, reserves it, and issues an immutable ParkingTicket with timestamp.",
      "Exit Processing & Billing: Vehicle presents ticket at an exit gate; system computes parking fee based on duration and vehicle rate, accepts payment, and frees the spot.",
      "Real-time Display Boards: Each floor has a display board indicating remaining available spots per category, updated immediately upon spot reservation or release."
    ],
    coreOperationsApi: [
      "ParkingTicket parkVehicle(Vehicle vehicle, Gate entryGate); // Finds spot, issues ticket",
      "Receipt unparkVehicle(ParkingTicket ticket, Gate exitGate, PaymentDetails payment); // Releases spot, calculates bill",
      "int getAvailableCount(int floorNumber, SpotType spotType); // Query floor occupancy"
    ],
    expectedBehavior: "When a Car enters, the system locates the nearest available Compact (or Large) spot on the lowest possible floor, increments floor occupancy, updates display boards, and prints a ticket. Upon exit 2 hours later, the spot is freed and a $10 receipt is generated.",
    examplesScenarios: "Scenario 1: Entry & Spot Fit\n1. Compact car arrives at Entry Gate 1.\n2. System checks Floor 1: 0 compact spots, 2 large spots. Floor 2: 5 compact spots.\n3. System assigns Floor 1 Large Spot (or Floor 2 Compact per allocation rules).\n4. Ticket #T-101 generated with spot reference F1-L02.\n\nScenario 2: Full Facility Rejection\n1. Large truck arrives.\n2. All Large spots across all floors are occupied.\n3. System immediately rejects entry with ParkingLotFullException; no ticket is created.",
    constraintsAssumptions: [
      "In-memory simulation with deterministic clock timestamps for duration calculation.",
      "Single spot cannot be double-assigned to two vehicles.",
      "Vehicle registration numbers are unique alphanumeric strings."
    ],
    edgeCasesErrorHandling: [
      "Attempting to unpark with an invalid, fake, or already-settled ticket: throw InvalidTicketException.",
      "Vehicle size larger than available spot sizes: throw ParkingLotFullException.",
      "Negative parking duration or clock tampering: clamp duration to zero or throw InvalidDurationException.",
      "Concurrent gate entries targeting the last available spot: atomic reservation ensures only one vehicle succeeds."
    ],
    stateLifecycleRules: "Spot lifecycle: VACANT -> RESERVED -> OCCUPIED -> VACANT. Ticket lifecycle: ACTIVE -> PAID -> CLOSED. Tickets cannot be modified after creation.",
    acceptanceCriteria: [
      "Motorcycles never block Trucks when Small spots are vacant.",
      "Floor display boards reflect exact counts before and after every vehicle movement.",
      "Billing calculations accurately apply rate schedules (first hour free, subsequent hours tiered).",
      "Zero vehicle-to-spot mismatch violations."
    ],
    whatYouNeedToImplement: "Implement the parking management system described above, including vehicle entry, spot allocation, ticketing, billing, exit processing, and availability tracking in clean C++. Implement unit tests verifying spot sizing, entry, exit, and multi-floor counts."
  },

  // Problem 2: Tic Tac Toe
  "LLDP1-P2": {
    context: "An interactive in-memory game engine for Tic Tac Toe that generalizes beyond the classic 3x3 board to support an N x N grid with M players taking sequential turns with unique piece symbols.",
    functionalRequirements: [
      "Dynamic Grid: Support arbitrary board size N x N (default 3x3).",
      "Multi-Player Support: Support 2 or more players taking turns in round-robin order.",
      "Move Validation: Ensure coordinates are within [0, N-1] and targeted cell is currently empty.",
      "O(1) Win Checking: Evaluate winning conditions (full row, column, main diagonal, anti-diagonal) in O(1) time per move rather than scanning all N^2 cells.",
      "Game Status Detection: Detect ACTIVE, WINNER, or DRAW state after every move."
    ],
    coreOperationsApi: [
      "void initializeGame(int boardSize, vector<Player> players);",
      "MoveResult makeMove(Player player, int row, int col);",
      "BoardState getBoardSnapshot();",
      "Player getCurrentTurnPlayer();"
    ],
    expectedBehavior: "Players take turns placing pieces. Each valid move updates board state in O(1) time. As soon as any player completes a row, column, or diagonal of size N, the game halts and announces the winner.",
    examplesScenarios: "Turn 1: Player X at (0, 0). Turn 2: Player O at (1, 1). Turn 3: Player X at (0, 1). Turn 4: Player O at (2, 2). Turn 5: Player X at (0, 2) -> Row 0 complete! Game status = WON by Player X.",
    constraintsAssumptions: [
      "N >= 3, Player count M >= 2.",
      "Constant time O(1) move evaluation using pre-allocated row, column, and diagonal counter arrays.",
      "Single game session per engine instance."
    ],
    edgeCasesErrorHandling: [
      "Move out of turn: throw InvalidTurnException.",
      "Move to occupied cell: throw CellOccupiedException.",
      "Move outside grid boundaries: throw OutOfBoundsException.",
      "Move after game is already won or drawn: throw GameOverException."
    ],
    stateLifecycleRules: "Game lifecycle: NOT_STARTED -> IN_PROGRESS -> (WON | DRAW). Moves are rejected once a terminal state is reached.",
    acceptanceCriteria: [
      "Move evaluation runs in strict O(1) time and O(N) auxiliary space.",
      "Draw is correctly declared when all N^2 cells are filled without a winner.",
      "Clean separation between Board model, WinEvaluator, and GameCoordinator."
    ],
    whatYouNeedToImplement: "Implement the interactive game engine described above, including grid management, turn validation, O(1) winning condition checks, and game termination in clean C++. Provide unit tests verifying 3x3 classic games, 5x5 scaled games, and tie-game scenarios."
  },

  // Problem 8: Elevator Control System
  "LLDP3-P1": {
    context: "An intelligent multi-car elevator control system for a 20-story commercial office building. The system must coordinate elevator car dispatches, prioritize internal car button requests and external hallway calls, and minimize passenger wait times.",
    functionalRequirements: [
      "Elevator Car Mechanics: Maintain current floor, moving direction (UP, DOWN, IDLE), door state (OPEN, CLOSED), and passenger weight load.",
      "Hallway & Car Requests: Process external hall requests (Floor F, Direction DIR) and internal car destination buttons (Floor F).",
      "Scheduling & Dispatch: Dispatch the most suitable elevator car to service pending requests using SCAN / LOOK direction scheduling.",
      "Safety & Capacity: Prevent movement when doors are open or weight exceeds maximum rated capacity.",
      "Maintenance & Fire Mode: Support locking cars to emergency recall floor during alarm."
    ],
    coreOperationsApi: [
      "void requestElevator(int floor, Direction direction); // Hallway call",
      "void selectFloor(int elevatorId, int destinationFloor); // Internal button",
      "void step(); // Discrete simulation tick moving cars and updating doors",
      "ElevatorStatus getElevatorStatus(int elevatorId);",
      "void triggerEmergencyRecall(int recallFloor);"
    ],
    expectedBehavior: "A car moving UP services all pending upward hallway calls and car destination floors along its path before reversing to service downward requests.",
    examplesScenarios: "Car 1 is at Floor 2 moving UP to Floor 8. Passenger at Floor 5 presses UP. Car 1 stops at Floor 5, opens door, passenger enters, door closes, and Car 1 resumes toward Floor 8.",
    constraintsAssumptions: [
      "Building floors 1 through 20. Elevator bank with 3 cars.",
      "Discrete time-step simulation or event-driven queue.",
      "Doors must be fully closed before car can change floors."
    ],
    edgeCasesErrorHandling: [
      "Requesting a floor outside [1, maxFloors]: throw InvalidFloorException.",
      "Overweight sensor triggered: keep doors open and emit audio warning.",
      "Emergency alarm active: cancel all hallway calls and route cars directly to ground floor."
    ],
    stateLifecycleRules: "Elevator car state: IDLE -> ACCELERATING -> MOVING -> DECELERATING -> DOORS_OPENING -> DOORS_OPEN -> DOORS_CLOSING -> IDLE.",
    acceptanceCriteria: [
      "No starvation: every hall request is eventually serviced.",
      "Directional consistency: an elevator moving UP does not reverse direction for a downward call until all upward calls are complete.",
      "Thread safety or clean simulation event loop."
    ],
    whatYouNeedToImplement: "Implement the multi-elevator control system described above, including request scheduling, direction management, elevator movement, and passenger safety constraints in clean C++. Write test cases verifying elevator pickup sequences and door safety."
  },

  // Problem 12: BookMyShow
  "LLDP4-P1": {
    context: "A high-concurrency movie ticket reservation and seat booking engine. The system allows thousands of simultaneous users to browse cinemas, select shows, hold seats with a 10-minute lock, and complete payments without double-booking.",
    functionalRequirements: [
      "Cinema & Theater Hierarchy: Cities contain Cinemas; Cinemas contain Screens; Screens contain categorized Seats (Silver, Gold, VIP).",
      "Show Management: Schedule movies on screens with designated showtimes and dynamic seat pricing.",
      "Temporary Seat Locking: When a user selects seats, acquire a temporary 10-minute hold. Other users see those seats as UNAVAILABLE.",
      "Hold Expiration: If payment is not completed within 10 minutes, the lock expires automatically and seats return to AVAILABLE.",
      "Payment & Confirmation: Successful payment converts locked seats to PERMANENTLY_BOOKED and generates a booking confirmation."
    ],
    coreOperationsApi: [
      "vector<Show> searchShows(string movieName, string city, Date date);",
      "SeatLayout getSeatAvailability(string showId);",
      "LockToken lockSeats(string showId, vector<string> seatIds, string userId);",
      "Booking confirmBooking(LockToken token, PaymentDetails payment);",
      "void cancelBooking(string bookingId);"
    ],
    expectedBehavior: "Two users selecting Seat B5 at the exact same millisecond: exactly one user obtains the 10-minute hold token; the second user receives an immediate SeatUnavailable error.",
    examplesScenarios: "User 1 holds seats [A1, A2] at 10:00:00 AM. Expiration set to 10:10:00 AM. User 1 does not pay. At 10:10:01 AM, User 2 requests [A1, A2]. System grants hold token to User 2. User 1's subsequent payment attempt is rejected with LockExpiredException.",
    constraintsAssumptions: [
      "High concurrent thread safety with fine-grained per-show locking.",
      "Seat locks must have a deterministic TTL (Time-to-Live).",
      "In-memory store with lock manager."
    ],
    edgeCasesErrorHandling: [
      "Attempting to lock already locked or booked seats: throw SeatAlreadyReservedException.",
      "Confirming booking with expired token: throw LockExpiredException and refund payment.",
      "Partial lock failures: if requesting 3 seats and 1 is unavailable, roll back the other 2 immediately."
    ],
    stateLifecycleRules: "Seat state: AVAILABLE -> LOCKED (TTL 10 min) -> BOOKED. If lock expires or user cancels, state reverts LOCKED -> AVAILABLE.",
    acceptanceCriteria: [
      "Zero double-bookings under concurrent multi-threaded stress testing.",
      "All-or-nothing atomicity for multi-seat bookings.",
      "Clean separation between Catalog, LockManager, and BookingWorkflow."
    ],
    whatYouNeedToImplement: "Implement the seat reservation and booking system described above, including catalog browsing, concurrent seat locking with TTL expiration, booking confirmation, and seat release in clean C++. Write a concurrent test simulating multiple callers attempting to reserve the same seat simultaneously."
  }
};

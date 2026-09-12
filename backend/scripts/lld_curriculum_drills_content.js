/**
 * Handcrafted, Pedagogically Rigorous Content for all 48 LLD Drills
 * Zero generic filler, zero corporate buzzwords.
 * Every drill strictly adheres to its conceptTopics and level.
 */

export const DRILL_CONTENT_MAP = {
  // ===========================================================================
  // PHASE 1: Object-Oriented Domain Modeling & Practical OOAD
  // ===========================================================================

  "LLDP1-D1.1.1": {
    goal: "Implement a resource-holding ConnectionPool class to demonstrate stack allocation cleanup versus explicit heap allocation, verifying that object lifetime is tied directly to scope.",
    whyThisMatters: "Resource leaks occur when developers confuse pointer variables with object lifetime. Understanding how scope exit guarantees stack destructor invocation—and why heap allocations require explicit lifetime management—is foundational to writing robust C++.",
    yourTask: "1. Create a ConnectionPool class with logging inside its constructor and destructor to observe object birth and death.\n2. Instantiate ConnectionPool on the stack inside a local scope block `{ ... }`. Observe destructor execution automatically at the closing brace.\n3. Instantiate another ConnectionPool on the heap using `new`. Verify that exiting scope without `delete` leaves the object alive in heap memory and leaks the resource.\n4. Add an explicit `delete` call to verify heap destruction and compare ownership responsibility between stack and heap.",
    whatToObserve: "Notice that stack-allocated objects are tied to their enclosing lexical scope and clean themselves up deterministically, whereas heap objects exist independently of scope until explicitly deleted.",
    successCriteria: "Destructor execution logs clearly show the stack object being freed at block exit. The heap object is freed only when delete is executed. Zero memory leaks when delete is applied.",
    thinkAbout: "What happens if an exception is thrown before an explicit delete statement is reached? How does RAII ensure safety, and what ownership hazards arise if you copy a raw heap-holding pointer without defining custom copy semantics (Rule of Three)?"
  },

  "LLDP1-D1.1.2": {
    goal: "Refactor buggy object references in a Car and Engine relationship to establish clear ownership boundaries between Composition and Aggregation.",
    whyThisMatters: "Dangling pointers occur when an object holds a raw pointer to a stack-allocated collaborator that goes out of scope. Low-level design requires knowing whether an entity owns a child object exclusively or merely borrows it temporarily.",
    yourTask: "1. Inspect the provided buggy code where a Car object stores a raw pointer `Engine*` pointing to an engine allocated on a temporary stack frame.\n2. Identify why the pointer becomes invalid after the helper setup function returns.\n3. Refactor Car to use Composition: the Car should own its Engine by value or via `std::unique_ptr<Engine>`.\n4. Implement an inspection method `inspectEngine(const Engine& engine)` to demonstrate safe reference borrowing without taking ownership.",
    whatToObserve: "Notice that holding an object by value or unique_ptr guarantees the child's lifetime matches the parent's lifetime, preventing use-after-free bugs.",
    successCriteria: "No pointers to out-of-scope stack frames exist. Read-only methods accept `const Engine&` to eliminate unnecessary copying while preventing mutation.",
    thinkAbout: "If a Car is destroyed, should its Engine continue to exist? When does your domain model require Composition versus Aggregation?"
  },

  "LLDP1-D1.1.3": {
    goal: "Implement dynamic polymorphism using a PaymentMethod base pointer, execute runtime method dispatch across concrete payment types, and prevent undefined behavior using virtual destructors.",
    whyThisMatters: "Deleting a derived object through a base pointer when the base destructor is not virtual results in undefined behavior. You cannot rely on correct destruction or resource cleanup.",
    yourTask: "1. Define an abstract base class `PaymentMethod` with a pure virtual method `virtual void pay(int amountCents) = 0;`.\n2. Implement two derived classes: `CreditCardPayment` and `UpiPayment`, each managing internal state or allocated transaction buffers.\n3. Demonstrate the hazard of deleting a derived object through a `PaymentMethod*` pointer when the base destructor is non-virtual.\n4. Fix the design by declaring `virtual ~PaymentMethod() = default;` in the base class to guarantee safe polymorphic destruction.",
    whatToObserve: "Notice the difference in cleanup behavior: with a virtual destructor, destroying an object through a base pointer safely invokes the complete destruction chain from derived to base.",
    successCriteria: "Both base and derived destructors execute reliably in reverse order of construction when deleting via a base pointer. Code compiles cleanly with zero undefined behavior warnings.",
    thinkAbout: "Why should any class intended to be used polymorphically through a base pointer always declare either a public virtual destructor or a protected non-virtual destructor?"
  },

  "LLDP1-D1.2.1": {
    goal: "Refactor a ShoppingCart class to defend its internal state invariants by eliminating public mutable collections and replacing naked setters with domain operations.",
    whyThisMatters: "Exposing public getters that return raw mutable references allows external code to bypass validation, inject negative prices, or corrupt internal quantity tallies without the cart knowing.",
    yourTask: "1. Analyze a provided `ShoppingCart` class where `getItems()` returns a direct mutable reference `std::vector<CartItem>&`.\n2. Demonstrate how external code bypasses validation by pushing items with negative quantities directly into the list.\n3. Refactor `ShoppingCart` to encapsulate items: provide `addLineItem(const Item& item, int quantity)` that rejects invalid quantities (<= 0).\n4. Return an unmodifiable view `const std::vector<CartItem>&` or a read-only projection for rendering.",
    whatToObserve: "Notice how encapsulating collection mutation inside `addLineItem` ensures cart total and tax calculations are always synchronized with item additions and removals.",
    successCriteria: "External callers cannot mutate cart contents directly. Any attempt to add non-positive quantities throws an invalid argument exception.",
    thinkAbout: "Why is returning `const std::vector<CartItem>&` better than returning a full copy `std::vector<CartItem>`, and when might a defensive copy still be needed?"
  },

  "LLDP1-D1.2.2": {
    goal: "Build an immutable Money Value Object that protects financial calculations against floating-point drift and prevents illegal cross-currency arithmetic.",
    whyThisMatters: "Using float or double for money leads to rounding errors like $0.10 + $0.20 = $0.30000000000000004. In system design, financial values must be modeled as immutable value objects holding exact integer units.",
    yourTask: "1. Create an immutable `Money` class holding `int64_t amountInCents` and `std::string currencyCode` (e.g. USD, INR).\n2. Enforce invariant: reject negative amounts on initialization if your domain requires positive amounts, or enforce sign rules.\n3. Implement `add(const Money& other)` and `subtract(const Money& other)` that return a new `Money` instance.\n4. If currencies do not match (e.g. adding USD to EUR), throw a `CurrencyMismatchException` rather than performing silent invalid addition.",
    whatToObserve: "Because Money instances are immutable, passing Money into discount calculators or tax services cannot accidentally alter the original order total.",
    successCriteria: "Operations return new Money objects with zero floating point representation. Adding different currencies throws an exception. Equality is based on structural value, not object identity.",
    thinkAbout: "Why do Value Objects have no distinct identity or ID field, whereas Entities (like Order or User) must have unique IDs?"
  },

  "LLDP1-D1.3.1": {
    goal: "Model a University Course Registration domain demonstrating the differences between Association, Aggregation, and Composition in class relationships.",
    whyThisMatters: "Conflating Association, Aggregation, and Composition leads to either leaking memory or deleting shared objects prematurely when a parent container is destroyed.",
    yourTask: "1. Implement `Department`, `Course`, `Student`, and `Transcript` classes in modern C++.\n2. Model Composition: `Course` owns its `Syllabus` exclusively (if Course is deleted, Syllabus is deleted).\n3. Model Aggregation: `Department` has a collection of `Course` pointers (if Department dissolves, Courses can still exist).\n4. Model Association: `Student` registers for a `Course` (they interact, but neither owns the lifecycle of the other).",
    whatToObserve: "Notice the difference in destruction cascades: destroying a Course automatically cleans up its Syllabus, but dissolving a Department does not delete the independent Course objects.",
    successCriteria: "Lifecycle ownership is clear from member declarations (value / unique_ptr for composition vs weak_ptr / observer pointer for association and aggregation).",
    thinkAbout: "When drawing UML class diagrams in an LLD interview, what visual diamond symbols distinguish Composition (solid) from Aggregation (hollow)?"
  },

  "LLDP1-D1.3.2": {
    goal: "Refactor an inheritance-based notification hierarchy that suffers from Fragile Base Class problems into a composition-based design.",
    whyThisMatters: "Deep inheritance hierarchies break when a change in the base class accidentally alters behavior in derived classes, or when combinations of features (e.g. EmailWithRetry, SMSWithRateLimit) cause combinatorial class explosion.",
    yourTask: "1. Examine a base class `Notification` with subclasses `EmailNotification`, `SMSNotification`, `EncryptedEmailNotification`, and `RetryingSMSNotification`.\n2. Notice how adding a feature like encryption or retry logic forces the creation of new subclasses or pollutes the base class with flags.\n3. Refactor by decomposing responsibilities: create a clean `NotificationSender` channel and pluggable behaviors for retry and formatting.\n4. Compose email and SMS senders with the required behaviors at runtime without modifying the notification message entity.",
    whatToObserve: "See how composition allows adding encryption or retry policies to any channel dynamically without creating 10 new subclass combinations.",
    successCriteria: "The deep subclass tree is replaced with flat, focused collaborators. Adding a new channel or delivery policy requires zero changes to existing classes.",
    thinkAbout: "What is the rule of thumb for 'Favor composition over inheritance', and what are the few scenarios where inheritance is genuinely the right choice?"
  },

  "LLDP1-D1.3.3": {
    goal: "Analyze an inheritance hierarchy of BankAccounts to predict where the Liskov Substitution Principle and subclass assumptions will break under new requirements.",
    whyThisMatters: "Inheritance creates tight compile-time coupling. In interviews, you must proactively identify when a proposed subclass will violate base class invariants before writing broken code.",
    yourTask: "1. Given a base class `BankAccount` with `withdraw(int amount)`, examine two subclasses: `CheckingAccount` and `FixedDepositAccount`.\n2. Observe what happens when calling code expects `account->withdraw(100)` to work, but `FixedDepositAccount` throws `UnsupportedOperationException` because funds are locked.\n3. Explain why this violates behavioral subtyping.\n4. Redesign the abstraction by splitting into `ReadableAccount` and `WithdrawableAccount` interfaces so callers never invoke operations that a subtype cannot fulfill.",
    whatToObserve: "Notice how client code no longer needs `try / catch UnsupportedOperationException` or runtime `dynamic_cast` checks to determine if an account allows withdrawals.",
    successCriteria: "Base class contracts are honorably fulfilled by every subclass without throwing unexpected operational exceptions.",
    thinkAbout: "Why is a square not always a valid substitute for a rectangle in object-oriented geometry, even though it is in mathematics?"
  },

  "LLDP1-D1.4.1": {
    goal: "Perform Class-Responsibility-Collaborator (CRC) modeling and write code for a Digital Wallet system supporting user accounts, wallets, and fund transfers.",
    whyThisMatters: "Before writing classes for a system, an engineer must identify the core domain entities, their single responsibilities, and which collaborators they need to communicate with.",
    yourTask: "1. Identify the 3 core domain entities: `User`, `Wallet`, and `Transaction`.\n2. Write CRC cards defining: Responsibility (what does Wallet do?) and Collaborators (who does Wallet talk to?).\n3. Implement the classes: `Wallet` manages current balance in integer cents and applies deposit/withdraw invariants.\n4. Implement a `TransferService` that coordinates moving funds from Wallet A to Wallet B atomically without allowing negative balances.",
    whatToObserve: "Notice that `Wallet` handles its own balance invariants, while `TransferService` coordinates the multi-wallet workflow rather than placing the entire transfer logic inside one user class.",
    successCriteria: "Wallet balance cannot drop below zero. Failed transfers rollback cleanly. Responsibilities are clearly separated between storage entities and workflow services.",
    thinkAbout: "Should the TransferService be a method on the Wallet class (`walletA.transferTo(walletB)`), or should it be a separate service? Why?"
  },

  // ===========================================================================
  // PHASE 2: Code Smells, SOLID Principles & Architectural Decisions
  // ===========================================================================

  "LLDP2-D2.1.1": {
    goal: "Dismantle a bloated 600-line God Class UserManager by decomposing it into focused, single-responsibility components.",
    whyThisMatters: "God Classes accumulate authentication, database persistence, email notifications, and validation into one monster file. This makes testing impossible and causes merge conflicts on every commit.",
    yourTask: "1. Review `UserManager`, which currently handles: password hashing, SQL query execution, sending welcome emails, and audit logging.\n2. Extract single-purpose classes: `PasswordHasher`, `UserRepository`, `EmailNotifier`, and `AuditLogger`.\n3. Re-implement `UserService` as a lightweight coordinator that delegates each task to its specialized collaborator.\n4. Write unit tests for `UserService` using mock or fake implementations of the repository and emailer.",
    whatToObserve: "Notice how each new class fits on a single screen, can be read and understood in 2 minutes, and can be unit tested in isolation without a real database.",
    successCriteria: "`UserService` contains zero SQL statements and zero email formatting code. Each extracted collaborator has exactly one reason to change.",
    thinkAbout: "How do you know when a class has gotten too large? What metrics (lines of code, number of dependencies, constructor parameters) signal a God Class?"
  },

  "LLDP2-D2.1.2": {
    goal: "Segregate a bloated CloudStorageProvider interface into focused, role-specific client interfaces according to the Interface Segregation Principle.",
    whyThisMatters: "Fat interfaces force clients to depend on methods they do not need. A read-only archival service should not be forced to implement `upload()`, `delete()`, or `modifyPermissions()`.",
    yourTask: "1. Inspect a fat interface `ICloudStorage` containing: `uploadFile()`, `downloadFile()`, `deleteFile()`, `generatePublicUrl()`, and `setBucketQuota()`.\n2. Identify clients: an `ArchiveReader` that only reads, an `UploadWorker` that only writes, and an `AdminConsole` that manages quotas.\n3. Split `ICloudStorage` into fine-grained interfaces: `IObjectReader`, `IObjectWriter`, and `IStorageAdmin`.\n4. Update the client classes so they only accept references to the specific sub-interface they actually use.",
    whatToObserve: "Notice that mock implementations in tests for `ArchiveReader` now only need to stub `downloadFile()`, rather than providing dummy implementations for 10 unrelated methods.",
    successCriteria: "No client is forced to implement or depend on methods it does not call. Interface signatures are clean and role-specific.",
    thinkAbout: "Can a single concrete class implement multiple small interfaces? How does this keep client code decoupled?"
  },

  "LLDP2-D2.2.1": {
    goal: "Refactor a hardcoded type-code switch statement in an order discount calculator into a polymorphic hierarchy obeying the Open-Closed Principle.",
    whyThisMatters: "Using switch-case statements on type enums (`SWITCH (type) { CASE VIP: ... CASE FESTIVE: ... }`) requires editing existing tested code every time a new business rule is added, violating OCP.",
    yourTask: "1. Given `calculateDiscount(Order order, CustomerType type)` that switches on `REGULAR`, `SILVER`, `GOLD`, and `FESTIVE`.\n2. Create an abstract discount contract `IDiscountPolicy` with `int applyDiscount(int totalAmountCents)`.\n3. Implement concrete policies: `RegularDiscountPolicy`, `GoldDiscountPolicy`, and `FestiveDiscountPolicy`.\n4. Show how adding a new `BlackFridayDiscountPolicy` is achieved by adding a new class without modifying existing calculation methods.",
    whatToObserve: "Notice that the core checkout engine never changes when marketing invents new discount promotions. You simply pass in a new policy instance.",
    successCriteria: "All switch-case statements on customer type are eliminated. Adding a new discount requires zero edits to existing discount calculation classes.",
    thinkAbout: "When is a switch statement acceptable (e.g. converting an enum to string) versus when is it an antipattern that should be replaced with polymorphism?"
  },

  "LLDP2-D2.2.2": {
    goal: "Identify and resolve Liskov Substitution Principle violations in a Document Printer system where ReadOnlyDocument breaks caller expectations.",
    whyThisMatters: "Subtypes must be substitutable for their base types without altering program correctness. If a subtype strengthens preconditions or weakens postconditions, calling code will fail at runtime.",
    yourTask: "1. Inspect a base class `Document` with `writeText(string text)` and `save()`.\n2. Observe a derived class `ReadOnlyDocument` that overrides `writeText` to throw an exception or silently do nothing.\n3. Demonstrate how calling code iterating over a collection of `Document*` crashes when encountering a `ReadOnlyDocument`.\n4. Redesign the hierarchy: separate `IReadableDocument` from `IWritableDocument` so that write operations can only be invoked on documents that support them.",
    whatToObserve: "Notice how compiler type safety prevents clients from ever calling `writeText` on a read-only document, eliminating runtime crashes completely.",
    successCriteria: "Every derived class cleanly fulfills all methods of its implemented interface without throwing unsupported operation exceptions.",
    thinkAbout: "How does the Liskov Substitution Principle relate to defensive programming? Why should callers never have to inspect `if (doc is ReadOnlyDocument)`?"
  },

  "LLDP2-D2.3.1": {
    goal: "Refactor tight coupling inside an OrderProcessor by introducing explicit constructor dependency injection and a fake notification port for fast unit testing.",
    whyThisMatters: "When a class instantiates its own dependencies internally via `new SmtpEmailService()`, you cannot test it without connecting to real email servers. Dependency Inversion decouples high-level policy from low-level details.",
    yourTask: "1. Given `OrderProcessor` which instantiates `new SqlOrderDatabase()` and `new SendGridMailer()` directly inside its constructor.\n2. Define abstract interfaces `IOrderRepository` and `INotificationService`.\n3. Refactor `OrderProcessor` to receive these interfaces via its constructor.\n4. In your unit test, instantiate `OrderProcessor` passing in `FakeOrderRepository` (in-memory map) and `SpyNotificationService` to verify calls without external infrastructure.",
    whatToObserve: "Notice how the unit test runs in 2 milliseconds, requires zero network connectivity, and can verify exact error scenarios by configuring the fake collaborators.",
    successCriteria: "`OrderProcessor` has no direct references to concrete database or mailing libraries. All dependencies are injected via constructor.",
    thinkAbout: "What is the difference between Dependency Inversion (the architectural principle) and Dependency Injection (the mechanical pattern)?"
  },

  "LLDP2-D2.4.1": {
    goal: "Evaluate 8 concrete software design scenarios and defend whether inheritance or composition provides superior maintainability and testability.",
    whyThisMatters: "Junior engineers default to inheritance because it feels natural, while experienced architects default to composition because it allows dynamic runtime behavior and prevents rigid coupling.",
    yourTask: "1. Review 8 design prompts (e.g. Stack inheriting from Vector, GUI Window with Border, Game Character with Flying ability, Logger with File output).\n2. For each scenario, write a 2-sentence architectural defense choosing either Inheritance or Composition.\n3. Implement the Game Character scenario in code: demonstrate how composing a `MovementBehavior` allows changing from `Walking` to `Flying` at runtime, which inheritance cannot do.",
    whatToObserve: "Notice how composition allows an entity's behavior to be swapped dynamically mid-game (`character.setMovement(new FlyingMovement())`), whereas inheritance locks the behavior at compile time.",
    successCriteria: "Defense clearly articulates compile-time versus runtime flexibility, testability, and impact on future requirement changes.",
    thinkAbout: "Why did Java's early standard library regret having `Stack` inherit from `Vector`?"
  },

  "LLDP2-D2.4.2": {
    goal: "Establish a practical 4-question decision checklist to determine whether a switch statement is completely fine or an over-engineered antipattern.",
    whyThisMatters: "Prematurely converting every simple 3-line switch statement into 5 classes and an abstract factory is over-engineering. Engineers must know the exact threshold where polymorphism is justified.",
    yourTask: "1. Compare two cases: Case A (converting an HTTP status code enum to a static display label); Case B (calculating sales tax across 12 countries with changing rate rules).\n2. Formulate the 4 decision criteria: Number of cases, rate of change, shared behavior vs distinct algorithmic state, and risk of merge conflicts.\n3. Keep Case A as a simple, readable switch statement.\n4. Refactor Case B into a clean polymorphic tax policy registry.",
    whatToObserve: "Notice that Case A is compact, readable, and unlikely to change, while Case B benefits significantly from polymorphism because tax rules are added frequently.",
    successCriteria: "Clear, justifiable boundary separating pragmatic procedural code from necessary object-oriented polymorphism.",
    thinkAbout: "How does team size affect the decision to replace switch statements with polymorphic classes?"
  },

  "LLDP2-D2.4.3": {
    goal: "Classify when to use pure interfaces versus abstract base classes by building an Audio Streamer pipeline.",
    whyThisMatters: "Interfaces define behavioral contracts (what an entity can do), while abstract classes share state and template method execution order. Confusing them causes bloated hierarchies.",
    yourTask: "1. Define an interface `IAudioSink` with pure virtual methods `write(const AudioBuffer&)` and `flush()`.\n2. Define an abstract class `BaseAudioDecoder` that manages common stream parsing state, buffer allocations, and defines a `decode()` template method that delegates to `decodeFrame()`.\n3. Implement concrete classes `Mp3Decoder` and `WavDecoder` extending `BaseAudioDecoder`.\n4. Implement `SpeakerSink` and `FileSink` implementing `IAudioSink`.",
    whatToObserve: "Notice how `BaseAudioDecoder` eliminates code duplication for common decoding buffers, while `IAudioSink` remains completely uncoupled from any implementation details.",
    successCriteria: "Abstract class is only used where state sharing and template method sequencing are needed. Pure interface is used for behavioral integration points.",
    thinkAbout: "In modern C++, when should you prefer a concept (templates) over a pure virtual interface?"
  },

  "LLDP2-D2.4.4": {
    goal: "Audit an over-engineered codebase with 6 unnecessary interfaces and 2 factories for a single-implementation feature and refactor it into clean, simple code.",
    whyThisMatters: "Speculative generality (YAGNI — You Aren't Gonna Need It) creates layers of indirection that waste developer time and make debugging difficult without adding any actual value.",
    yourTask: "1. Inspect an over-engineered PDF exporter that has `IPdfExporterFactory`, `IPdfExporterBuilder`, `IPdfStreamWriterProvider`, and only 1 concrete implementation.\n2. Remove speculative abstractions that have only one implementation and zero likelihood of variation.\n3. Refactor down to a straightforward `PdfExporter` class with clean public methods.\n4. Verify that all original functional tests still pass with 70% fewer files.",
    whatToObserve: "Notice how much easier it is to trace code execution from input to output when unnecessary indirection layers are stripped away.",
    successCriteria: "Codebase is simplified without losing functionality or testability. Only necessary abstractions are retained.",
    thinkAbout: "What is the difference between designing for extensibility and speculative over-engineering?"
  },

  "LLDP2-D2.4.5": {
    goal: "Analyze an existing NotificationService and predict which upcoming requirement variations will cause Open-Closed Principle cascade failures.",
    whyThisMatters: "A senior engineer can look at an architecture and immediately spot the fragile seams where the next product feature will force edits across multiple files.",
    yourTask: "1. Review a `NotificationService` that handles SMS and Email with hardcoded message formatting and direct API client calls.\n2. Predict what happens when the business requests: (a) Slack and WhatsApp support, (b) Rate limiting per user, (c) Message localization/templates.\n3. Identify the exact lines of code that will suffer cascade modifications.\n4. Write a brief refactoring plan that introduces clean seams for channel dispatch, formatting, and rate limiting.",
    whatToObserve: "Notice how identifying high-probability requirements helps you place extension seams exactly where they will be needed without over-engineering the rest of the system.",
    successCriteria: "Prediction correctly identifies all failure points. Refactoring proposal decouples message construction from delivery channels.",
    thinkAbout: "How do you balance preparing for future requirements with the YAGNI principle?"
  },

  // ===========================================================================
  // PHASE 3: Design Pattern Discovery Through Recurring Requirement Pain
  // ===========================================================================

  "LLDP3-D3.1.1": {
    goal: "Refactor a shipping cost calculation module from tangled nested conditionals into a dynamic shipping strategy engine.",
    whyThisMatters: "Shipping rules change constantly: weight tiers, international customs, express air delivery, and holiday discounts. Hardcoding them in nested if-else blocks creates bugs every holiday season.",
    yourTask: "1. Given an `Order` class with a 50-line `calculateShipping()` method with nested if-else statements for `STANDARD`, `EXPRESS`, and `OVERNIGHT`.\n2. Create an `IShippingStrategy` interface with `int calculateCost(const OrderDetails& order)`.\n3. Implement `StandardShipping`, `ExpressShipping`, and `FreeOverThresholdShipping`.\n4. Inject the appropriate strategy into `Order` at checkout time based on user selection.",
    whatToObserve: "Notice how each shipping rule's calculation logic is completely isolated. You can test express shipping edge cases without risking breaking standard shipping.",
    successCriteria: "All shipping calculation conditionals are removed from the Order class. New shipping rules can be added by creating a new strategy class.",
    thinkAbout: "How does the Strategy pattern differ from simply passing a function pointer or lambda in modern C++?"
  },

  "LLDP3-D3.1.2": {
    goal: "Build a decoupled Order Event Broker allowing inventory, email, and analytics systems to react to completed orders without tight coupling.",
    whyThisMatters: "When an order completes, inventory must reserve stock, email must notify the user, and analytics must log the sale. Calling all these services sequentially inside `OrderService` makes it brittle and slow.",
    yourTask: "1. Define an `IOrderEventListener` interface with `void onOrderPlaced(const Order& order)`.\n2. Implement listeners: `InventoryStockDeductor`, `CustomerConfirmationEmailer`, and `AnalyticsLogger`.\n3. Implement an `OrderEventBroker` that maintains a list of subscribers and broadcasts events when an order is placed.\n4. Demonstrate adding a new `FraudDetectionListener` without modifying `OrderService`.",
    whatToObserve: "Notice that `OrderService` only knows about the broker or interface. It does not know or care that an email is sent or an analytics event is recorded.",
    successCriteria: "Order placement triggers all registered listeners. Adding or removing a listener requires zero edits to the order creation workflow.",
    thinkAbout: "What happens if one listener throws an unhandled exception during event broadcast? How should the event publisher handle failure?"
  },

  "LLDP3-D3.1.3": {
    goal: "Refactor an enterprise document lifecycle from messy boolean flags into a strict State pattern state machine.",
    whyThisMatters: "Using boolean flags like `isDraft`, `isUnderReview`, `isApproved`, `isPublished` leads to invalid states where a document is both published and draft, or approved without being reviewed.",
    yourTask: "1. Examine a `Document` class with boolean flags where methods like `edit()`, `submit()`, and `approve()` have checks like `if (isDraft && !isUnderReview)`.\n2. Create an `IDocumentState` interface with methods: `edit(Document&, string)`, `review(Document&)`, `approve(Document&)`, and `publish(Document&)`.\n3. Implement states: `DraftState`, `UnderReviewState`, and `PublishedState`.\n4. Move state transition logic into the state classes, rejecting invalid operations (e.g. editing a published document throws `InvalidOperationException`).",
    whatToObserve: "Notice that the document object simply delegates operations to its current state object (`currentState->approve(*this)`), making invalid state combinations impossible.",
    successCriteria: "All boolean state flags are eliminated. Invalid transitions throw clear domain exceptions. State transitions are deterministic.",
    thinkAbout: "Should the State object own the transition to the next state, or should the Document context manage state transitions?"
  },

  "LLDP3-D3.1.4": {
    goal: "Build a transactional Undo/Redo Text Buffer Engine using the Command pattern.",
    whyThisMatters: "Text editors, spreadsheets, and design tools require reverting user actions. Without encapsulating actions into command objects with state snapshots, implementing undo is nearly impossible.",
    yourTask: "1. Define an `ICommand` interface with `void execute()` and `void undo()`.\n2. Create a `TextCanvas` class that holds a string buffer.\n3. Implement concrete commands: `InsertTextCommand` and `DeleteTextCommand`, storing the necessary text and offset to reverse their action.\n4. Create a `CommandHistory` manager that maintains undo and redo stacks, handling user `undo()` and `redo()` requests.",
    whatToObserve: "Notice how `InsertTextCommand::undo()` performs the exact inverse operation (deleting the inserted characters), restoring the canvas to its prior state cleanly.",
    successCriteria: "Performing 3 insertions followed by 2 undos correctly restores the previous text buffer. Redo correctly re-applies reverted commands.",
    thinkAbout: "How do you limit memory usage in an undo history stack so that keeping 1,000 edits doesn't exhaust RAM?"
  },

  "LLDP3-D3.1.5": {
    goal: "Build an extensible Request Filter Pipeline using the Chain of Responsibility pattern for HTTP API requests.",
    whyThisMatters: "Web servers must execute a sequence of cross-cutting checks: authentication, rate limiting, logging, and input sanitization. Hardcoding them in a single function makes reordering or toggling filters difficult.",
    yourTask: "1. Define an abstract base class `RequestFilter` with `virtual bool handle(Request& req)` and a pointer to `nextFilter`.\n2. Implement concrete filters: `AuthenticationFilter` (verifies token), `RateLimitFilter` (checks request count), and `LoggingFilter`.\n3. Chain the filters together: `Auth -> RateLimit -> Logging`.\n4. Demonstrate that if authentication fails, the request is terminated immediately without reaching the rate limiter or logger.",
    whatToObserve: "Notice how each filter either processes and passes the request down the chain, or short-circuits execution by returning false immediately.",
    successCriteria: "Filters can be reordered or added without modifying existing filter implementations. Failed filter halts downstream processing.",
    thinkAbout: "How does Chain of Responsibility compare to a standard loop over an array of filter objects? When is one better than the other?"
  },

  "LLDP3-D3.2.1": {
    goal: "Implement a Document Exporter Factory and an HTTP Client Configuration Builder to master creational patterns.",
    whyThisMatters: "Complex constructors with 8 optional parameters lead to telescoping constructor antipatterns (`new Client(url, null, null, 30, true, null)`). Factory and Builder clarify construction intent.",
    yourTask: "1. Implement a `DocumentExporterFactory` that returns an `IDocumentExporter` (`PdfExporter`, `CsvExporter`, or `JsonExporter`) based on file extension.\n2. Implement an `HttpClientConfig` class with a fluent Builder: `HttpClientConfig::Builder().setUrl(u).setTimeout(30).setRetries(3).build()`.\n3. Validate the configuration inside `build()`: throw an exception if URL is missing or timeout is negative.",
    whatToObserve: "Notice how the fluent Builder eliminates confusing boolean flag parameters in constructors and guarantees that only fully validated configurations can be constructed.",
    successCriteria: "Factory returns the correct exporter abstraction without exposing concrete constructors. Builder provides clear, readable instantiation with validation.",
    thinkAbout: "When should an object be constructed via a Builder versus a simple constructor?"
  },

  "LLDP3-D3.2.2": {
    goal: "Implement dynamic beverage add-ons using the Decorator pattern and integrate a legacy payment provider using the Adapter pattern.",
    whyThisMatters: "Inheritance for combinations like `CoffeeWithMilkAndCaramel` causes class explosion. Decorators add responsibilities dynamically. Adapters allow legacy or third-party libraries to satisfy modern interfaces.",
    yourTask: "1. Create a `Beverage` base class and a `SimpleCoffee` concrete implementation.\n2. Create decorators: `MilkDecorator` and `CaramelDecorator` that wrap a `Beverage`, adding their cost and description dynamically.\n3. Given a legacy third-party class `OldPayPalService` with `sendPayment(double amount, string email)`.\n4. Create a `PayPalAdapter` that implements your modern domain interface `IPaymentProcessor::charge(const Money& money)` by delegating to `OldPayPalService`.",
    whatToObserve: "Notice that decorating a coffee 3 times (`new Caramel(new Milk(new SimpleCoffee()))`) accumulates cost dynamically without creating a `CaramelMilkCoffee` subclass.",
    successCriteria: "Decorators can be nested arbitrarily. The legacy payment service operates seamlessly through the adapter with zero changes to client code.",
    thinkAbout: "What is the key structural difference between a Decorator (adds behavior to the same interface) and an Adapter (converts one interface to another)?"
  },

  "LLDP3-D3.2.3": {
    goal: "Build an in-memory FileSystem tree hierarchy using the Composite pattern to treat files and folders uniformly.",
    whyThisMatters: "Hierarchical data structures (directories, UI component trees, organization charts) require operations like `calculateTotalSize()` to work identically on individual leaves and composite containers.",
    yourTask: "1. Define an abstract `FileSystemNode` with `virtual int getSize() = 0` and `virtual void print(int depth) = 0`.\n2. Implement `FileNode` (leaf) returning its file size.\n3. Implement `DirectoryNode` (composite) containing a list of `std::unique_ptr<FileSystemNode>`.\n4. Implement `DirectoryNode::getSize()` to recursively sum the sizes of all child files and subdirectories.",
    whatToObserve: "Notice that calling `root->getSize()` calculates the total size of the entire tree without the client having to write manual recursive tree traversal logic or type checks.",
    successCriteria: "Files and directories are treated polymorphically through the base interface. Adding files or nested directories yields exact aggregate size calculations.",
    thinkAbout: "Should methods like `addNode()` and `removeNode()` be on the base `FileSystemNode` or only on `DirectoryNode`? What are the trade-offs of transparency vs safety?"
  },

  "LLDP3-D3.3.1": {
    goal: "Implement a Caching Proxy, a Unified Banking Facade, and a Template Method Report Generator to distinguish structural and behavioral patterns.",
    whyThisMatters: "Proxy controls access to a collaborator; Facade provides a simplified front-door interface to a complex subsystem; Template Method defines algorithm structure in a base class with customization hooks.",
    yourTask: "1. Implement `ImageProxy` that delays loading a heavy `RealImage` from disk until `display()` is called for the first time.\n2. Implement `BankTransferFacade` that coordinates `AccountVerifier`, `LedgerService`, and `NotificationGateway` into a simple `transferFunds(from, to, amount)` method.\n3. Implement `DataReportGenerator` with a template method `generateReport()` that defines the sequence: `fetchData() -> formatData() -> export()`, letting subclasses override formatting.",
    whatToObserve: "Notice the difference in intent: Proxy has the exact same interface as the subject; Facade creates a brand new, higher-level interface; Template Method uses inheritance to fix execution order.",
    successCriteria: "Proxy delays heavy resource instantiation. Facade simplifies multi-service interaction. Template method enforces execution sequence while allowing step customization.",
    thinkAbout: "When would you choose a Proxy over a Decorator, given that both wrap another object?"
  },

  "LLDP3-D3.3.2": {
    goal: "Refactor a dangerous, thread-unsafe Singleton logger into a clean, thread-safe Meyers' Singleton and demonstrate dependency-injected alternatives.",
    whyThisMatters: "Classic lazy-loaded Singletons (`if (instance == nullptr) instance = new Singleton()`) have race conditions that cause memory corruption in multi-threaded environments. Singletons also make testing painful if overused.",
    yourTask: "1. Inspect a naive Singleton implementation and identify the race condition in multi-threaded access.\n2. Implement a thread-safe C++11 Meyers' Singleton using static local variables inside `getInstance()`.\n3. Discuss why Singletons create hidden dependencies in code.\n4. Refactor client code to accept `ILogger&` via constructor injection while still using the Singleton instance at the composition root.",
    whatToObserve: "Notice that C++11 guarantees that local static variable initialization is thread-safe without manual mutex locks (`std::call_once` or magic statics).",
    successCriteria: "Singleton compiles safely with modern static initialization. Client classes depend on `ILogger` interface rather than directly invoking `Logger::getInstance()` everywhere.",
    thinkAbout: "Why is the Singleton pattern frequently referred to as an anti-pattern in modern software engineering?"
  },

  "LLDP3-D3.3.3": {
    goal: "Compare specialized GoF patterns (Visitor, Flyweight, Memento, Prototype) to understand when niche patterns solve specific complexity.",
    whyThisMatters: "Patterns like Visitor and Flyweight are rare in everyday CRUD apps, but essential in compilers, game engines, and graphic design tools.",
    yourTask: "1. Study 4 distinct problems: (a) Particle system with 1,000,000 bullet objects; (b) AST compiler syntax tree needing new operations without modifying node classes; (c) Object cloning with complex internal state; (d) Game save checkpoint.\n2. Match each problem to its pattern: Flyweight, Visitor, Prototype, Memento.\n3. Implement a minimal Flyweight `CharacterGlyph` where shared font data is separated from individual character position coordinates.",
    whatToObserve: "Notice how Flyweight separates intrinsic state (font, glyph geometry — shared among 10,000 characters) from extrinsic state (x, y coordinates — passed in per character), saving megabytes of RAM.",
    successCriteria: "Correct pattern matching with clear trade-off analysis. Minimal Flyweight demonstrates significant memory reduction.",
    thinkAbout: "Why does the Visitor pattern require double dispatch (`element->accept(visitor); visitor->visit(this);`)?"
  },

  "LLDP3-D3.4.1": {
    goal: "Formulate a concrete decision framework to distinguish when to use the Strategy pattern versus the State pattern.",
    whyThisMatters: "Strategy and State share almost identical UML class diagrams, but their architectural intent and lifecycle behavior are completely opposite. Confusing them in an interview signals surface-level memorization.",
    yourTask: "1. Analyze two systems: System A (Sorting algorithm or payment processing); System B (Vending machine or Order lifecycle).\n2. Contrast the key differences: Client awareness (client picks Strategy vs State transitions automatically), statefulness (Strategies are usually stateless; States manage transition context), and frequency of change.\n3. Write a 4-point decision guide to help an engineer pick between Strategy and State under interview conditions.",
    whatToObserve: "Notice that in Strategy, the caller tells the context which algorithm to use. In State, the context and states themselves transition from one to another based on events, without the caller's intervention.",
    successCriteria: "Clear explanation distinguishing algorithmic pluggability (Strategy) from lifecycle state transitions (State).",
    thinkAbout: "Can a State object internally use a Strategy to execute an action while in that state?"
  },

  "LLDP3-D3.4.2": {
    goal: "Differentiate Decorator, Adapter, and Proxy through a real-world Networking Stream scenario.",
    whyThisMatters: "All three patterns wrap another object (`Wrapper`), but confusing their purpose during an LLD interview is one of the most common candidate mistakes.",
    yourTask: "1. Given a network socket stream: write a 1-page design comparison showing how Decorator, Adapter, and Proxy would each be used.\n2. Decorator: wraps the stream to add gzip compression or encryption while keeping the same stream interface.\n3. Adapter: converts the legacy third-party socket API to your system's `IInputStream` interface.\n4. Proxy: wraps the stream to enforce access control or delay network connection until the first byte is requested.",
    whatToObserve: "Notice how the interface relationship differs: Adapter changes the interface; Decorator enhances the same interface; Proxy controls access to the same interface.",
    successCriteria: "Comparison table clearly defines intent, interface compatibility, and real-world usage examples for all three patterns.",
    thinkAbout: "If a wrapper class adds new public methods that were not on the wrapped object, is it still a Decorator? (Hint: No, Decorators maintain the exact interface)."
  },

  "LLDP3-D3.4.3": {
    goal: "Predict and map the appropriate design patterns needed for an E-Commerce platform handling pricing, coupons, checkout workflows, and notifications.",
    whyThisMatters: "In system design interviews, you do not just apply one pattern. You must compose multiple complementary patterns into a harmonious architecture.",
    yourTask: "1. Deconstruct an E-Commerce platform into its key subsystems: (a) Dynamic checkout pricing and vouchers; (b) Multi-step order state lifecycle; (c) Third-party payment gateways; (d) Event notifications to multiple downstream services.\n2. Select the optimal pattern for each subsystem: Strategy for pricing, State for order lifecycle, Adapter for payment gateways, Observer for events.\n3. Sketch the collaborator interaction diagram showing how these patterns collaborate during checkout.",
    whatToObserve: "Notice that patterns solve local subsystem problems. The overall system is not 'a pattern'—it is a collection of well-factored collaborators where patterns emerge naturally.",
    successCriteria: "Each subsystem is matched with its optimal pattern. Trade-offs and boundary interactions between patterns are clearly justified.",
    thinkAbout: "What is the danger of trying to force as many design patterns as possible into a single problem during an interview?"
  },

  // ===========================================================================
  // PHASE 4: Complex Production LLD Systems & Problem-Driven Concurrency
  // ===========================================================================

  "LLDP4-D4.1.1": {
    goal: "Implement a thread-safe Bounded Queue (Blocking Queue) in modern C++ using std::mutex, std::condition_variable, and RAII locks.",
    whyThisMatters: "Concurrent producer-consumer queues are the core of thread pools, logging pipelines, and message brokers. Subtle mistakes with condition variables cause lost wakeups, deadlocks, and race conditions.",
    yourTask: "1. Create a `BoundedQueue<T>` with a fixed capacity specified in the constructor.\n2. Implement `push(T item)`: if the queue is full, block the producer thread using `std::condition_variable::wait` until space is available.\n3. Implement `pop()`: if the queue is empty, block the consumer thread until an item is pushed.\n4. Use `std::unique_lock<std::mutex>` for lock management and `notify_one()` to wake up waiting threads.\n5. Write a multi-threaded test with 3 producer threads and 2 consumer threads pushing and popping 1,000 integers.",
    whatToObserve: "Notice the predicate check inside `wait(lock, [this]{ return !isFull(); })`. This guards against spurious wakeups where a thread wakes up without an actual state change.",
    successCriteria: "Multi-threaded test completes with zero deadlocks, zero lost items, and clean shutdown. ThreadSanitizer flags zero data races.",
    thinkAbout: "Why must you check the condition in a `while` loop (or predicate lambda) instead of a simple `if` statement when waiting on a condition variable?"
  },

  "LLDP4-D4.1.2": {
    goal: "Implement an Expiring Lock Manager with compensating timeout releases for distributed resource reservations.",
    whyThisMatters: "In reservation systems like BookMyShow or parking allocation, if a user locks a seat and closes their browser, that resource cannot remain locked forever. Expiring locks guarantee eventual consistency.",
    yourTask: "1. Create a `LockManager` that allows locking a resource key (e.g. `seat-A1`) with a Time-To-Live (e.g. 10 minutes).\n2. If another caller attempts to acquire the same resource before TTL expires, reject the acquisition.\n3. Provide an automatic or lazy expiration mechanism: if an acquisition is attempted after the lock has expired, grant the new lock and release the stale one.\n4. Implement an explicit `releaseLock(key, lockToken)` method verifying that only the lock owner can release it.",
    whatToObserve: "Notice how passing an ownership token (like a UUID) prevents Client B from accidentally releasing a lock acquired by Client A after an expiration rollover.",
    successCriteria: "Expired locks release automatically without human intervention. Token validation prevents unauthorized unlock operations.",
    thinkAbout: "What are the trade-offs between a background cleaner thread that periodically checks for expired locks versus lazy expiration on next access?"
  },

  // ===========================================================================
  // PHASE 5: The LLD Interview Arena: Live Defense, Communication & Mocks
  // ===========================================================================

  "LLDP5-D5.1.1": {
    goal: "Master the first 5 minutes of an LLD interview by rapidly clarifying ambiguous requirements and establishing concrete system scope.",
    whyThisMatters: "Most candidates fail LLD interviews in the first 5 minutes by rushing into writing code before clarifying scope, scale, constraints, and out-of-scope features.",
    yourTask: "1. Given an ambiguous prompt: 'Design an Elevator System for a building.'\n2. Formulate 6 essential scoping questions across: capacity, elevator count, scheduling algorithm expectations, passenger safety, and special modes (VIP / Maintenance).\n3. Define clear in-scope features (single bank of elevators, dispatch algorithm, direction tracking) and explicit out-of-scope features (physical motor physics, building floor construction).\n4. Write down the 5-minute scoping script you would speak to the interviewer.",
    whatToObserve: "Notice how stating out-of-scope items explicitly prevents the interviewer from expecting complex edge cases you never agreed to build.",
    successCriteria: "Scoping script establishes concrete boundaries, entity requirements, and operational assumptions within a 5-minute window.",
    thinkAbout: "What should you do if an interviewer responds to a clarifying question with 'It's up to you, what do you think?'"
  },

  "LLDP5-D5.1.2": {
    goal: "Practice rapid entity extraction and public interface design from an unstructured problem description within 8 minutes.",
    whyThisMatters: "Interviewers evaluate your ability to identify noun entities and verb operations quickly and translate them into clean, testable interfaces before diving into implementation.",
    yourTask: "1. Read a requirement narrative for an Online Food Delivery platform.\n2. Extract primary domain entities: `Customer`, `Restaurant`, `MenuItem`, `Order`, `DeliveryPartner`.\n3. Define the public interface contracts: `IOrderCoordinator`, `IRestaurantService`, and `IDeliveryDispatch`.\n4. Ensure method signatures use domain objects rather than raw strings or maps.",
    whatToObserve: "Notice how having clear interfaces immediately visualizes the entire system interaction before writing a single line of method body logic.",
    successCriteria: "Entity list is cohesive and minimal. Method signatures have clear parameters, return types, and explicit error handling contracts.",
    thinkAbout: "How do you prevent creating an anemic domain model where classes are just data holders with getters and setters?"
  },

  "LLDP5-D5.1.3": {
    goal: "Write production-grade, compilable C++ code for core domain operations under a strict 20-minute countdown limit.",
    whyThisMatters: "In an interview, you have at most 20-25 minutes of active coding time. You must write clean, bug-free, idiomatic code without getting bogged down in boilerplate.",
    yourTask: "1. Start a 20-minute timer.\n2. Implement a complete in-memory `RateLimiter` supporting Token Bucket or Sliding Window algorithm for arbitrary client IDs.\n3. Include thread-safety (`std::mutex`), proper header includes, error validation, and a self-contained `main()` driver function showing 5 calls being rate-limited.\n4. Complete and verify compilation before the 20-minute timer expires.",
    whatToObserve: "Notice where you lost time: was it syntax recall, debugging a pointer issue, or over-complicating the data structure? Use this to sharpen your standard coding muscle memory.",
    successCriteria: "Code compiles cleanly with modern C++ flags on the first try. Rate limiting logic correctly allows and rejects requests as expected.",
    thinkAbout: "What minimal subset of modern C++ standard library containers (`std::vector`, `std::unordered_map`, `std::deque`) covers 95% of LLD interview implementations?"
  },

  "LLDP5-D5.1.4": {
    goal: "Practice defending and refactoring an existing design when an interviewer throws a live requirement pivot halfway through the interview.",
    whyThisMatters: "Interviewers frequently wait until minute 30 to introduce a curveball requirement (e.g. 'Now support VIP surge pricing' or 'Now cars can park across multiple motorcycle spots'). They are testing whether your design is open for extension.",
    yourTask: "1. Take a completed baseline `ParkingLot` design that only supports single-spot parking.\n2. Pivot prompt: 'A new requirement arrives: oversized buses require 3 adjacent large spots on the same floor, and must release all 3 simultaneously.'\n3. Defend your adaptation: articulate which classes must change and how your existing allocation interface accommodates or needs adjustment.\n4. Implement the multi-spot reservation logic cleanly without rewriting the parking lot coordinator.",
    whatToObserve: "Notice whether your original spot allocation logic was tightly coupled to single spot IDs, or whether it was encapsulated behind an allocation policy.",
    successCriteria: "Pivot is accommodated with localized modifications. Existing single-spot vehicle tests continue to pass without regression.",
    thinkAbout: "How should your tone and demeanor remain calm and collaborative when an interviewer deliberately challenges your design?"
  },

  "LLDP5-D5.2.1": {
    goal: "Practice verbally justifying architectural abstractions under aggressive interviewer scrutiny.",
    whyThisMatters: "Interviewers will challenge you: 'Why did you create an interface here? Isn't this over-engineering?' You must be able to articulate the concrete trade-off immediately.",
    yourTask: "1. Prepare concise verbal defenses (under 45 seconds each) for 3 common challenges:\n   - 'Why did you create an IPaymentGateway interface when we only use Stripe right now?'\n   - 'Why did you use a separate Value Object for Money instead of just using a double or long?'\n   - 'Why is this field private with a domain method instead of a public getter/setter?'\n2. Record or speak your responses aloud, focusing on testability, invariant protection, and avoiding cascade edits.",
    whatToObserve: "Notice the difference between a defensive response ('That's just standard clean code') versus an engineering trade-off response ('It isolates our checkout logic from Stripe's SDK changes and lets us run unit tests in 1ms with a fake gateway').",
    successCriteria: "Responses are concise, evidence-based, professional, and focus on practical engineering trade-offs.",
    thinkAbout: "When is it actually correct to agree with the interviewer that an abstraction is premature and remove it?"
  },

  "LLDP5-D5.2.2": {
    goal: "Explain concurrency bottlenecks, race condition risks, and lock granularity trade-offs in a live verbal defense exercise.",
    whyThisMatters: "Claiming a system is 'thread-safe' by slapping a global mutex on the entire class will disqualify you from senior engineering roles. You must explain lock granularity and contention trade-offs.",
    yourTask: "1. Review a `BookingSystem` with a single global mutex on `bookSeat()`.\n2. Explain why this creates a severe throughput bottleneck when 1,000 users book seats in different movie theaters simultaneously.\n3. Formulate a defense for fine-grained locking: locking per-theater or per-show versus global locking.\n4. Explain deadlock avoidance: why locks must always be acquired in a consistent global ordering if a transaction needs multiple resources.",
    whatToObserve: "Notice how lock contention drops to near-zero when the lock scope matches the granularity of the actual contested resource.",
    successCriteria: "Defense clearly articulates the trade-off between coarse-grained locks (simple, safe, slow) and fine-grained locks (high throughput, risk of deadlocks).",
    thinkAbout: "What is lock striping, and how does `ConcurrentHashMap` in Java use it to achieve high concurrent throughput?"
  },

  "LLDP5-D5.2.3": {
    goal: "Execute a verbal Think-Aloud modeling exercise while designing a Splitwise expense-sharing system.",
    whyThisMatters: "Interviewers cannot read your mind. If you remain silent for 5 minutes while scribbling class names, the interviewer cannot guide you or evaluate your structured thinking.",
    yourTask: "1. Start a 10-minute timer.\n2. Speak your thought process aloud while designing the core Splitwise domain: User, Group, Expense, Split (Exact, Equal, Percentage).\n3. Verbalize your trade-offs: 'I am choosing to represent Split as an abstract class because percentage splits need validation that sums to 100%, while exact splits validate dollar totals.'\n4. Practice transitioning smoothly from requirement clarification to class structure to code.",
    whatToObserve: "Notice any moments of silence lasting longer than 15 seconds. Practice filling those pauses with structured explanations of what you are evaluating.",
    successCriteria: "Continuous, clear communication. Every major design decision is accompanied by a spoken rationale.",
    thinkAbout: "How can you use check-in phrases like 'Does this interface match what you had in mind before I implement the method?' to keep the interviewer engaged?"
  },

  "LLDP5-D5.3.1": {
    goal: "Execute a high-intensity 30-minute Fast Scoping & Interface Sprint for a Movie Ticket Booking engine.",
    whyThisMatters: "In fast-paced interview formats, you may only have 30 minutes to demonstrate your design ability. You must reach clean interface contracts within the first 10 minutes.",
    yourTask: "1. Set a 30-minute timer.\n2. Minute 0-5: Scope requirements for Movie Ticket Booking (Cinema, Hall, Show, Seat, Booking, Payment).\n3. Minute 5-12: Write clean class and interface declarations with proper relationships.\n4. Minute 12-25: Implement core seat locking and booking logic with temporary hold state.\n5. Minute 25-30: Walk through test cases and explain concurrency handling.",
    whatToObserve: "Check your pacing against the clock at minute 10 and minute 20. Did you get stuck on database persistence or stay focused on core object interactions?",
    successCriteria: "All 5 phases executed within the 30-minute window. Complete, working seat locking contract demonstrated.",
    thinkAbout: "If you realize you are running out of time with 5 minutes left, what should you prioritize: finishing a partial method or explaining the remaining design verbally?"
  },

  "LLDP5-D5.3.2": {
    goal: "Execute a 45-minute Standard Interview Sprint designing an Automated Parking Lot system end-to-end.",
    whyThisMatters: "45 minutes is the standard industry duration for Google, Amazon, and Meta LLD rounds. You must master the end-to-end pacing to deliver complete code with zero awkward pauses.",
    yourTask: "1. Set a 45-minute timer.\n2. 0-7 min: Clarify multi-floor rules, vehicle sizing, fee structures, and display boards.\n3. 7-18 min: Design class hierarchy: `ParkingLot`, `Floor`, `ParkingSpot`, `Vehicle`, `Ticket`, `FeeCalculator`.\n4. 18-38 min: Implement entry vehicle processing, spot assignment, exit fee calculation, and payment.\n5. 38-45 min: Walk through test cases, handle full lot edge cases, and answer scale questions.",
    whatToObserve: "Track your time allocation. Ensure you have working code by minute 35 so you have at least 10 minutes to verify edge cases with the interviewer.",
    successCriteria: "Fully functional, compilable C++ implementation delivered with clean object-oriented structure within 45 minutes.",
    thinkAbout: "How do you handle an interviewer interrupting your implementation to dive deep into a specific algorithm?"
  },

  "LLDP5-D5.3.3": {
    goal: "Execute a 60-minute Comprehensive System Sprint designing a Ride-Sharing Dispatch platform with live requirement evolutions.",
    whyThisMatters: "Senior LLD rounds often span 60 minutes and expect production-grade code, concurrency considerations, driver matching strategies, and resilient state transitions.",
    yourTask: "1. Set a 60-minute timer.\n2. Design a Ride-Sharing platform (Driver, Rider, Trip, Location, MatchingStrategy, PricingStrategy).\n3. Implement trip lifecycle: `REQUESTED -> DRIVER_ASSIGNED -> IN_PROGRESS -> COMPLETED -> PAID`.\n4. Implement dynamic driver matching: nearest driver vs highest rated driver.\n5. Add live evolution: handle rider cancellation with cancellation fees based on elapsed driver travel time.",
    whatToObserve: "Notice how managing state transitions with an explicit state machine makes handling cancellations at any point in the trip lifecycle clean and bug-free.",
    successCriteria: "Complete working dispatch and trip lifecycle implementation delivered within 60 minutes with full edge case handling.",
    thinkAbout: "How do you prevent race conditions when two riders are matched with the exact same nearby driver simultaneously?"
  },

  "LLDP5-D5.4.1": {
    goal: "Complete a Foundation Tier Full Mock Simulation of a Coffee Vending Machine under realistic 60-minute interview conditions.",
    whyThisMatters: "Level C drills test your ability to synthesize all architectural principles—clean contracts, state management, invariant safety, and defensive coding—into one cohesive 60-minute simulation.",
    yourTask: "1. Set a 60-minute timer without looking at reference solutions.\n2. Prompt: Design a Coffee Vending Machine with customizable recipes (Espresso, Cappuccino, Latte), inventory ingredient tracking (Water, Milk, Beans), coin insertion, and maintenance alerts.\n3. Execute the full interview lifecycle: Clarify -> Model -> Implement -> Test -> Defend.\n4. Ensure ingredient stock deduction is atomic: if milk is exhausted halfway through making a Cappuccino, no ingredients are wasted and money is refunded.",
    whatToObserve: "Notice whether your recipe modeling uses composition (ingredients and quantities) or fragile subclassing. Verify that stock depletion triggers an `OutOfIngredientsException` cleanly.",
    successCriteria: "Full working system implemented and verified with test cases within 60 minutes. Recipes can be added or modified without changing the brewing machine coordinator.",
    thinkAbout: "How would you extend this design to support dynamic ingredient pricing based on market commodity costs?"
  },

  "LLDP5-D5.4.2": {
    goal: "Complete an Intermediate Resource Allocation Mock of a Car Rental Platform with an unexpected late-stage curveball requirement.",
    whyThisMatters: "Real interviews test adaptability. When an interviewer changes an assumption at minute 35, your architecture must absorb the change without an entire rewrite.",
    yourTask: "1. Set a 60-minute timer.\n2. Design a Car Rental System: Vehicle inventory, reservations, pickup/drop-off, daily rate billing, and damage inspection reports.\n3. Minute 35 curveball: 'A rental customer can now pick up a car in New York and drop it off in Boston. The system must recalculate inventory across branches and apply an inter-city relocation surcharge.'\n4. Integrate multi-branch inventory tracking and relocation surcharges cleanly into your existing reservation engine.",
    whatToObserve: "Observe how cleanly your original single-branch design adapted. If Branch was hardcoded into the Car entity, the refactor was painful; if Branch was a collaborator, it was trivial.",
    successCriteria: "Inter-city drop-off and relocation fee calculated accurately without breaking local same-branch rentals.",
    thinkAbout: "How does the Open-Closed Principle directly measure your system's resilience to interview curveballs?"
  },

  "LLDP5-D5.4.3": {
    goal: "Complete an Advanced High-Concurrency System Mock of BookMyShow Seat Booking with atomic reservation locks and distributed timeout releases.",
    whyThisMatters: "This is the ultimate Level C benchmark for senior backend and infrastructure LLD interviews: high concurrency, thread safety, race conditions, time-limited seat locks, and transactional booking.",
    yourTask: "1. Set a 75-minute timer.\n2. Implement a complete in-memory BookMyShow engine: Theaters, Screens, Shows, Seats (Silver, Gold, Platinum).\n3. Implement concurrent seat locking: when a user selects 3 seats, lock them for 10 minutes with an expiring lock token.\n4. If 5 concurrent threads attempt to book the exact same seats simultaneously, guarantee that exactly 1 succeeds and 4 receive immediate conflict notifications.\n5. Implement simulated payment confirmation that transitions locked seats to `PERMANENTLY_BOOKED`.",
    whatToObserve: "Run a stress test with 10 threads hitting the same seat. Observe that atomic locks and condition variables eliminate race conditions and prevent double-booking.",
    successCriteria: "Zero seat double-bookings under high concurrent thread contention. Expired seat locks release automatically and can be booked by subsequent users.",
    thinkAbout: "Why is an in-memory lock manager sufficient for single-process LLD interviews, and how would you explain the transition to Redis distributed locks in a real distributed architecture?"
  }
};

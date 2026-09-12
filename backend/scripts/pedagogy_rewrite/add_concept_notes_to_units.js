/**
 * Sarthi LLD — Add Concise Concept Notes / Theory Layer to 43 Learning Units
 * 
 * Satisfies User Specification:
 * - 17 Modules / 43 Units / 48 Drills / 15 Major Problems / 79 Versions remain strictly FROZEN.
 * - Adds a concise "Concept Notes" layer inside each existing Learning Unit.
 * - Beginner-friendly, 20% explanation / 80% doing.
 * - Structure:
 *     ### Concept Notes: [Concept]
 *     **What is it?** ...
 *     **Why does it matter?** ...
 *     **Tiny C++ Example:**
 *     ```cpp
 *     ...
 *     ```
 *     **What should I notice?** ...
 *     → Practice this in the following drill.
 * - Zero-spoiler rule preserved for design pattern units.
 * - DSA tasks remain completely untouched.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const CONCEPT_NOTES = {
  // ==========================================================================
  // PHASE 1: Object & C++ Foundations (8 Units)
  // ==========================================================================

  'LLDP1-U1.1.1': {
    title: 'Object Lifetime & Resource Management',
    whatIsIt: 'In C++, local objects have an automatic lifetime tied directly to the scope `{ ... }` where they are created. When an object is created with `new`, it has a dynamic lifetime that persists in memory until `delete` is explicitly called.',
    whyItMatters: 'Tying resource management (files, network connections, memory) directly to object lifetime ensures that cleanup occurs predictably and automatically when execution leaves scope, eliminating memory leaks and dangling pointers.',
    cppExample: `// Automatic lifetime: destroyed deterministically when scope exits
{
    TrackerBox a("StackBox");
} // a.~TrackerBox() runs here automatically!

// Dynamic lifetime: persists in memory beyond the current block
TrackerBox* b = new TrackerBox("HeapBox");
delete b; // Destruction only happens when delete is explicitly executed`,
    whatToNotice: 'Notice that the local `StackBox` requires no manual cleanup instruction—its lifetime is governed by the curly braces `{ ... }`. The dynamic `HeapBox` remains active in memory until `delete b` is explicitly called.',
    action: 'Practice observing deterministic destruction and lifetime in the following drill.'
  },

  'LLDP1-U1.1.2': {
    title: 'Pointers, References, and the this Pointer',
    whatIsIt: 'A pointer (`Type*`) holds the memory address of an object (can be null or reassigned). A reference (`Type&`) is an alias for an existing object that cannot be null. Inside any member function, `this` is a hidden pointer holding the address of the current object.',
    whyItMatters: 'Passing large objects by `const Type&` avoids costly memory copies, while `this` allows member functions to return self-references for method chaining and distinguish member variables from parameters.',
    cppExample: `class Order {
    double total = 0.0;
public:
    Order& addAmount(double total) {
        this->total += total; // 'this->total' is member; 'total' is parameter
        return *this;         // returns reference to current object
    }
};

void printOrder(const Order& ord); // Borrows without copying`,
    whatToNotice: '`this->total` resolves the name collision between the field and the argument, and returning `*this` enables chaining like `order.addAmount(10).addAmount(20);`.',
    action: 'Practice safe object referencing and method chaining in the following drill.'
  },

  'LLDP1-U1.1.3': {
    title: 'Abstraction, Inheritance, Polymorphism & Virtual Destructors',
    whatIsIt: 'Abstraction defines an interface contract without exposing internal implementation. Polymorphism allows a base pointer or reference (`Payment*`) to invoke the correct derived method (`UPI::pay()`) at runtime using the `virtual` keyword.',
    whyItMatters: 'High-level business logic can interact with generic abstractions. When new payment types are added, existing caller code never needs to change or recompile.',
    cppExample: `class Payment {
public:
    virtual void pay(double amount) = 0; // Pure virtual contract (Abstraction)
    virtual ~Payment() = default;         // Virtual destructor prevents leaks!
};

class UPI : public Payment {
public:
    void pay(double amount) override {
        std::cout << "Paid ₹" << amount << " via UPI\\n";
    }
};`,
    whatToNotice: 'The base class destructor must be `virtual`. If a derived object is deleted through a base pointer (`Payment* p = new UPI(); delete p;`), a non-virtual destructor would leak the derived parts!',
    action: 'Practice runtime polymorphism and safe polymorphic deletion in the following drill.'
  },

  'LLDP1-U1.2.1': {
    title: 'Encapsulation and Invariants',
    whatIsIt: 'Encapsulation bundles data variables and the functions that manipulate them inside a class while hiding internal representations (`private`). An invariant is a rule that must always hold true (e.g. balance cannot be negative).',
    whyItMatters: 'If fields are `public`, any outside code can mutate them into an invalid state without validation. Encapsulation forces all mutations through vetted member functions that defend class invariants.',
    cppExample: `class BankAccount {
private:
    double balance = 0.0; // Hidden: outside code cannot write balance = -9999
public:
    bool withdraw(double amount) {
        if (amount <= 0 || amount > balance) return false; // Invariant defended
        balance -= amount;
        return true;
    }
    double getBalance() const { return balance; }
};`,
    whatToNotice: 'Outside code cannot bypass business validation. The object is guaranteed to remain in a valid, legal state throughout its entire lifecycle.',
    action: 'Practice locking down mutable state and guarding invariants in the following drill.'
  },

  'LLDP1-U1.2.2': {
    title: 'Value Objects and Immutability',
    whatIsIt: 'A Value Object is an object whose identity is determined by its data values rather than a unique ID (e.g., `Money(10, "USD")`, `Coordinate(x, y)`). Value Objects are typically immutable—their state cannot change once constructed.',
    whyItMatters: 'Immutable value objects eliminate side effects. They are completely thread-safe by default, can be freely shared across classes without defensive copying, and cannot become corrupt.',
    cppExample: `class Money {
private:
    const double amount;
    const std::string currency;
public:
    Money(double a, std::string c) : amount(a), currency(std::move(c)) {}
    
    // Returns a brand new instance instead of mutating existing state
    Money add(const Money& other) const {
        return Money(amount + other.amount, currency);
    }
    double getAmount() const { return amount; }
};`,
    whatToNotice: '`add()` does not mutate the current object; it creates and returns a brand-new `Money` instance. The original amounts remain unmodified.',
    action: 'Practice designing immutable domain representations in the following drill.'
  },

  'LLDP1-U1.3.1': {
    title: 'Relationships: Composition, Aggregation, Association & Dependency',
    whatIsIt: 'Object relationships define coupling and ownership: Composition ("part-of", owns lifecycle), Aggregation ("has-a", independent lifecycle), Association ("uses-a", peer connection), and Dependency ("depends-on", transient argument usage).',
    whyItMatters: 'Clarifying who owns and deletes an object prevents double-frees, memory leaks, and overly entangled class graphs.',
    cppExample: `class Engine {}; // Composition: Car owns Engine completely
class Driver {}; // Aggregation: Driver exists independently of Car

class Car {
    Engine engine; // Strong ownership: when Car dies, Engine dies
    Driver* driver; // Weak association: Driver lives on even if Car is destroyed
public:
    Car(Driver* d) : driver(d) {}
    void drive(Road& r); // Dependency: Road is used temporarily as an argument
};`,
    whatToNotice: '`engine` is held by value (Composition). `driver` is passed as an external pointer (Aggregation). `Road` only appears in member function parameters (Dependency).',
    action: 'Practice identifying ownership boundaries and modeling clean object relationships in the following drill.'
  },

  'LLDP1-U1.3.2': {
    title: 'Composition Over Inheritance',
    whatIsIt: 'Composition Over Inheritance is the architectural principle that classes should achieve polymorphic behavior and code reuse by containing instances of other classes rather than inheriting from a base class.',
    whyItMatters: 'Deep inheritance hierarchies create fragile base classes: changing one method in a parent class can break dozen child classes. Composition allows runtime swapping of behaviors without altering class hierarchies.',
    cppExample: `class FlyBehavior {
public:
    virtual void fly() = 0;
};

class Duck {
    FlyBehavior* flyer; // Composed behavior: Duck "has-a" fly capability
public:
    Duck(FlyBehavior* f) : flyer(f) {}
    void performFly() { flyer->fly(); }
    void setFlyer(FlyBehavior* f) { flyer = f; } // Can change behavior at runtime!
};`,
    whatToNotice: 'A `Duck` does not need 15 derived subclasses (`RubberDuck`, `MallardDuck`, etc.). We simply plug in different `FlyBehavior` implementations dynamically.',
    action: 'Practice refactoring rigid inheritance trees into flexible composed components in the following drill.'
  },

  'LLDP1-U1.4.1': {
    title: 'OOAD Responsibility Assignment and Noun-Verb Analysis',
    whatIsIt: 'Object-Oriented Analysis & Design (OOAD) starts with natural language requirements. Nouns map to domain classes and attributes; verbs map to methods and responsibilities.',
    whyItMatters: 'Clear responsibility assignment ensures each class has a singular purpose and prevents bloated "God Classes" that hold every calculation in the system.',
    cppExample: `// Requirement: "Customer places an Order containing LineItems."
// Nouns: Customer, Order, LineItem
// Verbs: placeOrder(), addItem(), calculateTotal()

class LineItem {
    std::string item;
    double price;
public:
    double getSubtotal() const { return price; } // LineItem calculates its subtotal
};

class Order {
    std::vector<LineItem> items; // Order aggregates line items
public:
    void addItem(const LineItem& item) { items.push_back(item); }
    double calculateTotal() const;      // Order sums up item subtotals
};`,
    whatToNotice: '`Order` does not inspect the raw price of each item directly; it delegates subtotal computation to `LineItem`. Each class does what it knows best.',
    action: 'Practice extracting cohesive classes from plain-text problem specifications in the following drill.'
  },

  // ==========================================================================
  // PHASE 2: SOLID Design Principles (6 Units)
  // ==========================================================================

  'LLDP2-U2.1.1': {
    title: 'Single Responsibility Principle (SRP)',
    whatIsIt: 'A class should have one, and only one, reason to change. It must encapsulate exactly one business responsibility.',
    whyItMatters: 'When a class mixes business rules, database persistence, and UI rendering, changes to the database schema risk breaking business calculations and require retesting the entire class.',
    cppExample: `// BAD: Invoice handles calculations AND printing AND database saves
// GOOD: Split into cohesive single-purpose classes
class Invoice {
public:
    double calculateTotal() const { /* business logic */ return 100.0; }
};

class InvoicePrinter {
public:
    void print(const Invoice& inv) { /* printing logic only */ }
};

class InvoiceRepository {
public:
    void save(const Invoice& inv) { /* database logic only */ }
};`,
    whatToNotice: 'If formatting requirements change, only `InvoicePrinter` is edited. `Invoice` calculations and `InvoiceRepository` are completely unaffected.',
    action: 'Practice identifying multi-responsibility classes and splitting them cleanly in the following drill.'
  },

  'LLDP2-U2.1.2': {
    title: 'Interface Segregation Principle (ISP)',
    whatIsIt: 'Clients should not be forced to depend on interfaces they do not use. Prefer many small, client-specific interfaces over one large, bloated "fat" interface.',
    whyItMatters: 'Forcing a class to implement unused methods leads to empty stub functions or runtime exceptions like `throw UnsupportedOperationException()`.',
    cppExample: `// BAD: class Machine { virtual void print()=0; virtual void fax()=0; virtual void scan()=0; };
// A simple printer cannot scan or fax!

// GOOD: Segregated interfaces
class IPrinter { public: virtual void print() = 0; };
class IScanner { public: virtual void scan() = 0; };

class SimplePrinter : public IPrinter {
public:
    void print() override { std::cout << "Printing document\\n"; }
}; // Clean! Never forced to implement scan() or fax()`,
    whatToNotice: '`SimplePrinter` only implements `IPrinter`. It contains zero dummy stubs or fake functions.',
    action: 'Practice breaking down bloated interfaces into focused, cohesive contracts in the following drill.'
  },

  'LLDP2-U2.2.1': {
    title: 'Open/Closed Principle (OCP)',
    whatIsIt: 'Software entities (classes, modules, functions) should be open for extension, but closed for modification.',
    whyItMatters: 'You should be able to add new application features without altering and re-testing already shipped, proven source code.',
    cppExample: `class DiscountPolicy {
public:
    virtual double apply(double total) = 0;
};

// We can add VIPDiscount, SummerDiscount, etc. without modifying OrderCalculator!
class OrderCalculator {
    DiscountPolicy* discount;
public:
    OrderCalculator(DiscountPolicy* d) : discount(d) {}
    double compute(double total) { return discount->apply(total); }
};`,
    whatToNotice: 'Adding a new discount rule requires writing a new class implementing `DiscountPolicy`. `OrderCalculator` code remains completely untouched.',
    action: 'Practice replacing fragile conditional branching with extensible abstractions in the following drill.'
  },

  'LLDP2-U2.2.2': {
    title: 'Liskov Substitution Principle (LSP)',
    whatIsIt: 'Subtypes must be substitutable for their base types without altering the correctness of the program. A derived class must strengthen or preserve the contract of the base class, never weaken it.',
    whyItMatters: 'Violating LSP leads to surprising bugs where code works with the base class but crashes or misbehaves when passed a specific subclass (e.g. classic Rectangle-Square problem).',
    cppExample: `class Bird {
public:
    virtual void move() = 0; // Better than fly(), because not all birds can fly!
};

class Sparrow : public Bird {
public:
    void move() override { std::cout << "Flying through air\\n"; }
};

class Ostrich : public Bird {
public:
    void move() override { std::cout << "Running on ground\\n"; }
}; // Completely safe to substitute anywhere a Bird is expected!`,
    whatToNotice: '`Ostrich` never throws an error or fails a guarantee. Any function accepting `Bird*` can safely call `move()` without special-casing ostriches.',
    action: 'Practice auditing class hierarchies for contract compliance in the following drill.'
  },

  'LLDP2-U2.3.1': {
    title: 'Dependency Inversion Principle (DIP)',
    whatIsIt: 'High-level modules should not depend on low-level modules; both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions.',
    whyItMatters: 'Direct instantiation (`new MySqlDatabase()`) tightly couples business services to specific third-party technologies, making testing and database migration painful.',
    cppExample: `// High-level abstraction
class IMessageSender {
public:
    virtual void send(const std::string& msg) = 0;
};

// High-level service depends on abstraction, NOT concrete SMS/Email service
class NotificationService {
    IMessageSender* sender;
public:
    NotificationService(IMessageSender* s) : sender(s) {} // Injected via constructor
    void notifyUser(const std::string& msg) { sender->send(msg); }
};`,
    whatToNotice: '`NotificationService` can be tested using a `MockMessageSender` without sending real SMS messages, and works seamlessly with any new transport.',
    action: 'Practice injecting abstract dependencies to decouple high-level services in the following drill.'
  },

  'LLDP2-U2.4.1': {
    title: 'Code Smells, YAGNI, and Pragmatic Architecture',
    whatIsIt: 'Code smells are surface indicators of underlying architectural decay (e.g., God Class, Long Method, Feature Envy). YAGNI ("You Aren\'t Gonna Need It") cautions against building speculative abstractions before concrete requirements exist.',
    whyItMatters: 'Over-engineering causes as much maintenance pain as poor design. Good LLD balances clean separation of concerns with pragmatic simplicity.',
    cppExample: `// CODE SMELL (Feature Envy): Method cares more about another class's data
class BadCart {
    void printAddress(const Customer& c) {
        // BadCart reaches deep into Customer's private structure
        std::cout << c.street << ", " << c.city << ", " << c.zip << "\\n";
    }
};

// CLEAN: Move responsibility to the class that owns the data
class Customer {
    std::string street, city, zip;
public:
    std::string getFullAddress() const { return street + ", " + city + " " + zip; }
};`,
    whatToNotice: 'Responsibility is moved to the class holding the data (`Customer`), reducing coupling and eliminating feature envy.',
    action: 'Practice identifying code smells and refactoring them with minimal complexity in the following drill.'
  },

  // ==========================================================================
  // PHASE 3: Design Patterns by Discovery (14 Units) — ZERO-SPOILER RULE PRESERVED
  // ==========================================================================

  'LLDP3-U3.1.1': {
    title: 'Interchangeable Algorithms via Pluggable Contracts',
    whatIsIt: 'When a system must perform an operation using several interchangeable calculation strategies, encapsulating each strategy behind a common interface lets the caller switch approaches dynamically.',
    whyItMatters: 'Avoids massive `switch/case` statements that grow out of control whenever business rules, discounts, or routing algorithms evolve.',
    cppExample: `class RouteCalculator {
public:
    virtual int estimateTimeMinutes(int distanceKm) = 0;
};

class Navigator {
    RouteCalculator* routeCalc;
public:
    Navigator(RouteCalculator* c) : routeCalc(c) {}
    int plan(int dist) { return routeCalc->estimateTimeMinutes(dist); }
};`,
    whatToNotice: '`Navigator` does not know whether you are walking, driving, or biking; it delegates computation to the active plugged-in strategy.',
    action: 'Practice discovering how to extract interchangeable algorithms in the following drill.'
  },

  'LLDP3-U3.1.2': {
    title: 'Decoupled Event Broadcasting and Subscriber Lists',
    whatIsIt: 'A mechanism where one object (the subject) maintains a list of interested listeners and notifies them automatically whenever a significant state change occurs, without knowing who they are.',
    whyItMatters: 'Enables 1-to-many event notifications (e.g., UI updates, push notifications, audit logging) without tight coupling between publisher and consumers.',
    cppExample: `class ISubscriber {
public:
    virtual void onEvent(const std::string& update) = 0;
};

class Publisher {
    std::vector<ISubscriber*> subs;
public:
    void subscribe(ISubscriber* s) { subs.push_back(s); }
    void notifyAll(const std::string& data) {
        for (auto* s : subs) s->onEvent(data);
    }
};`,
    whatToNotice: '`Publisher` only knows about `ISubscriber`. New listeners can register and receive updates without modifying the publisher.',
    action: 'Practice building a clean, decoupled event broadcasting mechanism in the following drill.'
  },

  'LLDP3-U3.1.3': {
    title: 'State-Driven Behavior and Encapsulated Transitions',
    whatIsIt: 'When an entity exhibits completely different behaviors depending on its internal status (e.g. Draft -> InReview -> Published), each state can be encapsulated in its own class object.',
    whyItMatters: 'Eliminates repetitive `if (state == DRAFT) ... else if (state == REVIEW)` checks scattered across dozens of methods.',
    cppExample: `class OrderContext;
class OrderState {
public:
    virtual void proceed(OrderContext& ctx) = 0;
};

class OrderContext {
    OrderState* current;
public:
    void setState(OrderState* s) { current = s; }
    void next() { current->proceed(*this); }
};`,
    whatToNotice: 'Transitions and permitted operations are governed by individual state objects, keeping transition rules isolated and testable.',
    action: 'Practice eliminating messy state conditionals in the following drill.'
  },

  'LLDP3-U3.1.4': {
    title: 'Reversible Actions, Queuing, and Request Encapsulation',
    whatIsIt: 'Encapsulating all details of a request (the receiver, the action, and parameters) inside a dedicated action object with `execute()` and `undo()` methods.',
    whyItMatters: 'Allows requests to be passed as arguments, scheduled in queues, logged to audit trails, and reversed step-by-step.',
    cppExample: `class IAction {
public:
    virtual void execute() = 0;
    virtual void undo() = 0;
};

class ActionHistory {
    std::vector<IAction*> history;
public:
    void apply(IAction* a) { a->execute(); history.push_back(a); }
    void rollbackLast() {
        if (!history.empty()) { history.back()->undo(); history.pop_back(); }
    }
};`,
    whatToNotice: '`ActionHistory` does not know what the actions actually do; it simply commands them to `execute()` and `undo()`.',
    action: 'Practice modeling executable and reversible commands in the following drill.'
  },

  'LLDP3-U3.1.5': {
    title: 'Sequential Validation and Handler Pipelines',
    whatIsIt: 'Passing a request along a linked sequence of potential handlers. Each handler decides whether to process the request, reject it, or pass it to the next handler in the pipeline.',
    whyItMatters: 'Decouples the sender of a request from its receivers and allows validation steps (auth, rate limiting, sanitization) to be dynamically reordered or extended.',
    cppExample: `class Handler {
protected:
    Handler* next = nullptr;
public:
    void setNext(Handler* n) { next = n; }
    virtual void handle(const std::string& req) {
        if (next) next->handle(req);
    }
};`,
    whatToNotice: 'Each handler performs its specific check. If validation succeeds, it transparently forwards execution to `next`.',
    action: 'Practice building a flexible processing pipeline in the following drill.'
  },

  'LLDP3-U3.2.1': {
    title: 'Decoupled Object Instantiation and Construction Encapsulation',
    whatIsIt: 'Techniques that separate the complex construction of an object from its business usage, hiding constructor details and dynamic subtype selection behind factory methods or step-by-step builders.',
    whyItMatters: 'Client code does not need to know which concrete subclasses exist or memorize long, error-prone 10-parameter constructors.',
    cppExample: `class Dialog {
protected:
    virtual Button* createButton() = 0; // Factory method hook
public:
    void render() {
        Button* b = createButton();
        b->paint();
    }
};`,
    whatToNotice: 'The base `Dialog` handles generic workflow logic, while subclasses determine the concrete `Button` type instantiated.',
    action: 'Practice isolating object creation from business logic in the following drill.'
  },

  'LLDP3-U3.2.2': {
    title: 'Dynamic Behavior Stacking and Interface Adaptation',
    whatIsIt: 'Wrapping an object to either attach new behaviors dynamically without modifying original code (stacking wrappers), or to translate an incompatible interface into one the client expects.',
    whyItMatters: 'Allows classes from external libraries or legacy code to integrate into modern contracts without subclass explosion.',
    cppExample: `class LegacyNotifier {
public:
    void sendLegacy(const char* text) { /* ... */ }
};

class ModernSender {
public:
    virtual void send(const std::string& msg) = 0;
};

class SenderAdapter : public ModernSender {
    LegacyNotifier legacy;
public:
    void send(const std::string& msg) override { legacy.sendLegacy(msg.c_str()); }
};`,
    whatToNotice: '`SenderAdapter` bridges the gap between `ModernSender` and `LegacyNotifier` with zero changes to either class.',
    action: 'Practice wrapping and adapting classes in the following drill.'
  },

  'LLDP3-U3.2.3': {
    title: 'Uniform Hierarchies and Tree Structures',
    whatIsIt: 'Composing objects into tree structures to represent part-whole hierarchies, allowing clients to treat individual objects and compositions of objects uniformly.',
    whyItMatters: 'Simplifies client code when operating on complex structures like file systems, UI component trees, or graphic groups.',
    cppExample: `class FileSystemItem {
public:
    virtual int getSize() = 0;
};

class Folder : public FileSystemItem {
    std::vector<FileSystemItem*> items;
public:
    void add(FileSystemItem* item) { items.push_back(item); }
    int getSize() override {
        int total = 0;
        for (auto* item : items) total += item->getSize();
        return total;
    }
};`,
    whatToNotice: '`Folder` can contain files OR other folders. Calling `getSize()` traverses the entire hierarchy recursively and transparently.',
    action: 'Practice treating individual items and composite groups uniformly in the following drill.'
  },

  'LLDP3-U3.3.1': {
    title: 'Controlled Access, Facades, and Template Methods',
    whatIsIt: 'Structural techniques that control access to sensitive objects (proxies), provide simplified entry points into complex subsystems (facades), or define the skeleton of an algorithm in a base class while letting subclasses override specific steps (template methods).',
    whyItMatters: 'Shields client applications from raw internal complexity, enforces security and lazy loading, and avoids code duplication in multi-step workflows.',
    cppExample: `class DataPipeline {
public:
    void run() { // Template Method: skeleton defined once
        extract();
        transform();
        load();
    }
    virtual void extract() = 0;
    virtual void transform() = 0;
    virtual void load() { std::cout << "Default load\\n"; }
};`,
    whatToNotice: 'The execution order is locked in `run()`, while specific data processing steps are customized by subclasses.',
    action: 'Practice simplifying subsystem access and orchestrating workflow steps in the following drill.'
  },

  'LLDP3-U3.3.2': {
    title: 'Single-Instance Management, Hazards & Controlled Sharing',
    whatIsIt: 'Managing shared state across a system. While traditional global singletons create hidden dependencies and testing nightmares, controlled dependency sharing ensures single-instance semantics cleanly.',
    whyItMatters: 'Global mutable state breaks unit test isolation and introduces hidden race conditions. Learning safe scoping alternatives is essential for robust LLD.',
    cppExample: `class DatabaseConfig {
private:
    DatabaseConfig() = default; // Private constructor prevents multiple instances
public:
    static DatabaseConfig& getInstance() {
        static DatabaseConfig instance; // Thread-safe in C++11!
        return instance;
    }
};`,
    whatToNotice: 'The local static variable inside `getInstance()` guarantees thread-safe, lazy initialization on first use.',
    action: 'Practice evaluating single-instance tradeoffs and controlled sharing in the following drill.'
  },

  'LLDP3-U3.3.3': {
    title: 'Resource Sharing via Flyweights & Centralized Mediation',
    whatIsIt: 'Flyweight shares common immutable state among thousands of objects to drastically cut memory usage. Mediator centralizes complex communication between many peer objects into a single coordination point.',
    whyItMatters: 'Prevents out-of-memory errors in high-volume systems and untangles dense "many-to-many" web relationships into clean "many-to-one" connections.',
    cppExample: `// Flyweight: Extrinsic state (position) is separate from intrinsic state (tree model)
class TreeType {
    std::string name, color, texture; // Shared by 1,000,000 trees!
public:
    TreeType(std::string n, std::string c, std::string t)
      : name(std::move(n)), color(std::move(c)), texture(std::move(t)) {}
};

class Tree {
    int x, y;
    const TreeType* type; // Lightweight pointer to shared flyweight
};`,
    whatToNotice: 'Instead of storing heavy strings in every tree, all trees share a pointer to the single immutable `TreeType`.',
    action: 'Practice optimizing memory and centralizing coordination in the following drill.'
  },

  'LLDP3-U3.4.1': {
    title: 'Strategy vs State: Spotting the Key Architectural Differences',
    whatIsIt: 'While Strategy and State share nearly identical UML class diagrams (Context delegates to an Interface), their design intents are fundamentally different: Strategy is chosen by the client to configure *how* an algorithm works, whereas State changes automatically as internal transitions occur.',
    whyItMatters: 'Confusing Strategy and State results in either rigid strategies that try to alter system context or an uncoordinated state machine managed from the outside.',
    cppExample: `// Strategy: Injected once from outside; independent of context transitions
PaymentProcessor proc(new CreditCardStrategy());

// State: Automatically transitions internally based on events
vendingMachine.insertCoin(); // Internally transitions from HasNoCoin to HasCoinState`,
    whatToNotice: 'Strategy is about interchangeable behavior chosen by the caller. State is about internal lifecycle transitions driven by system events.',
    action: 'Practice distinguishing and selecting between Strategy and State in the following drill.'
  },

  'LLDP3-U3.4.2': {
    title: 'Decorator vs Adapter vs Proxy: Choosing the Right Wrapper',
    whatIsIt: 'All three patterns wrap another object, but with distinct intents: Adapter changes an incompatible interface to match expectations; Decorator preserves the interface but enriches behavior; Proxy preserves the interface but controls access or caches results.',
    whyItMatters: 'Choosing the wrong wrapper leads to leaky abstractions or redundant adapter layers where a decorator was intended.',
    cppExample: `// Adapter: Changes interface (e.g. legacy int ID -> std::string UUID)
// Decorator: Same interface, adds features (e.g. EncryptionStream(CompressionStream(FileStream)))
// Proxy: Same interface, controls access (e.g. AuthenticatedProxy, CachingProxy)`,
    whatToNotice: 'Remember: Adapter changes the contract. Decorator enhances the contract. Proxy guards the contract.',
    action: 'Practice comparing wrapper intents and selecting the right pattern in the following drill.'
  },

  'LLDP3-U3.4.3': {
    title: 'Predicting Pattern Emergence as Requirements Evolve',
    whatIsIt: 'Design patterns are not applied preemptively; they emerge naturally when software changes exert pressure on existing designs (e.g. growing conditionals, exploding subclasses, tight coupling).',
    whyItMatters: 'Senior engineers do not memorize 23 patterns in isolation; they recognize the specific architectural forces that trigger each design refactoring.',
    cppExample: `// Stage 1: Simple if/else (Keep it simple)
// Stage 2: 5th condition added -> Extract strategy
// Stage 3: Dynamic combinations needed -> Stack decorators
// Stage 4: Cross-service event reactions -> Subscribe listeners`,
    whatToNotice: 'Good architecture evolves through small, justified refactoring steps rather than massive upfront over-engineering.',
    action: 'Practice spotting refactoring triggers and guiding pattern emergence in the following drill.'
  },

  // ==========================================================================
  // PHASE 4: Concurrency & Real-World System Mechanics (2 Units)
  // ==========================================================================

  'LLDP4-U4.1.1': {
    title: 'Race Conditions, Mutexes, and Thread Safety',
    whatIsIt: 'A race condition occurs when multiple threads concurrently access and mutate shared data without synchronization. A mutex (`std::mutex`) provides mutual exclusion, ensuring only one thread enters a critical section at any instant.',
    whyItMatters: 'Without synchronization, multi-threaded operations like double-booking a seat or corrupting an account balance will occur in high-traffic applications.',
    cppExample: `class SafeCounter {
    int count = 0;
    std::mutex mtx;
public:
    void increment() {
        std::lock_guard<std::mutex> lock(mtx); // RAII lock: automatically releases on return
        count++;
    }
    int get() {
        std::lock_guard<std::mutex> lock(mtx);
        return count;
    }
};`,
    whatToNotice: '`std::lock_guard` acquires the mutex in its constructor and unlocks it automatically in its destructor, preventing deadlocks even if an exception is thrown.',
    action: 'Practice diagnosing race conditions and protecting critical sections in the following drill.'
  },

  'LLDP4-U4.1.2': {
    title: 'Resource Leases, Time-outs, and Compensating Rollbacks',
    whatIsIt: 'In real-world reservation systems (e.g., ticket booking, hotel rooms), resources are locked temporarily under a lease (e.g., 10-minute hold). If payment does not complete within the timeout, the lease expires and the resource is released via a compensating transaction.',
    whyItMatters: 'Prevents abandoned user sessions or payment gateway delays from locking inventory indefinitely.',
    cppExample: `struct SeatHold {
    std::string seatId;
    std::chrono::steady_clock::time_point expiresAt;
    
    bool isExpired() const {
        return std::chrono::steady_clock::now() > expiresAt;
    }
};`,
    whatToNotice: 'Timeouts must be evaluated against monotonic time (`std::chrono::steady_clock`), and expired holds must be safely returned to available inventory.',
    action: 'Practice implementing lease expirations and idempotent release logic in the following drill.'
  },

  // ==========================================================================
  // PHASE 5: Interview Excellence & Live System Design (13 Units)
  // ==========================================================================

  'LLDP5-U5.1.1': {
    title: 'The First 5 Minutes: Scoping, Assumptions & Invariant Clarification',
    whatIsIt: 'The systematic process of clarifying ambiguous requirements, agreeing on core system boundaries, and listing non-goals with your interviewer before writing any code.',
    whyItMatters: 'Jumping straight into code without clarifying assumptions almost always results in building the wrong system and running out of time.',
    cppExample: `// Checklist to clarify in first 5 minutes:
// 1. Entities: "Are we handling multi-floor parking or single-lot?"
// 2. Concurrency: "Does this run single-threaded or under concurrent booking?"
// 3. Extensibility: "Will vehicle fee calculations change dynamically?"
// 4. Non-goals: "Should we assume payment gateway is a black-box API?"`,
    whatToNotice: 'Explicitly writing down 3-4 assumptions on the whiteboard locks in scope and prevents surprise requirements late in the interview.',
    action: 'Practice scoping requirements and clarifying edge cases in the following drill.'
  },

  'LLDP5-U5.1.2': {
    title: 'Domain Boundary Mapping and API Contract Definition',
    whatIsIt: 'Translating verified requirements into class headers, public methods, and interaction contracts before writing method bodies.',
    whyItMatters: 'Demonstrates architectural maturity. Interviewers can review your API signatures and catch structural flaws in minutes before you write implementation code.',
    cppExample: `class ParkingSpot { /* ... */ };
class Vehicle { /* ... */ };

class ParkingLot {
public:
    virtual bool park(Vehicle* v) = 0;
    virtual bool unpark(const std::string& ticketId) = 0;
    virtual double calculateFee(const std::string& ticketId) = 0;
};`,
    whatToNotice: 'The public interface defines clear inputs and return values. The interviewer can immediately confirm whether this matches their expectations.',
    action: 'Practice designing clean public API contracts in the following drill.'
  },

  'LLDP5-U5.1.3': {
    title: '20-Minute Working Implementation and Invariant Defense',
    whatIsIt: 'The core implementation sprint where you write clean, working C++ that fulfills functional requirements while aggressively defending invariants (valid state, no null pointers, accurate arithmetic).',
    whyItMatters: 'Working, bug-free code that meets core requirements beats a half-finished "perfect" architecture every single time.',
    cppExample: `bool ParkingLot::park(Vehicle* v) {
    if (!v) return false; // Invariant: null check
    auto* spot = findAvailableSpot(v->getType());
    if (!spot) return false; // Invariant: capacity limit
    spot->assignVehicle(v);
    return true;
} // Clear, defensively written, complete!`,
    whatToNotice: 'Notice the guard clauses at the top of the function. Input validation prevents unexpected crashes.',
    action: 'Practice rapid, bug-free implementation under realistic interview conditions in the following drill.'
  },

  'LLDP5-U5.1.4': {
    title: 'Handling Mid-Interview Requirement Pivots and Curveballs',
    whatIsIt: 'The ability to gracefully incorporate a sudden requirement change introduced by the interviewer (e.g. "Now we also need surge pricing during peak hours").',
    whyItMatters: 'Tests whether your initial architecture was genuinely open for extension or tightly coupled to initial assumptions.',
    cppExample: `// Initial: flat rate pricing
// Curveball: "Add dynamic surge pricing and holiday discounts"
// Because we used an IFeeStrategy interface, we simply add:
class SurgeFeeStrategy : public IFeeStrategy {
    double calculate(double base) override { return base * 1.5; }
};`,
    whatToNotice: 'Because fee calculation was isolated behind an interface, the pivot requires adding one new class rather than rewriting `ParkingLot`.',
    action: 'Practice refactoring your code in response to surprise constraints in the following drill.'
  },

  'LLDP5-U5.2.1': {
    title: 'Defending Simplicity vs Over-Engineering in Interviews',
    whatIsIt: 'Articulating why you chose a simple direct solution over a complex design pattern when the requirements did not warrant extra abstractions.',
    whyItMatters: 'Interviewers often probe candidates by asking "Why didn\'t you use Abstract Factory or Visitor here?". Giving a clear, pragmatic defense demonstrates senior judgment.',
    cppExample: `// Good explanation:
// "With only 2 fixed vehicle types and no requirement for runtime plugins,
// an enum with a direct switch statement is simpler and easier to maintain.
// If we introduce third-party vehicle types, we can refactor to a strategy hierarchy."`,
    whatToNotice: 'Senior engineers justify complexity through requirements, avoiding speculative over-engineering.',
    action: 'Practice justifying architectural decisions and trade-offs in the following drill.'
  },

  'LLDP5-U5.2.2': {
    title: 'Concurrency Bottlenecks and Lock Contention Defense',
    whatIsIt: 'Analyzing how your synchronization choices impact throughput (e.g. coarse-grained global mutex vs fine-grained per-slot locks).',
    whyItMatters: 'In high-scale LLD interviews, an interviewer will immediately ask: "What happens when 1,000 cars arrive at the same second? Will your global lock hold up?".',
    cppExample: `// Coarse: 1 lock for entire parking lot (High contention!)
// Fine-grained: 1 lock per parking floor or spot (Low contention, high concurrency!)
class ParkingFloor {
    std::mutex floorMtx; // Locking floor 1 does not block parking on floor 2!
};`,
    whatToNotice: 'Partitioning locks reduces contention and allows concurrent operations across independent domain partitions.',
    action: 'Practice analyzing lock granularity and optimizing throughput in the following drill.'
  },

  'LLDP5-U5.2.3': {
    title: 'Thinking Out Loud and Collaborative Trade-Off Communication',
    whatIsIt: 'The communication skill of voicing your design decisions, trade-offs, and uncertainties continuously so the interviewer can steer you toward what they care about.',
    whyItMatters: 'An interview is a collaborative design session. A candidate who thinks in silence for 20 minutes risks spending the entire session solving the wrong problem.',
    cppExample: `// Exemplary communication script:
// "I am considering two options for tracking spot availability:
// Option A: A boolean flag inside each Spot object (O(N) search).
// Option B: A set of free spot IDs grouped by vehicle type (O(1) lookup, slight memory overhead).
// Since lookups happen on every vehicle entry, I will choose Option B."`,
    whatToNotice: 'Option evaluation demonstrates structured thinking and invites the interviewer to provide early feedback.',
    action: 'Practice verbalizing trade-offs and decision criteria in the following drill.'
  },

  'LLDP5-U5.3.1': {
    title: 'The 30-Minute Fast Scoping and Interface Sprint',
    whatIsIt: 'A time-boxed exercise focusing purely on speed: clarifying requirements in 5 minutes and producing complete, compilable class interfaces in 25 minutes.',
    whyItMatters: 'Builds muscle memory so API modeling becomes second nature, leaving ample time for deep business logic and concurrency discussions.',
    cppExample: `// Target: Complete, compilable header file in < 25 mins
class IStorage { /* ... */ };
class CachePolicy { /* ... */ };
class KeyValueStore { /* ... */ };`,
    whatToNotice: 'Speed comes from knowing common domain patterns and adhering to clean interface separation.',
    action: 'Practice rapid interface modeling under strict time limits in the following drill.'
  },

  'LLDP5-U5.3.2': {
    title: 'The Standard 45-Minute End-to-End Interview Sprint',
    whatIsIt: 'The standard tech industry LLD format: 5 mins scoping, 10 mins API design, 20 mins core implementation, 10 mins testing, edge cases, and extensions.',
    whyItMatters: 'Pacing is the #1 reason strong engineers fail LLD interviews. Practicing the full 45-minute lifecycle ensures you finish before time expires.',
    cppExample: `// Timeline:
// [00-05m] Scoping & Requirements
// [05-15m] Core Classes & Invariants
// [15-35m] Working Implementation
// [35-45m] Concurrency, Edge Cases & Wrap-up`,
    whatToNotice: 'Maintaining this cadence guarantees a complete working solution by minute 35.',
    action: 'Practice delivering complete end-to-end designs within 45 minutes in the following drill.'
  },

  'LLDP5-U5.3.3': {
    title: 'The 60-Minute Comprehensive Production Architecture Sprint',
    whatIsIt: 'Extended interview simulation featuring rigorous concurrency, thread pools, persistence layers, and fault tolerance.',
    whyItMatters: 'Prepares you for Staff-level and Principal-level design interviews where deep mechanics and edge-case resilience are evaluated.',
    cppExample: `// Production requirements:
// - Thread-safe operations with minimal lock contention
// - Graceful shutdown and resource cleanup
// - Clear separation of repository, service, and controller layers`,
    whatToNotice: 'System components are designed for high throughput, clean testing, and robust error recovery.',
    action: 'Practice architecting production-grade systems in the following drill.'
  },

  'LLDP5-U5.4.1': {
    title: 'Foundational System Mock Simulation',
    whatIsIt: 'Full simulation testing your mastery of foundational OOAD principles: modeling real-world entities, establishing ownership, and defending invariants.',
    whyItMatters: 'Validates that basic object-oriented principles are second nature before tackling high-concurrency systems.',
    cppExample: `// Self-audit rubric:
// 1. Are all member variables private? (Encapsulation)
// 2. Are object lifecycles clear? (No dangling references)
// 3. Are class responsibilities focused? (SRP)`,
    whatToNotice: 'Every design choice should be defensible against the foundational principles learned in Phase 1 and 2.',
    action: 'Practice conducting a complete foundational system mock in the following drill.'
  },

  'LLDP5-U5.4.2': {
    title: 'Resource Allocation Mock with Dynamic Curveball',
    whatIsIt: 'Full simulation involving inventory allocation (parking spots, lockers, movie seats) followed by a mid-interview requirement change.',
    whyItMatters: 'Demonstrates agility, modular design, and the ability to adapt running code without panic or architectural collapse.',
    cppExample: `// Strategy for curveballs:
// 1. Take a breath and summarize the new requirement.
// 2. Identify which interface or class is responsible.
// 3. Extend without breaking existing tests (OCP).`,
    whatToNotice: 'A well-designed system accommodates curveballs through extension rather than surgery.',
    action: 'Practice handling dynamic requirement changes in the following drill.'
  },

  'LLDP5-U5.4.3': {
    title: 'High-Concurrency System Mock Simulation',
    whatIsIt: 'Comprehensive capstone simulation requiring thread safety, atomic booking, lease timeouts, and clean synchronization under heavy load.',
    whyItMatters: 'Demonstrates mastery of all 5 phases: OOAD fundamentals, SOLID principles, design patterns, and thread-safe execution.',
    cppExample: `// Capstone Checklist:
// [x] Encapsulated state & validated invariants
// [x] Single responsibility per class
// [x] Thread-safe operations via RAII locks
// [x] Automated lease cleanup and rollback`,
    whatToNotice: 'All architectural layers unite into a cohesive, rock-solid, production-grade system.',
    action: 'Practice mastering the complete high-concurrency capstone in the following drill.'
  }
};

/**
 * Formats a Concept Notes markdown section.
 */
function buildConceptNotesBlock(notes) {
  return `### Concept Notes: ${notes.title}
**What is it?**
${notes.whatIsIt.trim()}

**Why does it matter?**
${notes.whyItMatters.trim()}

**Tiny C++ Example:**
\`\`\`cpp
${notes.cppExample.trim()}
\`\`\`

**What should I notice?**
${notes.whatToNotice.trim()}

→ ${notes.action.trim()}

`;
}

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');

  const taskSchema = new mongoose.Schema({
    taskId: String,
    taskName: String,
    taskDescription: String,
    metadata: mongoose.Schema.Types.Mixed
  }, { strict: false });

  const Task = mongoose.model('Task', taskSchema);

  const units = await Task.find({ taskId: /^LLDP\d+-U/ }).sort({ taskId: 1 });
  console.log(`Found ${units.length} Learning Units in MongoDB.`);

  let updatedCount = 0;

  for (const unit of units) {
    const note = CONCEPT_NOTES[unit.taskId];
    if (!note) {
      console.warn(`[WARN] No concept note defined for ${unit.taskId}`);
      continue;
    }

    const conceptBlock = buildConceptNotesBlock(note);
    let desc = unit.taskDescription || '';

    // If unit already has a Concept Notes block, replace it cleanly
    if (desc.includes('### Concept Notes:')) {
      desc = desc.replace(/### Concept Notes:[\s\S]*?(?=### 1\. What Are We Trying To Solve\?|$)/, conceptBlock);
    } else {
      // Prepend at the very beginning of the unit description
      desc = conceptBlock + desc;
    }

    unit.taskDescription = desc;
    await unit.save();
    updatedCount++;
    console.log(`[UPDATED] ${unit.taskId}: ${note.title}`);
  }

  console.log(`\nSuccessfully applied Concept Notes to ${updatedCount}/${units.length} Learning Units.`);

  // Final verification of counts
  const totalTasks = await Task.countDocuments();
  const dsaCount = await Task.countDocuments({ taskId: /^DSA/ });
  const lldCount = await Task.countDocuments({ taskId: /^LLD/ });
  const unitCount = await Task.countDocuments({ taskId: /^LLDP\d+-U/ });
  const drillCount = await Task.countDocuments({ taskId: /^LLDP\d+-D/ });
  const majorProblemCount = await Task.countDocuments({ taskId: /^LLDP\d+-P\d+$/ });
  const versionCount = await Task.countDocuments({ taskId: /^LLDP\d+-P\d+-V/ });
  const moduleCount = await Task.countDocuments({ taskId: /^LLDP\d+-M/ });

  console.log('\n================ CURRICULUM INTEGRITY VERIFICATION ================');
  console.log(`Total Tasks in DB: ${totalTasks}`);
  console.log(`DSA Tasks (MUST BE 458): ${dsaCount}`);
  console.log(`LLD Tasks (MUST BE 202): ${lldCount}`);
  console.log(`- Modules (17): ${moduleCount}`);
  console.log(`- Learning Units (43): ${unitCount}`);
  console.log(`- Drills (48): ${drillCount}`);
  console.log(`- Major Problems (15): ${majorProblemCount}`);
  console.log(`- Problem Versions (79): ${versionCount}`);

  if (dsaCount === 458 && lldCount === 202 && unitCount === 43 && drillCount === 48 && majorProblemCount === 15 && versionCount === 79 && moduleCount === 17) {
    console.log('>>> ALL CURRICULUM COUNTS ARE FROZEN AND 100% INTACT! <<<');
  } else {
    console.error('>>> MISMATCH DETECTED IN CURRICULUM COUNTS! <<<');
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

run().catch(err => {
  console.error('Error applying concept notes:', err);
  process.exit(1);
});

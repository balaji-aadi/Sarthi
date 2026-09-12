import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatUnitDescription, formatDrillDescription, formatMajorProblemDescription, formatProblemVersionDescription } from './content_formatters.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PHASE1_REWRITE = {};

// ============================================================================
// MODULES (4)
// ============================================================================
PHASE1_REWRITE['LLDP1-M1'] = {
  taskName: 'Module 1.1: How C++ Creates, Holds, and Destroys Objects',
  taskDescription: 'Before designing complex systems, learn how objects exist in memory, how functions know which object called them, and how one variable can safely manage different types of objects.'
};

PHASE1_REWRITE['LLDP1-M2'] = {
  taskName: 'Module 1.2: Protecting an Object’s Internal Data',
  taskDescription: 'Learn why letting outside code directly edit an object’s variables leads to broken calculations and weird bugs, and how to build classes that guard their own rules.'
};

PHASE1_REWRITE['LLDP1-M3'] = {
  taskName: 'Module 1.3: Connecting Objects Together',
  taskDescription: 'Learn how objects communicate, who is responsible for deleting whom, and why combining small objects together is almost always better than building massive inheritance trees.'
};

PHASE1_REWRITE['LLDP1-M4'] = {
  taskName: 'Module 1.4: From English Requirements to Working Classes',
  taskDescription: 'Learn how to read a plain English problem statement, identify the key real-world things and actions, and turn them into clean classes with clear responsibilities.'
};

// ============================================================================
// LEARNING UNITS (8)
// ============================================================================

// Unit 1.1.1
PHASE1_REWRITE['LLDP1-U1.1.1'] = {
  taskName: 'Unit 1.1.1: What Happens to an Object When We Leave the Block Where It Was Created?',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'When your program creates data in memory, how do you make sure that resources get cleaned up automatically when you are done, instead of remaining allocated indefinitely?',
    seeItWithASmallExample: `Observe these two distinct ways of creating an object:

Way 1 (Automatic Lifetime):
\`\`\`cpp
{
    TrackerBox a("StackBox"); // Created directly inside braces
} // As soon as execution leaves this closing brace, StackBox is automatically destroyed.
\`\`\`

Way 2 (Dynamic Lifetime):
\`\`\`cpp
TrackerBox* b = new TrackerBox("HeapBox"); // Created with "new"
// When execution leaves this scope, the pointer variable disappears,
// BUT HeapBox in memory is STILL ALIVE until explicitly deleted!
delete b; // Now HeapBox is destroyed.
\`\`\``,
    whatIsGoingWrong: 'If you allocate objects dynamically with "new" and forget to release them, your system gradually leaks memory until resources are exhausted. Conversely, if an object is destroyed while other components are still reading it, your program will access invalid memory and crash.',
    theSimpleIdea: 'Let the curly braces `{ ... }` govern the lifecycle. When an object lives directly inside a local scope, C++ guarantees that when execution leaves that block, the object\'s destructor runs deterministically and frees its resources.',
    technicalWords: [
      { term: 'Automatic Lifetime', explanation: 'Local objects whose storage and destruction are tied to the enclosing `{ ... }` block.' },
      { term: 'Dynamic Lifetime', explanation: 'Objects requested with `new` whose lifetime continues until explicitly released with `delete`.' },
      { term: 'Destructor', explanation: 'A special member function (like `~TrackerBox()`) called automatically when an object reaches the end of its lifetime.' },
      { term: 'RAII', explanation: 'Resource Acquisition Is Initialization—the architectural principle where acquiring a resource is tied directly to the lifetime of an object.' }
    ],
    whyThisMattersInLLD: 'In production low-level design, database connections, locks, and open files must never be leaked. Knowing who owns an object and what scope governs its lifetime eliminates memory leaks and dangling pointers.',
    tryIt: 'Follow the guided experiment with `TrackerBox("StackBox")` and `TrackerBox* b = new TrackerBox("HeapBox")` to observe automatic scope cleanup vs explicit heap release.',
    nowChangeTheRequirement: 'Observe what happens when leaving the scope without `delete b` versus calling `delete b` explicitly.',
    whatDidTheChangeTeachUs: 'Without an explicit `delete`, the destructor of a heap object never runs upon leaving scope, whereas a stack object destructor runs deterministically at the closing brace.',
    canYouExplainIt: 'Can you explain to a colleague why a local object created inside `{ ... }` cleans itself up automatically, while an object created with `new` persists until `delete` is executed?'
  })
};

// Unit 1.1.2
PHASE1_REWRITE['LLDP1-U1.1.2'] = {
  taskName: 'Unit 1.1.2: Sharing an Object vs Making a Copy',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'If you have a large object (like an Engine or a Shopping Cart), how do you pass it into a function without duplicating the entire object in memory, and how do you make sure the original object is not accidentally modified?',
    seeItWithASmallExample: `Imagine passing an Engine into a Car:

void inspect(Engine engine);        // Copies the entire Engine! Slow and wastes memory.
void inspect(Engine& engine);       // Borrows the original Engine. Can accidentally change it.
void inspect(const Engine& engine); // Borrows the original Engine safely. Cannot change it!`,
    whatIsGoingWrong: 'If you pass by value, large data structures get copied repeatedly, slowing your system to a crawl. If you pass raw pointers to temporary local objects, the function might try to read an object that has already been destroyed, crashing the program.',
    theSimpleIdea: 'Whenever you want a function to read an object, borrow it with `const &`. You avoid copying, and you guarantee the function cannot tamper with the object.',
    technicalWords: [
      { term: 'Pass by Value', explanation: 'Making a complete duplicate of the data.' },
      { term: 'Pass by Reference (&)', explanation: 'Passing the actual object itself using an alias, avoiding any copy.' },
      { term: 'Const Reference (const &)', explanation: 'Borrowing the original object in read-only mode.' },
      { term: 'Dangling Pointer', explanation: 'A pointer that points to a memory address where the object has already been destroyed.' }
    ],
    whyThisMattersInLLD: 'Good object-oriented design clearly defines which class owns an object and which classes are just temporarily borrowing a reference to view it.',
    tryIt: 'Create a `Car` and pass an `Engine` to a function `void test(const Engine& e)`. Try writing `e.horsepower = 500;` inside the function and observe the compiler stop you.',
    nowChangeTheRequirement: 'Change the function to take a raw pointer `Engine* e` where the engine was created inside another helper function that already returned.',
    whatDidTheChangeTeachUs: 'Accessing an object whose enclosing function has already returned causes memory corruption because the borrowed object is already dead.',
    canYouExplainIt: 'Can you explain why passing a customer order with `const Order&` is both faster and safer than passing `Order`?'
  })
};

// Unit 1.1.3
PHASE1_REWRITE['LLDP1-U1.1.3'] = {
  taskName: 'Unit 1.1.3: When One Variable Can Represent Different Types',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'Suppose your store accepts Credit Card and UPI. Both can make a payment. How do you write your checkout code once so it works with any current or future payment method without checking "is this a card? is this UPI?" everywhere?',
    seeItWithASmallExample: `Both classes have a pay function:

class CreditCard { public: void pay(int amount) { /* charge card */ } };
class UPI        { public: void pay(int amount) { /* scan QR */ } };

If Checkout has to know about both, it needs if/else branches everywhere:
if (type == "CARD") card.pay(amount);
else if (type == "UPI") upi.pay(amount);`,
    whatIsGoingWrong: 'Every time your business adds a new payment method (like NetBanking or ApplePay), you have to open and edit existing checkout code, adding more if/else blocks and risking breaking what was already working.',
    theSimpleIdea: 'Create one common contract: "Anything that is a PaymentMethod must know how to `pay(amount)`". Then checkout only talks to the contract, and C++ automatically runs the right version of `pay` based on the real object behind it.',
    technicalWords: [
      { term: 'Polymorphism', explanation: 'The ability for different object types to respond to the same function call in their own specific way.' },
      { term: 'Virtual Function', explanation: 'A function in a base class that tells C++: "call the function belonging to the actual derived object at runtime".' },
      { term: 'Abstract Class', explanation: 'A class with at least one pure virtual function (`= 0`) that acts as a blueprint and cannot be instantiated on its own.' },
      { term: 'Virtual Destructor', explanation: 'A destructor marked `virtual` so that deleting an object through a base pointer cleanly deletes the entire child object.' }
    ],
    whyThisMattersInLLD: 'This is the heart of object-oriented design. It lets you add new features to a system by adding new classes, without rewriting or risking existing code.',
    tryIt: 'Create a base `PaymentMethod` with `virtual void pay(int amount) = 0`. Implement `CreditCard` and `UPI`. Store a pointer `PaymentMethod* p = new UPI()` and call `p->pay(100)`. Observe UPI’s pay run.',
    nowChangeTheRequirement: 'Remove the word `virtual` from the base class destructor `~PaymentMethod()`, then `delete p`.',
    whatDidTheChangeTeachUs: 'Without a virtual destructor, only the base class destructor runs; the child object is never cleaned up, causing memory leaks.',
    canYouExplainIt: 'Can you explain why C++ needs the word "virtual" to know which pay() function to call when using a PaymentMethod pointer?'
  })
};

// Unit 1.2.1
PHASE1_REWRITE['LLDP1-U1.2.1'] = {
  taskName: 'Unit 1.2.1: Why Making Variables Public Causes Hidden Bugs',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'If any piece of code in your program can directly reach in and change an object’s numbers (like setting a bank account balance to -$500 or adding a negative quantity to a cart), how can you keep your data safe and correct?',
    seeItWithASmallExample: `Consider a ShoppingCart where items are stored in a public list:

class ShoppingCart {
public:
    vector<Item> items; // Anyone can touch this!
};

// Any code can do this:
cart.items.clear(); // Empties cart without updating total price!
cart.items.push_back(Item("Book", -100)); // Negative price item sneaked in!`,
    whatIsGoingWrong: 'When internal variables are public or exposed through direct getters, any external developer or rogue function can corrupt the object’s rules without the object ever knowing.',
    theSimpleIdea: 'Make the variables `private`. Only allow changes through clear action methods (like `addItem` or `removeItem`) where the class itself inspects the change and rejects anything that breaks its rules.',
    technicalWords: [
      { term: 'Encapsulation', explanation: 'Hiding an object’s internal variables and only exposing controlled methods to interact with it.' },
      { term: 'Invariant', explanation: 'A business rule that must always remain true (for example: "cart quantity can never be zero or negative").' },
      { term: 'Setter / Getter', explanation: 'Functions that directly write or read a private variable.' },
      { term: 'Read-Only View', explanation: 'Returning a `const &` so outside code can view data without being able to modify it.' }
    ],
    whyThisMattersInLLD: 'An object should be completely responsible for maintaining its own valid state. You should never rely on outside code to remember your validation rules.',
    tryIt: 'Change `vector<Item> items` to `private`. Add a method `void addItem(Item item, int qty)`. If `qty <= 0`, throw an exception. Try adding an item with quantity -2 and watch your class defend itself.',
    nowChangeTheRequirement: 'Now provide a way for the UI to display the items without letting the UI add or delete items from the list.',
    whatDidTheChangeTeachUs: 'Returning `const vector<Item>&` allows callers to display items easily, while preventing them from modifying the cart behind your back.',
    canYouExplainIt: 'Can you explain why giving callers direct access to a list variable makes it impossible to guarantee the cart total is accurate?'
  })
};

// Unit 1.2.2
PHASE1_REWRITE['LLDP1-U1.2.2'] = {
  taskName: 'Unit 1.2.2: When Data Should Never Change Once Created',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'Why does using a simple `double price = 19.99` cause rounding errors in billing, and what happens when someone accidentally adds $10 USD to 10 Euros?',
    seeItWithASmallExample: `In normal programming:
double a = 0.1;
double b = 0.2;
cout << (a + b == 0.3); // Prints 0 (False!) because of floating point binary drift!

And with plain numbers:
int walletBalance = 500; // Is this dollars, cents, or rupees?
int orderTotal = 10;     // Adding them directly allows mixing currencies by mistake!`,
    whatIsGoingWrong: 'Primitive types like `double` or `int` do not know what currency they represent, cannot prevent invalid arithmetic across different currencies, and suffer from precision loss.',
    theSimpleIdea: 'Group the amount and currency into a single dedicated object (a Value Object) that cannot be altered after creation. If you add two amounts, return a brand new Money object.',
    technicalWords: [
      { term: 'Value Object', explanation: 'An object defined entirely by its values (like $5 USD) rather than by an ID.' },
      { term: 'Immutability', explanation: 'Once created, an object’s contents can never be changed.' },
      { term: 'Primitive Obsession', explanation: 'The bad habit of using basic types (like int, double, string) instead of small meaningful domain objects.' }
    ],
    whyThisMattersInLLD: 'Financial and critical domain values must be safe from silent corruption. If a Money object is immutable, you can pass it to 20 different services without worrying that any service will alter the customer’s price.',
    tryIt: 'Create a `Money` class with `int amountInCents` and `string currency`. Make both fields private and do not provide setters. Add an `add(Money other)` method that verifies both currencies match.',
    nowChangeTheRequirement: 'Try adding `Money(100, "USD")` to `Money(100, "EUR")`.',
    whatDidTheChangeTeachUs: 'Your Money class can immediately throw a `CurrencyMismatchException`, catching a catastrophic financial bug at the very line it happened.',
    canYouExplainIt: 'Can you explain why a five-dollar bill is defined by what it is worth (a value) rather than which exact piece of paper it is (an identity)?'
  })
};

// Unit 1.3.1
PHASE1_REWRITE['LLDP1-U1.3.1'] = {
  taskName: 'Unit 1.3.1: Who Owns This Object, and How Many Objects Can Exist?',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'If a University Department closes down, should its Professors lose their jobs or just leave the department? If a Car is crushed in a junkyard, does its Engine still exist?',
    seeItWithASmallExample: `Compare these two relationships:

Case 1: A Car and its Engine
If the Car is destroyed, the Engine that was built into it is also destroyed with the car.

Case 2: A Professor and a Department
If the Math Department is closed, the Professor still exists as a person and can teach elsewhere.`,
    whatIsGoingWrong: 'If your code deletes a parent object and accidentally deletes shared child objects that other parts of the system are still using, your system crashes with dangling pointer errors.',
    theSimpleIdea: 'Decide clearly whether the relationship is "exclusively owned" (if I die, you die) or "loosely associated" (we just know each other).',
    technicalWords: [
      { term: 'Composition', explanation: 'Strong ownership: the parent creates and exclusively owns the child. When the parent dies, the child dies.' },
      { term: 'Aggregation', explanation: 'Weak ownership: the parent holds a collection of items, but those items can exist independently if the parent is removed.' },
      { term: 'Association', explanation: 'Peer relationship: two objects know each other and interact, but neither owns the other.' },
      { term: 'Multiplicity', explanation: 'How many objects can be linked together (e.g. 1 Car has exactly 1 Engine; 1 Department has 1 to many Courses).' }
    ],
    whyThisMattersInLLD: 'Getting ownership right in code determines whether you hold member variables by value, by `unique_ptr`, or by non-owning pointers/references.',
    tryIt: 'Model a `House` and its `Room`s using Composition (store `vector<Room>` directly inside House). Destroy the house and verify that rooms are destroyed automatically.',
    nowChangeTheRequirement: 'Now model a `Library` and its `Member`s. Does destroying the Library delete the human Members?',
    whatDidTheChangeTeachUs: 'Members exist independently of any single library, meaning the library should hold references/pointers to members, not own their lifecycle.',
    canYouExplainIt: 'Can you explain the difference between a Car owning its Engine versus a Driver driving a Car?'
  })
};

// Unit 1.3.2
PHASE1_REWRITE['LLDP1-U1.3.2'] = {
  taskName: 'Unit 1.3.2: Why Combining Small Objects Is Better Than Long Inheritance Chains',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'What happens when you use inheritance to add features to a class, and suddenly you need every possible combination of features?',
    seeItWithASmallExample: `Suppose you have a Notification class:
- You inherit EmailNotification.
- Now you need encryption: EncryptedEmailNotification.
- Now you need retries: RetryingEncryptedEmailNotification.
- Now you need SMS: SMSNotification, EncryptedSMSNotification, RetryingEncryptedSMSNotification!`,
    whatIsGoingWrong: 'Every new feature you add doubles the number of classes you have to write and maintain. This is called "class explosion", and changing the base class risks breaking all 20 subclasses.',
    theSimpleIdea: 'Instead of saying "an EncryptedEmail is a special kind of Email", say "a Notification has a Sender and has an EncryptionPolicy". Assemble them like Lego blocks.',
    technicalWords: [
      { term: 'Composition Over Inheritance', explanation: 'Building complex functionality by combining simple objects rather than inheriting from base classes.' },
      { term: 'Class Explosion', explanation: 'When combining features through inheritance creates an unmanageable explosion of subclasses.' },
      { term: 'Fragile Base Class', explanation: 'When a seemingly harmless edit in a parent class unexpectedly breaks behavior in derived child classes.' }
    ],
    whyThisMattersInLLD: 'This is one of the most famous principles in software architecture. Systems built with composition are flexible, easily testable, and can change behaviors at runtime.',
    tryIt: 'Instead of creating `EncryptedEmailNotification`, create a `Notification` class that accepts an `EncryptionService` inside its constructor.',
    nowChangeTheRequirement: 'Add SMS notifications with and without encryption.',
    whatDidTheChangeTeachUs: 'You did not need to write a single new combination class! You just passed the existing encryption service into the SMS sender.',
    canYouExplainIt: 'Can you explain why having 3 small helper classes is easier to manage than having 12 subclasses in a giant inheritance tree?'
  })
};

// Unit 1.4.1
PHASE1_REWRITE['LLDP1-U1.4.1'] = {
  taskName: 'Unit 1.4.1: Turning a Real-World Story into Code',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'When an interviewer hands you a 3-paragraph story about a Digital Wallet or Parking Lot, how do you decide what classes to create and what methods belong in each class?',
    seeItWithASmallExample: `Read this sentence:
"A User transfers Money from their Wallet to a Friend’s Wallet, and the system records a Transaction."

Nouns (Things): User, Money, Wallet, Transaction -> These become your Classes.
Verbs (Actions): transfer, record -> These become your Methods.`,
    whatIsGoingWrong: 'Beginners often start coding right away and dump all the logic into one huge 500-line class where one function does database queries, balance updates, and notifications all together.',
    theSimpleIdea: 'Identify the nouns to find your classes. Identify the verbs to find their responsibilities. Make sure each class only does what belongs to its own data.',
    technicalWords: [
      { term: 'Noun-Verb Analysis', explanation: 'A technique of finding domain classes from nouns and operations from verbs in a specification.' },
      { term: 'CRC Cards', explanation: 'Class-Responsibility-Collaborator: a 3-part card recording what a class knows, what it does, and who it talks to.' },
      { term: 'Single Responsibility', explanation: 'A class should have one clear job and only one reason to change.' }
    ],
    whyThisMattersInLLD: 'In every LLD interview, the first 10 minutes are spent breaking down the prompt into clean entities. If your entity boundaries are clean, the rest of the interview is smooth.',
    tryIt: 'Take the sentence: "A customer scans an item, adds it to a cart, and pays with cash." List the candidate classes and methods.',
    nowChangeTheRequirement: 'What if cash payments require calculating change? Does `Item` calculate change? Does `Cart`? Or does a `CashRegister`?',
    whatDidTheChangeTeachUs: 'Thinking about responsibilities prevents dumping unrelated math into classes that should only hold item names and prices.',
    canYouExplainIt: 'Can you explain why a Wallet should check its own balance instead of having a User class reach in and change the wallet number?'
  })
};

// ============================================================================
// PRACTICAL DRILLS (9) — COMPLETE LEETCODE-STYLE LLD SPECIFICATIONS
// ======================================================// Drill 1.1.1
PHASE1_REWRITE['LLDP1-D1.1.1'] = {
  taskName: 'Stack vs Heap Lifetime Drill',
  oneLineSummary: 'See when a C++ object is created and destroyed when execution leaves its scope vs when allocated with new.',
  taskDescription: formatDrillDescription({
    title: 'Watching an Object Be Born and Destroyed (Stack vs Heap)',
    problemStatement: 'Create a small class named `TrackerBox` that prints a message when it is created and another message when it is destroyed. Place one `TrackerBox` inside a pair of curly braces `{ }` and create another `TrackerBox` using `new`. Observe when each box is destroyed.',
    contextScenario: 'Every program you write creates data in your computer’s memory. In C++, an object created inside a pair of curly braces `{ ... }` has automatic lifetime: it is destroyed deterministically when execution leaves its enclosing scope. In contrast, an object created with `new` on the heap remains allocated in memory until it is released with `delete`. In this drill, you will prove this behavior to yourself by watching an object log its creation and destruction directly to standard output.',
    startingPoint: `Start with a blank C++ file in your workspace:
\`\`\`cpp
#include <iostream>
#include <string>

// Your TrackerBox class will go here

int main() {
    // Your experiment code will go here
    return 0;
}
\`\`\``,
    yourTask: `1. Write a class named \`TrackerBox\`:
   - It holds one private \`std::string name\`.
   - Its constructor takes a name and prints: \`"[BORN] " + name\`.
   - Its destructor \`~TrackerBox()\` prints: \`"[DESTROYED] " + name\`.
2. Inside \`main()\`, create an inner block using curly braces:
   \`\`\`cpp
   std::cout << "--- Entering Block ---\\n";
   {
       TrackerBox a("StackBox");
   }
   std::cout << "--- Left Block ---\\n";
   \`\`\`
   Compile and run. Observe that \`[DESTROYED] StackBox\` prints before \`--- Left Block ---\`.
3. Next, create a box on the heap using \`new\`:
   \`\`\`cpp
   TrackerBox* b = new TrackerBox("HeapBox");
   std::cout << "Leaving block without delete...\\n";
   \`\`\`
   Run the program. Notice that \`[DESTROYED] HeapBox\` does not print because the object remains allocated.
4. Call \`delete b;\` and run once more to see \`[DESTROYED] HeapBox\` appear.`,
    apiInterface: `class TrackerBox {
private:
    std::string name;
public:
    TrackerBox(std::string boxName);
    ~TrackerBox();
};`,
    inputInteractionModel: 'Execute the test blocks sequentially and verify the printed lifecycle log order in the terminal.',
    expectedBehavior: 'StackBox must log creation followed immediately by destruction when execution leaves the inner block. HeapBox must log creation, survive beyond the block, and log destruction only when delete is called.',
    examples: `Expected Terminal Output:
--- Entering Block ---
[BORN] StackBox
[DESTROYED] StackBox
--- Left Block ---
[BORN] HeapBox
[DESTROYED] HeapBox`,
    constraintsAssumptions: 'Use standard C++ with <iostream> and <string>. Do not use external libraries or smart pointers.',
    edgeCases: 'Exiting a block via an early return statement still guarantees that the stack object destructor executes deterministically.',
    acceptanceCriteria: [
      'TrackerBox("StackBox") destructor executes automatically when execution leaves its block scope without any delete call.',
      'TrackerBox("HeapBox") destructor does NOT execute when leaving block scope until delete is called.',
      'Output strings match the exact required prefix: [BORN] and [DESTROYED].'
    ],
    whatToObserve: 'Notice how the stack box cleaned itself up the moment execution stepped outside the curly braces. You never had to write manual cleanup code—the scope guaranteed safety.',
    thinkAbout: 'What would happen if an object that opens a file or connects to a database was created inside curly braces? Would it automatically close the file when the function exits?'
  })
};

// Drill 1.1.2
PHASE1_REWRITE['LLDP1-D1.1.2'] = {
  taskName: 'Object Ownership & Safe Borrowing Refactor',
  oneLineSummary: 'Fix a dangling pointer bug by making Car own its Engine by value, and safely borrow references with const &.',
  taskDescription: formatDrillDescription({
    title: 'Object Ownership & Safe Reference Borrowing Refactor',
    problemStatement: 'Refactor broken code where a `Car` holds a raw pointer to a temporary `Engine` that gets destroyed on function return. Store `Engine` as a direct member variable inside `Car`, and implement read-only inspection using `const Engine&`.',
    contextScenario: 'A junior engineer wrote a helper function `createCar()` that declared an `Engine` on the local stack and passed its memory address to a `Car`. When `createCar()` returns, that local stack frame is discarded and the engine is destroyed, leaving the car pointing to invalid memory. You must fix this using direct member-by-value ownership.',
    startingPoint: `Problematic Starting Code:
\`\`\`cpp
struct Engine { int horsepower = 200; };
class Car {
public:
    Engine* engine;
    Car(Engine* e) : engine(e) {}
    int getPower() const { return engine->horsepower; } // Undefined behavior!
};
Car setupCar() {
    Engine tempEngine{300};
    return Car(&tempEngine); // Bug: tempEngine is destroyed when function returns!
}
\`\`\``,
    yourTask: `1. Identify why \`setupCar()\` produces undefined behavior when accessing the returned car’s engine.
2. Refactor \`Car\` to use direct member-by-value ownership:
   - Declare \`Engine engine;\` as a direct private member of \`Car\`.
   - Update the constructor to initialize this member: \`Car(int horsepower) : engine(horsepower) {}\`.
3. Implement an external inspection function \`void inspectEngine(const Engine& engine)\` that demonstrates safe read-only borrowing without taking ownership or making unnecessary copies.`,
    apiInterface: `class Engine {
private:
    int horsepower;
public:
    explicit Engine(int hp);
    int getHorsepower() const;
};

class Car {
private:
    Engine engine; // Direct member-by-value ownership
public:
    explicit Car(int engineHp);
    int getPower() const;
    const Engine& getEngine() const;
};

void inspectEngine(const Engine& engine);`,
    inputInteractionModel: 'Instantiate Car through setupCar(), return it to main, query its power, and pass its engine to inspectEngine.',
    expectedBehavior: 'Car owns its Engine for the entirety of Car’s lifetime. Inspecting the engine reads valid horsepower without crashes or undefined memory access.',
    examples: `Car myCar = Car(250);
inspectEngine(myCar.getEngine()); // Prints: Engine Horsepower: 250
assert(myCar.getPower() == 250);`,
    constraintsAssumptions: 'The Engine lifecycle is tied directly to the Car in this domain. Passing by reference must avoid copying.',
    edgeCases: 'Attempting to modify the engine inside inspectEngine must be rejected by the compiler due to const-correctness.',
    acceptanceCriteria: [
      'No pointers to out-of-scope temporary stack variables exist.',
      'Car owns the Engine lifecycle completely as a direct member variable.',
      'inspectEngine borrows via const Engine& with zero copying.'
    ],
    whatToObserve: 'Notice how holding member data by value completely eliminates the risk of dangling pointers. When the Car is destroyed, its Engine is destroyed with it.',
    thinkAbout: 'If your requirement changed so that one high-performance Engine could be swapped between three race cars, would member-by-value Composition still be the right choice?'
  })
};

// Drill 1.1.3
PHASE1_REWRITE['LLDP1-D1.1.3'] = {
  taskName: 'When One Pointer Can Represent Different Types Drill',
  oneLineSummary: 'Process payments through a common base pointer using virtual dynamic dispatch, and prevent memory leaks with a virtual destructor.',
  taskDescription: formatDrillDescription({
    title: 'When One Pointer Can Represent Different Types Drill',
    problemStatement: 'Implement a payment processing contract `PaymentMethod` with concrete classes `CreditCardPayment` and `UpiPayment`. Phase your implementation: first achieve runtime dynamic method selection using `virtual`, then fix incomplete cleanup using a `virtual` destructor.',
    contextScenario: 'An e-commerce checkout service needs to accept different payment methods through a single common contract pointer. Furthermore, concrete payment types allocate internal transaction logs that must be safely freed when deleting via the base pointer.',
    startingPoint: `Start with a blank C++ file. You will define the abstract contract and concrete classes:
\`\`\`cpp
#include <iostream>
#include <string>

// Step 1: Define PaymentMethod contract
\`\`\``,
    yourTask: `### Step 1: Dynamic Dispatch with virtual
1. Define abstract base class \`PaymentMethod\` with pure virtual method:
   \`virtual void pay(int amountCents) = 0;\`.
2. Implement \`CreditCardPayment(std::string cardNumber)\` and \`UpiPayment(std::string upiId)\` implementing \`pay()\`.
3. In \`main()\`, pass different pointers to a common function \`void processCheckout(PaymentMethod* method, int amount)\`.
   Observe that C++ calls the derived child method at runtime.

### Step 2: Virtual Destructor and Safe Destruction
4. In both concrete classes, have their destructors log their cleanup:
   \`~CreditCardPayment() { std::cout << "[DESTROYED] CreditCard\\n"; }\`
   \`~UpiPayment() { std::cout << "[DESTROYED] UPI\\n"; }\`
5. Create an instance with \`PaymentMethod* p = new UpiPayment("alice@upi");\` and call \`delete p;\`.
6. Observe that without a virtual destructor in the base class, the child destructor is skipped!
7. Declare \`virtual ~PaymentMethod() = default;\` in the base class and verify that the derived destructor now runs cleanly.`,
    apiInterface: `class PaymentMethod {
public:
    virtual ~PaymentMethod() = default; // Step 2: Virtual destructor
    virtual void pay(int amountCents) = 0; // Step 1: Pure virtual contract
};

class CreditCardPayment : public PaymentMethod {
private:
    std::string cardNumber;
public:
    explicit CreditCardPayment(std::string card);
    ~CreditCardPayment() override;
    void pay(int amountCents) override;
};

class UpiPayment : public PaymentMethod {
private:
    std::string upiId;
public:
    explicit UpiPayment(std::string vpa);
    ~UpiPayment() override;
    void pay(int amountCents) override;
};

void processCheckout(PaymentMethod* method, int amountCents);`,
    inputInteractionModel: 'Pass different PaymentMethod pointers to processCheckout and delete through the base pointer.',
    expectedBehavior: 'Calling pay(1500) on PaymentMethod* executes UPI or Card logic dynamically. Deleting through PaymentMethod* cleanly triggers both derived and base destructors.',
    examples: `PaymentMethod* payment = new UpiPayment("alice@okaxis");
processCheckout(payment, 1500); // Outputs: "[PAID] 1500 cents using UPI alice@okaxis"
delete payment;                 // Outputs: "[DESTROYED] UPI"`,
    constraintsAssumptions: 'Amount is represented in integer cents. Base class cannot be instantiated directly.',
    edgeCases: 'Negative or zero payment amounts must throw std::invalid_argument.',
    acceptanceCriteria: [
      'Step 1: Calling pay() through PaymentMethod* invokes the actual derived object implementation at runtime.',
      'Step 2: Deleting through PaymentMethod* safely executes the derived class destructor.',
      'Zero compiler warnings with -Wall -Wextra.'
    ],
    whatToObserve: 'Notice how processCheckout only knows about PaymentMethod, yet the exact right pay() code runs. Adding a new payment type requires zero changes to processCheckout.',
    thinkAbout: 'Why does C++ require us to explicitly write the word virtual on destructors, instead of making all destructors virtual by default?'
  })
};

// Drill 1.2.1
PHASE1_REWRITE['LLDP1-D1.2.1'] = {
  taskName: 'Defending Shopping Cart Invariants Drill',
  taskDescription: formatDrillDescription({
    title: 'Defending State Invariants in Shopping Cart Refactor',
    problemStatement: 'Refactor a `ShoppingCart` class that exposes its internal item list to the public, allowing outside code to corrupt prices, bypass stock rules, and insert negative quantities.',
    contextScenario: 'An online grocery store found discrepancies where customers checked out with negative totals or empty orders. An investigation revealed third-party checkout plugins were modifying `cart.items` directly instead of going through the cart validation logic.',
    startingPoint: `Buggy Starting Implementation:
\`\`\`cpp
struct CartItem { std::string name; int priceCents; int quantity; };
class ShoppingCart {
public:
    std::vector<CartItem> items; // Vulnerable public field!
    int calculateTotal() const {
        int total = 0;
        for (const auto& item : items) total += item.priceCents * item.quantity;
        return total;
    }
};
\`\`\``,
    yourTask: `1. Make \`items\` private inside \`ShoppingCart\`.
2. Implement business operations:
   - \`void addItem(const std::string& name, int priceCents, int quantity)\`
   - \`void removeItem(const std::string& name)\`
   - \`void updateQuantity(const std::string& name, int newQuantity)\`
3. Enforce invariants:
   - Reject items with price <= 0.
   - Reject quantities <= 0.
   - If an item already exists in the cart, adding it again increments the existing quantity.
4. Expose a read-only projection: \`const std::vector<CartItem>& getItems() const;\`.`,
    apiInterface: `class ShoppingCart {
private:
    std::vector<CartItem> items;
public:
    void addItem(const std::string& name, int priceCents, int quantity);
    void removeItem(const std::string& name);
    void updateQuantity(const std::string& name, int newQuantity);
    int calculateTotal() const;
    const std::vector<CartItem>& getItems() const;
};`,
    inputInteractionModel: 'Interact with the cart through business methods and query total and read-only item list.',
    expectedBehavior: 'All invalid inputs throw std::invalid_argument. Total is always consistent with valid items.',
    examples: `cart.addItem("Apple", 100, 2);
cart.addItem("Apple", 100, 3); // Quantity becomes 5
assert(cart.calculateTotal() == 500);
cart.addItem("BadItem", -50, 1); // Throws std::invalid_argument!`,
    constraintsAssumptions: 'Currency is in integer cents. In-memory execution.',
    edgeCases: 'Updating quantity of a non-existent item throws an exception. Setting quantity to 0 removes the item or throws an error based on domain rule.',
    acceptanceCriteria: [
      'Direct mutation of items from outside the class is impossible.',
      'Negative prices and non-positive quantities are strictly rejected.',
      'getItems() returns an immutable view.'
    ],
    whatToObserve: 'Notice how callers can no longer corrupt the cart total because every modification is validated at the gate.',
    thinkAbout: 'Why is returning `const std::vector<CartItem>&` safer and more efficient than returning `std::vector<CartItem>`?'
  })
};

// Drill 1.2.2
PHASE1_REWRITE['LLDP1-D1.2.2'] = {
  taskName: 'Building an Immutable Money Value Object Drill',
  taskDescription: formatDrillDescription({
    title: 'Building an Immutable Money Value Object',
    problemStatement: 'Build an immutable `Money` Value Object that prevents floating-point rounding errors and protects against illegal arithmetic operations between different currencies.',
    contextScenario: 'An international payments gateway suffered accounting drift due to using `double` for currency amounts, and accidentally permitted adding $50 USD to 50 Japanese Yen directly. You must build a rock-solid Money object.',
    startingPoint: 'Start from scratch. Implement the Money class with strict immutability.',
    yourTask: `1. Create class \`Money\` with private fields: \`int64_t amountInCents\` and \`std::string currency\`.
2. Make fields \`const\` or provide no mutating methods (setters).
3. In constructor, reject empty currency strings and enforce valid representation.
4. Implement arithmetic:
   - \`Money add(const Money& other) const\`
   - \`Money subtract(const Money& other) const\`
5. If currencies do not match, throw a custom \`CurrencyMismatchException\`.
6. Implement structural equality: two Money objects are equal if both amount and currency match.`,
    apiInterface: `class CurrencyMismatchException : public std::runtime_error {
    using std::runtime_error::runtime_error;
};

class Money {
private:
    int64_t amountInCents;
    std::string currency;
public:
    Money(int64_t cents, std::string currencyCode);
    int64_t getAmountInCents() const;
    std::string getCurrency() const;
    Money add(const Money& other) const;
    Money subtract(const Money& other) const;
    bool equals(const Money& other) const;
};`,
    inputInteractionModel: 'Perform financial calculations by chaining operations that return new Money instances.',
    expectedBehavior: 'Existing Money instances never change their values. Adding different currencies throws an exception immediately.',
    examples: `Money m1(1000, "USD"); // $10.00
Money m2(550, "USD");  // $5.50
Money total = m1.add(m2);
assert(total.getAmountInCents() == 1550);
assert(m1.getAmountInCents() == 1000); // m1 was not modified!

Money m3(100, "EUR");
m1.add(m3); // Throws CurrencyMismatchException!`,
    constraintsAssumptions: 'Integer cents representation. ISO 3-letter currency codes (e.g. USD, EUR, INR).',
    edgeCases: 'Subtracting a larger amount from a smaller amount can produce negative money if overdrafts are allowed, or throw an exception if negative money is an illegal domain invariant.',
    acceptanceCriteria: [
      'Money instance state cannot be modified after construction.',
      'Operations return a new Money instance.',
      'Currency mismatch is caught and throws an explicit exception.'
    ],
    whatToObserve: 'Notice how immutability makes code completely thread-safe and immune to unexpected side-effects.',
    thinkAbout: 'Why do Value Objects have no database ID or unique serial number, while Entities (like User or Account) must have one?'
  })
};

// Drill 1.3.1
PHASE1_REWRITE['LLDP1-D1.3.1'] = {
  taskName: 'University Course Enrollment Ownership Model',
  taskDescription: formatDrillDescription({
    title: 'University Course Enrollment Object Relationships',
    problemStatement: 'Model the relationships in a University Course Registration system, clearly implementing Association, Aggregation, and Composition in C++ code.',
    contextScenario: 'You are designing the domain model for university academics. A Course has a Syllabus (Composition). A Department offers multiple Courses (Aggregation). A Student enrolls in Courses (Association). Destruction rules must match reality.',
    startingPoint: 'Start from scratch. Create classes `Syllabus`, `Course`, `Department`, and `Student`.',
    yourTask: `1. Implement Composition: \`Course\` owns its \`Syllabus\`. When a Course is destroyed, its Syllabus must be automatically destroyed.
2. Implement Aggregation: \`Department\` maintains a list of \`Course*\` pointers. If a Department is dissolved, the Courses still exist in the university catalog.
3. Implement Association: \`Student\` enrolls in a \`Course\`. Both can exist independently; neither owns the lifecycle of the other.
4. Write test scenarios demonstrating that dissolving a Department leaves Courses intact, while deleting a Course destroys its Syllabus.`,
    apiInterface: `class Syllabus {
public:
    explicit Syllabus(std::string content);
    std::string getContent() const;
};

class Course {
private:
    std::string courseCode;
    Syllabus syllabus; // Composition (owned by value)
public:
    Course(std::string code, std::string syllabusContent);
    std::string getCode() const;
};

class Department {
private:
    std::string name;
    std::vector<Course*> courses; // Aggregation (borrowed pointers)
public:
    explicit Department(std::string name);
    void addCourse(Course* course);
};

class Student {
private:
    std::string studentId;
    std::vector<Course*> enrolledCourses; // Association
public:
    explicit Student(std::string id);
    void enroll(Course* course);
};`,
    inputInteractionModel: 'Create courses, associate with students, aggregate in departments, and verify lifecycle integrity.',
    expectedBehavior: 'Destroying Department does not delete Course objects. Destroying Course automatically frees its Syllabus. Student holds references to courses without ownership.',
    examples: `Course* cs101 = new Course("CS101", "Intro to Programming");
{
    Department csDept("Computer Science");
    csDept.addCourse(cs101);
} // csDept destroyed here
assert(cs101->getCode() == "CS101"); // Course is still alive!
delete cs101; // cs101 and its internal Syllabus destroyed here`,
    constraintsAssumptions: 'In-memory execution. Clear lifecycle boundaries.',
    edgeCases: 'A student cannot enroll in the same course twice. Enrolling in a null course pointer must be rejected.',
    acceptanceCriteria: [
      'Course exclusively owns Syllabus via Composition.',
      'Department aggregates Courses without deleting them on department destruction.',
      'Student associates with Courses safely.'
    ],
    whatToObserve: 'Notice how member variable types (value vs pointer) dictate the lifecycle relationship between objects.',
    thinkAbout: 'When drawing a UML diagram on a whiteboard in an interview, what visual diamond indicates Composition vs Aggregation?'
  })
};

// Drill 1.3.2
PHASE1_REWRITE['LLDP1-D1.3.2'] = {
  taskName: 'Dismantling Inheritance Class Explosion Drill',
  taskDescription: formatDrillDescription({
    title: 'Replacing Inheritance with Pluggable Behaviors',
    problemStatement: 'Refactor a notification system suffering from class explosion where subclasses were created for every combination of channel, encryption, and retry logic.',
    contextScenario: 'A codebase contains `EmailNotification`, `EncryptedEmailNotification`, `RetryingEmailNotification`, `EncryptedRetryingEmailNotification`, `SMSNotification`, `EncryptedSMSNotification`, and so on. Adding a Slack channel requires 4 new subclasses!',
    startingPoint: `Problematic Inheritance Tree:
\`\`\`cpp
class Notification { public: virtual void send(string msg) = 0; };
class EmailNotification : public Notification { ... };
class EncryptedEmailNotification : public EmailNotification { ... };
class RetryingEncryptedEmailNotification : public EncryptedEmailNotification { ... };
// Subclass explosion!
\`\`\``,
    yourTask: `1. Stop subclassing for behavior combinations.
2. Separate the channel from its formatting and delivery policies:
   - Create a clean \`MessageSender\` contract with \`EmailSender\` and \`SmsSender\`.
   - Create a \`MessageFormatter\` contract (e.g. \`PlainTextFormatter\`, \`EncryptedFormatter\`).
3. Build a cohesive \`NotificationService\` that composes a sender and a formatter.
4. Demonstrate sending plain email, encrypted email, and encrypted SMS by simply plugging together components without any subclassing.`,
    apiInterface: `class MessageSender {
public:
    virtual ~MessageSender() = default;
    virtual void deliver(const std::string& recipient, const std::string& text) = 0;
};

class MessageFormatter {
public:
    virtual ~MessageFormatter() = default;
    virtual std::string format(const std::string& rawText) = 0;
};

class NotificationService {
private:
    std::shared_ptr<MessageSender> sender;
    std::shared_ptr<MessageFormatter> formatter;
public:
    NotificationService(std::shared_ptr<MessageSender> s, std::shared_ptr<MessageFormatter> f);
    void notify(const std::string& recipient, const std::string& message);
};`,
    inputInteractionModel: 'Assemble a NotificationService by passing different sender and formatter implementations into its constructor.',
    expectedBehavior: 'Delivers properly formatted (e.g. encrypted) text to the specified channel without needing specialized composite subclasses.',
    examples: `auto emailSender = std::make_shared<EmailSender>();
auto encryptor = std::make_shared<EncryptedFormatter>();
NotificationService service(emailSender, encryptor);
service.notify("bob@example.com", "Secret Message");
// Delivers encrypted text to Email channel!`,
    constraintsAssumptions: 'Modern C++ with shared_ptr or unique_ptr.',
    edgeCases: 'Null sender or formatter pointers passed to the service constructor must throw std::invalid_argument.',
    acceptanceCriteria: [
      'Subclass tree is replaced with 2 focused collaborator contracts.',
      'Adding a new channel (Slack) requires writing only 1 new class, not 4.',
      'Behaviors can be combined dynamically at runtime.'
    ],
    whatToObserve: 'Notice how favoring composition over inheritance turns an exponential class hierarchy into a simple set of Lego blocks.',
    thinkAbout: 'Can you think of a scenario where inheritance IS genuinely better than composition?'
  })
};

// Drill 1.3.3
PHASE1_REWRITE['LLDP1-D1.3.3'] = {
  taskName: 'Fixing Broken Subclass Assumptions Drill',
  taskDescription: formatDrillDescription({
    title: 'Fixing Subclass Contract Violations (LSP Violation Refactor)',
    problemStatement: 'Refactor a banking account hierarchy where a `FixedDepositAccount` subclass inherits from `BankAccount` but throws `UnsupportedOperationException` on `withdraw()`, breaking calling code.',
    contextScenario: 'An automated batch payroll and bill-pay service iterates over a list of `BankAccount*` calling `account->withdraw(billAmount)`. When it encounters a `FixedDepositAccount`, the system crashes because funds are locked by law.',
    startingPoint: `Flawed Subclass Code:
\`\`\`cpp
class BankAccount {
public:
    virtual void deposit(int amount) = 0;
    virtual void withdraw(int amount) = 0; // FixedDeposit cannot do this!
};
class CheckingAccount : public BankAccount { ... };
class FixedDepositAccount : public BankAccount {
public:
    void withdraw(int amount) override {
        throw std::runtime_error("Withdrawal not allowed on Fixed Deposit!");
    }
};
\`\`\``,
    yourTask: `1. Identify why forcing \`FixedDepositAccount\` to inherit \`withdraw()\` breaks the promise of the base class.
2. Split the abstractions so callers never call an operation that the object cannot perform:
   - Base contract \`Account\` with \`deposit()\` and \`getBalance()\`.
   - Specific contract \`WithdrawableAccount\` with \`withdraw()\`.
3. Refactor \`CheckingAccount\` to implement \`WithdrawableAccount\`.
4. Refactor \`FixedDepositAccount\` to implement only \`Account\`.
5. Update client code so only \`WithdrawableAccount\` instances can be passed to payment functions.`,
    apiInterface: `class Account {
public:
    virtual ~Account() = default;
    virtual void deposit(int amountCents) = 0;
    virtual int getBalance() const = 0;
};

class WithdrawableAccount : public Account {
public:
    virtual void withdraw(int amountCents) = 0;
};`,
    inputInteractionModel: 'Pass withdrawable accounts to withdrawal processors. The compiler must prevent passing a FixedDepositAccount.',
    expectedBehavior: 'Calling code never encounters runtime exceptions caused by unsupported operations.',
    examples: `CheckingAccount checking(5000);
FixedDepositAccount fixedDep(10000);

void processBill(WithdrawableAccount& acc, int amount) { acc.withdraw(amount); }

processBill(checking, 1000); // Compiles and succeeds!
// processBill(fixedDep, 1000); // COMPILE ERROR! Safe design prevents runtime crash.`,
    constraintsAssumptions: 'C++ compile-time type safety. Amounts in integer cents.',
    edgeCases: 'Withdrawing more than balance on CheckingAccount throws InsufficientFundsException (a normal business rule, not an unsupported operation error).',
    acceptanceCriteria: [
      'No subclass throws UnsupportedOperationException for base methods.',
      'Contract splitting prevents invalid operations at compile time.',
      'All derived types honor their interface contract completely.'
    ],
    whatToObserve: 'Notice how moving the distinction to the interface level caught the bug at compile time instead of 3 AM in production.',
    thinkAbout: 'Why is a Square mathematically a Rectangle, but in object-oriented programming making Square inherit from Rectangle often causes bugs?'
  })
};

// Drill 1.4.1
PHASE1_REWRITE['LLDP1-D1.4.1'] = {
  taskName: 'Digital Wallet Domain Model & Responsibility Breakdown',
  taskDescription: formatDrillDescription({
    title: 'Digital Wallet Domain Model & Entity Extraction',
    problemStatement: 'Design and implement the core domain model for a Digital Wallet system supporting user accounts, wallets, atomic fund transfers, and transaction history.',
    contextScenario: 'A fintech startup needs an in-memory digital wallet backend. Users can deposit funds, check balances, transfer funds to another user’s wallet, and review past transactions.',
    startingPoint: 'Start from scratch. Extract entities: `User`, `Wallet`, `Transaction`, and `WalletService`.',
    yourTask: `1. Model \`Wallet\` with private balance in integer cents. It must enforce that balance never drops below zero.
2. Model immutable \`Transaction\` recording timestamp, senderId, receiverId, amount, and status (SUCCESS / FAILED).
3. Implement \`WalletService\` coordinating transfers between two wallets:
   - Verify sender has sufficient funds.
   - Atomically debit sender and credit receiver.
   - Record transaction in history.
4. Write comprehensive unit tests verifying successful transfers and failed transfers when balance is insufficient.`,
    apiInterface: `enum class TransactionStatus { SUCCESS, FAILED };

class Transaction {
public:
    std::string transactionId;
    std::string sourceWalletId;
    std::string targetWalletId;
    int64_t amountCents;
    TransactionStatus status;
};

class Wallet {
public:
    explicit Wallet(std::string id);
    std::string getId() const;
    int64_t getBalance() const;
    void credit(int64_t cents);
    bool debit(int64_t cents); // Returns false if insufficient balance
};

class WalletService {
public:
    Transaction transfer(Wallet& sender, Wallet& receiver, int64_t amountCents);
};`,
    inputInteractionModel: 'Execute wallet transfers through WalletService and query wallet balances and transaction records.',
    expectedBehavior: 'Successful transfer decrements sender and increments receiver by exact amount. Failed transfer leaves both balances unchanged.',
    examples: `Wallet w1("W1"); w1.credit(1000);
Wallet w2("W2"); w2.credit(200);

WalletService service;
Transaction t = service.transfer(w1, w2, 400);

assert(t.status == TransactionStatus::SUCCESS);
assert(w1.getBalance() == 600);
assert(w2.getBalance() == 600);`,
    constraintsAssumptions: 'Currency in integer cents. Single-threaded in-memory simulation.',
    edgeCases: 'Self-transfer (transferring to same wallet) must be rejected. Zero or negative transfer amounts must throw std::invalid_argument.',
    acceptanceCriteria: [
      'Wallet balance invariant (balance >= 0) is defended internally.',
      'Failed transfer rolls back completely with zero balance leakage.',
      'Responsibilities are cleanly separated between Wallet (state) and WalletService (workflow).'
    ],
    whatToObserve: 'Notice how Wallet does not know about other wallets or transfer orchestration—it only protects its own balance.',
    thinkAbout: 'Should the transfer method live on Wallet (`walletA.transferTo(walletB)`) or on a separate service? Why?'
  })
};

// ============================================================================
// MAJOR PROBLEMS (4) & PROBLEM VERSIONS (17)
// ============================================================================

// Problem 1: Vending Machine
PHASE1_REWRITE['LLDP1-P1'] = {
  taskName: 'Problem 1 — Design a Vending Machine',
  taskDescription: formatMajorProblemDescription({
    contextScenario: 'Design the control software for an automated commercial vending machine installed in subway stations. The machine must manage product slots, accept currency, dispense snacks, return exact change, and handle cancellations gracefully without physical attendant assistance.',
    functionalRequirements: [
      'Inventory Tracking: Maintain items across distinct shelf slot codes (e.g. "A1", "B2") with unit prices and stock counts.',
      'Payment Handling: Accept coins (1¢, 5¢, 10¢, 25¢) and bills ($1, $5). Maintain an active user balance.',
      'Dispense & Change: Verify product availability and sufficient inserted balance, dispense product, deduct inventory, and return exact change from an internal cash float.',
      'Cancellation: Allow the user to cancel before dispensing, refunding the full inserted balance.',
      'Maintenance: Allow authorized staff to restock items and replenish the cash float.'
    ],
    operationsApi: [
      'void insertCoin(Coin coin);',
      'void insertNote(Note note);',
      'void selectSlot(const std::string& slotCode);',
      'DispenseResult dispense();',
      'std::vector<Currency> cancelTransaction();',
      'void restockItem(const std::string& slotCode, const Item& item, int quantity);',
      'void loadCashFloat(const std::map<Currency, int>& cash);'
    ],
    expectedBehavior: 'All state transitions must be deterministic. If a snack costs $1.50 and the user inserts $2.00, selecting the slot and dispensing must deliver the snack, deduct stock by 1, and return $0.50 in change.',
    examplesScenarios: `Scenario 1: Happy Path
1. User inserts $1 bill and two 25¢ coins (Balance: $1.50).
2. User selects "A1" (Chips, Price: $1.50, Stock: 3).
3. System dispenses Chips. Remaining balance: $0.00. Stock becomes 2.

Scenario 2: Cancellation
1. User inserts $1 bill.
2. User presses Cancel.
3. System returns $1 bill and resets balance to $0.00.`,
    constraintsAssumptions: [
      'Financial values must be represented in integer cents ($1.50 = 150 cents) to prevent rounding bugs.',
      'Single-threaded in-memory execution.',
      'Physical dispenser failure simulated via status enum.'
    ],
    edgeCasesErrorHandling: [
      'Selecting an empty slot throws OutOfStockException.',
      'Selecting an invalid slot code throws InvalidSlotException.',
      'Calling dispense before inserting enough money throws InsufficientBalanceException.',
      'Cash float unable to form exact change aborts transaction and refunds money.'
    ],
    stateLifecycleRules: 'Machine states: IDLE -> ACCEPTING_CURRENCY -> ITEM_SELECTED -> DISPENSING -> REFUNDING. External mutation of state is prohibited; states evolve only via domain actions.',
    acceptanceCriteria: [
      'Inventory counts can never drop below zero.',
      'Inserted money invariant: insertedAmount == itemPrice + returnedChange.',
      'Cash float accurately updates upon every transaction.'
    ],
    whatYouNeedToImplement: 'Implement the vending machine system in modern C++ with clean entity separation and automated unit tests verifying the 5 core scenarios.'
  })
};

PHASE1_REWRITE['LLDP1-P1-V1'] = {
  taskName: 'Version 1: Baseline In-Memory Dispense',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'This is the initial baseline version of the Vending Machine.',
    whyOldDesignStruggles: 'N/A — initial design.',
    newRequirements: [
      'Maintain an in-memory catalog of 3 items with fixed prices and initial quantities.',
      'Allow users to insert cash and select an item.',
      'If balance is sufficient and item in stock, dispense item and return remaining balance.'
    ],
    observableBehavior: 'Calling insertCoin, selectSlot, and dispense results in inventory decrement and change return.',
    examples: 'Insert $2.00, select $1.25 soda -> Dispenses soda, returns 75 cents change.',
    acceptanceCriteria: [
      'Dispenses item when funds are sufficient.',
      'Rejects dispense when funds are insufficient.',
      'Reduces item quantity by 1.'
    ]
  })
};

PHASE1_REWRITE['LLDP1-P1-V2'] = {
  taskName: 'Version 2: Multi-Item Catalog & State Management',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'The machine now has multiple shelves (A1 to C5) and must strictly prevent illegal actions (like pressing dispense when no item is selected, or inserting money while dispensing).',
    whyOldDesignStruggles: 'A single monolithic class with lots of boolean flags (`bool isDispensing`, `bool hasSelected`) becomes buggy and allows illegal actions when flags are forgotten.',
    newRequirements: [
      'Support multi-shelf catalog grid (A1-D10).',
      'Enforce explicit machine lifecycle: only allow inserting money in Idle or Ready states, only allow dispensing after selection.'
    ],
    observableBehavior: 'Calling dispense before item selection throws an explicit state exception.',
    examples: 'Calling dispense() in IDLE state throws InvalidStateOperationException.',
    acceptanceCriteria: [
      'All shelf slots are addressable.',
      'Illegal actions for current machine state throw domain exceptions.'
    ]
  })
};

PHASE1_REWRITE['LLDP1-P1-V3'] = {
  taskName: 'Version 3: Cash Float & Exact Change Algorithm',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'The machine no longer has infinite change. It has a real cash box with a limited count of nickels, dimes, quarters, and dollar bills.',
    whyOldDesignStruggles: 'Previously we simply subtracted `balance - price` as an abstract number. Now we must provide physical coins from our drawer.',
    newRequirements: [
      'Track quantity of each coin denomination inside the machine.',
      'When dispensing change, calculate exact coin combination using greedy or dynamic change algorithm.',
      'If exact change cannot be formed, transaction must be cancelled and user refunded.'
    ],
    observableBehavior: 'If change is 30 cents but machine only has quarters, transaction aborts with InsufficientChangeException.',
    examples: 'Balance 200 cents, Price 150 cents. Machine has two 25¢ coins -> Dispenses product + two quarters.',
    acceptanceCriteria: [
      'Cash float decrements by coins dispensed.',
      'Aborts gracefully if change cannot be made.'
    ]
  })
};

PHASE1_REWRITE['LLDP1-P1-V4'] = {
  taskName: 'Version 4: Requirement Change — Card Payments & Discounts',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'The city installed card swipe terminals on the vending machine and requested dynamic promotional discount codes (e.g. 10% off student hours).',
    whyOldDesignStruggles: 'If payment was hardcoded to physical coins, adding credit cards and discounts forces editing existing cash-dispense logic.',
    newRequirements: [
      'Support both Cash and Card payment types.',
      'Card payments do not dispense physical change.',
      'Support optional discount codes that reduce final item price before payment.'
    ],
    observableBehavior: 'Applying coupon "SAVE10" to $2.00 item reduces required payment to $1.80.',
    examples: 'Select $2.00 item -> Apply "SAVE10" -> Swipe Card -> Dispense item, zero change needed.',
    acceptanceCriteria: [
      'Cash and Card workflows both work seamlessly.',
      'Discounts correctly apply to item cost.'
    ]
  })
};

PHASE1_REWRITE['LLDP1-P1-V5'] = {
  taskName: 'Version 5: Architectural Review & Invariant Audit',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Comprehensive system review and testing of the complete Vending Machine.',
    whyOldDesignStruggles: 'Validates that the final codebase handles edge cases, concurrent state checks, and adheres to clean object-oriented design.',
    newRequirements: [
      'Audit all system invariants across all payment types and catalog states.',
      'Write end-to-end integration tests covering stock depletion, cancellation, and refund.'
    ],
    observableBehavior: 'All test suites pass with 100% deterministic results.',
    examples: 'Full regression run passes cleanly.',
    acceptanceCriteria: [
      'Clean separation between machine controller, cash float, and catalog.',
      'Zero resource or cash leaks.'
    ],
    designReviewNote: 'In post-attempt review: evaluate how state transitions were handled. If you used state machines or modular handlers, observe how easy it was to prevent illegal operations compared to giant nested if/else statements.'
  })
};

// Problem 2: Tic Tac Toe
PHASE1_REWRITE['LLDP1-P2'] = {
  taskName: 'Problem 2 — Design Tic Tac Toe',
  taskDescription: formatMajorProblemDescription({
    contextScenario: 'Design an interactive game engine for Tic Tac Toe that generalizes beyond the traditional 3x3 grid to support an N x N board with M players taking sequential turns.',
    functionalRequirements: [
      'Dynamic Grid: Support arbitrary board size N x N (default 3x3, scalable to 100x100).',
      'Multi-Player: Support 2 or more players taking turns in round-robin sequence with unique piece symbols (X, O, etc.).',
      'Move Validation: Validate coordinates are within [0, N-1] and targeted cell is unoccupied.',
      'Win Detection: Evaluate win conditions (row, column, diagonal, anti-diagonal) in O(1) time per move instead of scanning all cells.',
      'Game State: Determine ACTIVE, WINNER, or DRAW after every move.'
    ],
    operationsApi: [
      'void initializeGame(int boardSize, const std::vector<Player>& players);',
      'MoveResult makeMove(int playerId, int row, int col);',
      'GameState getGameState() const;',
      'Player getWinner() const;'
    ],
    expectedBehavior: 'Each move places a symbol, validates win/draw conditions in O(1) time, and advances the turn.',
    examplesScenarios: `Scenario 1: Win Condition
1. Player 1 (X) plays (0, 0).
2. Player 2 (O) plays (1, 0).
3. Player 1 (X) plays (0, 1).
4. Player 2 (O) plays (1, 1).
5. Player 1 (X) plays (0, 2) -> Wins row 0! Game transitions to WINNER.`,
    constraintsAssumptions: [
      'Win check must execute in O(1) time per move.',
      'Single in-memory game instance.'
    ],
    edgeCasesErrorHandling: [
      'Playing out of turn throws InvalidTurnException.',
      'Playing in an occupied cell throws CellOccupiedException.',
      'Playing after game has ended throws GameOverException.'
    ],
    stateLifecycleRules: 'Game states: INITIALIZING -> IN_PROGRESS -> COMPLETED (WINNER or DRAW).',
    acceptanceCriteria: [
      'O(1) win verification using row and column count arrays.',
      'Correct turn rotation across all players.',
      'Draw condition detected when board is full with no winner.'
    ],
    whatYouNeedToImplement: 'Implement Board, Player, and GameEngine classes in C++ with test cases for row, column, diagonal wins, and draws.'
  })
};

PHASE1_REWRITE['LLDP1-P2-V1'] = {
  taskName: 'Version 1: Classic 3x3 Grid Engine',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Baseline 3x3 grid implementation with 2 players (X and O).',
    whyOldDesignStruggles: 'N/A — initial baseline.',
    newRequirements: [
      'Create 3x3 board.',
      'Support 2 players taking alternating turns.',
      'Detect win across any row, column, or diagonal.'
    ],
    observableBehavior: 'Alternates moves and reports winner or draw on 3x3 board.',
    examples: 'Three X in row 0 -> Player X wins.',
    acceptanceCriteria: [
      'Validates bounds and occupied cells.',
      'Detects 3 in a row correctly.'
    ]
  })
};

PHASE1_REWRITE['LLDP1-P2-V2'] = {
  taskName: 'Version 2: N x N Scaling & O(1) Win Checking',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'The board size can now be N x N (e.g. 10x10 or 100x100) and must support 3 or more players.',
    whyOldDesignStruggles: 'Iterating over the entire board to check for a winner takes O(N^2) time. For large boards, this causes noticeable lag on every move.',
    newRequirements: [
      'Support arbitrary N x N board size.',
      'Evaluate winning condition in O(1) time after each move using score tracking arrays.',
      'Support M players.'
    ],
    observableBehavior: 'Moves on a 100x100 board execute in microseconds without scanning the grid.',
    examples: 'On 5x5 board with 3 players, 5 in a row by Player 3 wins.',
    acceptanceCriteria: [
      'Win checking runs in O(1) time complexity.',
      'Scales to arbitrary N and M players.'
    ]
  })
};

PHASE1_REWRITE['LLDP1-P2-V3'] = {
  taskName: 'Version 3: Requirement Change — Move History & Undo',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Players can now view past move history and undo their last move.',
    whyOldDesignStruggles: 'If you only updated the board cells directly without keeping a move record, reversing a move is impossible or corrupts score arrays.',
    newRequirements: [
      'Maintain an ordered log of moves.',
      'Implement `undoMove()`: removes the last placed piece, restores the previous player turn, and updates O(1) win tracking scores.'
    ],
    observableBehavior: 'Calling undoMove removes piece from board and reverts turn to the previous player.',
    examples: 'Player 1 places (0,0), then calls undoMove() -> Cell (0,0) becomes empty, turn is still Player 1.',
    acceptanceCriteria: [
      'Undo restores board and internal tracking counters cleanly.',
      'Undo on an empty board throws an exception.'
    ]
  })
};

PHASE1_REWRITE['LLDP1-P2-V4'] = {
  taskName: 'Version 4: Design Review & Invariant Audit',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Comprehensive design review and edge-case testing.',
    whyOldDesignStruggles: 'Ensures board state invariants remain 100% solid under rapid move and undo sequences.',
    newRequirements: [
      'Audit all win conditions on diagonals and anti-diagonals.',
      'Verify that undo after winning move is handled or rejected appropriately.'
    ],
    observableBehavior: 'Deterministic game state across all tests.',
    examples: '100% test coverage over win, draw, and undo operations.',
    acceptanceCriteria: [
      'Zero memory leaks.',
      'Clean separation between Board storage and Game rules.'
    ],
    designReviewNote: 'In post-attempt review: examine how tracking arrays `rows[player][r]` and `cols[player][c]` converted an expensive search into instant O(1) lookups.'
  })
};

// Problem 3: Coffee Maker
PHASE1_REWRITE['LLDP1-P3'] = {
  taskName: 'Problem 3 — Design a Coffee Maker',
  taskDescription: formatMajorProblemDescription({
    contextScenario: 'Design an automated smart coffee brewing machine for an office cafeteria that manages ingredient canisters (water, milk, coffee beans, sugar), brews standard recipes, and supports custom add-ons.',
    functionalRequirements: [
      'Ingredient Inventory: Track volume of water, milk, coffee beans, and sugar in milliliters or grams.',
      'Recipe Catalog: Support brewing standard drinks (Espresso, Cappuccino, Latte) with specific ingredient ratios.',
      'Brewing Operation: Check ingredient availability -> deduct ingredients atomically -> simulate brewing -> dispense drink.',
      'Alerts & Restocking: Alert when any ingredient falls below minimum threshold and allow maintenance refilling.'
    ],
    operationsApi: [
      'void restock(Ingredient ingredient, int amount);',
      'BrewResult brew(const std::string& drinkName);',
      'int getIngredientLevel(Ingredient ingredient) const;',
      'void registerRecipe(const Recipe& recipe);'
    ],
    expectedBehavior: 'If ingredients are sufficient, brew deducts ingredients and returns SUCCESS. If any ingredient is insufficient, no ingredients are deducted and InsufficientIngredientException is thrown.',
    examplesScenarios: `Scenario 1: Brew Cappuccino
1. Machine has 500ml milk, 500ml water, 200g beans.
2. User requests Cappuccino (needs 100ml water, 100ml milk, 20g beans).
3. System dispenses Cappuccino. Remaining: 400ml milk, 400ml water, 180g beans.`,
    constraintsAssumptions: [
      'Ingredient amounts are non-negative integers.',
      'Atomic brewing: either all ingredients are deducted or none.'
    ],
    edgeCasesErrorHandling: [
      'Requesting an unknown recipe throws UnknownRecipeException.',
      'Brewing when beans are empty throws OutOfIngredientException without deducting water or milk.'
    ],
    stateLifecycleRules: 'Machine states: IDLE -> CHECKING_INGREDIENTS -> BREWING -> DISPENSING.',
    acceptanceCriteria: [
      'Atomic ingredient deduction.',
      'Accurate inventory reporting.',
      'Clean domain modeling of recipes and canisters.'
    ],
    whatYouNeedToImplement: 'Implement Ingredient, Recipe, Inventory, and CoffeeMachine classes in C++ with unit tests.'
  })
};

PHASE1_REWRITE['LLDP1-P3-V1'] = {
  taskName: 'Version 1: Fixed Recipes & Inventory Tracking',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Baseline coffee machine with fixed recipes for Espresso and Latte.',
    whyOldDesignStruggles: 'N/A — initial baseline.',
    newRequirements: [
      'Support Espresso and Latte recipes.',
      'Deduct water, beans, and milk on brew.',
      'Reject brew if ingredients are insufficient.'
    ],
    observableBehavior: 'Brewing reduces canister levels by recipe amounts.',
    examples: 'Brew Espresso -> Deducts 30ml water, 15g beans.',
    acceptanceCriteria: [
      'Rejects brew when canister is empty.',
      'Atomic ingredient deduction.'
    ]
  })
};

PHASE1_REWRITE['LLDP1-P3-V2'] = {
  taskName: 'Version 2: Dynamic Recipe Customization',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Users can now customize their drinks (e.g. "Extra shot of espresso", "Add oat milk", "Double sugar").',
    whyOldDesignStruggles: 'Creating a new subclass or recipe entry for every possible combination of extra shot, extra milk, and sugar causes class explosion.',
    newRequirements: [
      'Support base recipes with optional add-on modifiers.',
      'Each modifier adds ingredient requirements and increases price.'
    ],
    observableBehavior: 'Ordering Latte + Extra Shot deducts 200ml milk + 30g beans (instead of standard 15g).',
    examples: 'Latte (15g beans) + Extra Shot (15g beans) = 30g beans total.',
    acceptanceCriteria: [
      'Add-ons compose cleanly onto any base recipe.',
      'Total ingredient deduction is accurate.'
    ]
  })
};

PHASE1_REWRITE['LLDP1-P3-V3'] = {
  taskName: 'Version 3: Requirement Change — Tea & Specialty Drinks',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'The office added green tea, black tea, and hot chocolate, which do not use coffee beans at all.',
    whyOldDesignStruggles: 'If the machine was designed assuming every drink requires coffee beans, adding non-coffee drinks causes awkward nulls or zero-bean workarounds.',
    newRequirements: [
      'Support non-coffee beverage recipes (Tea, Hot Chocolate).',
      'Support extensible ingredients (Tea Leaves, Cocoa Powder).'
    ],
    observableBehavior: 'Brewing Tea requires hot water and tea leaves, without touching coffee beans.',
    examples: 'Brew Green Tea -> Deducts 200ml water and 5g tea leaves.',
    acceptanceCriteria: [
      'New ingredients integrate without altering existing coffee recipes.',
      'Inventory tracks tea and cocoa independently.'
    ]
  })
};

PHASE1_REWRITE['LLDP1-P3-V4'] = {
  taskName: 'Version 4: Design Review & Invariant Audit',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Final architectural review of Coffee Maker.',
    whyOldDesignStruggles: 'Validates extensibility and canister safety.',
    newRequirements: [
      'Audit all inventory threshold alerts.',
      'Verify clean composition of beverage recipes and add-ons.'
    ],
    observableBehavior: 'All beverage combinations brew deterministically.',
    examples: '100% test pass on standard and custom drinks.',
    acceptanceCriteria: [
      'Clean separation between inventory management, recipes, and machine controller.'
    ],
    designReviewNote: 'In post-attempt review: see how wrapping base drinks with add-on modifiers mirrored the Decorator concept without having to inherit 20 drink subclasses.'
  })
};

// Problem 4: Library Management System
PHASE1_REWRITE['LLDP1-P4'] = {
  taskName: 'Problem 4 — Design a Library Management System',
  taskDescription: formatMajorProblemDescription({
    contextScenario: 'Design a city library circulation engine that manages a catalog of book titles, tracks physical book copies across branches, manages member borrowing privileges, and enforces checkout policies.',
    functionalRequirements: [
      'Catalog & Physical Copy Separation: A Book (ISBN, Title, Author) can have multiple physical BookCopies (Barcode, RackLocation, Status).',
      'Borrowing Operations: Members can borrow available physical copies up to a max limit (e.g. 5 books) for a fixed loan duration (14 days).',
      'Returns & Fines: Returning an overdue book calculates fine based on elapsed days.',
      'Reservation Queue: If all copies of a book are borrowed, members can place a reservation in a FIFO waitlist.'
    ],
    operationsApi: [
      'BookCopy checkoutBook(const std::string& memberId, const std::string& barcode);',
      'Receipt returnBook(const std::string& barcode);',
      'void reserveBook(const std::string& memberId, const std::string& isbn);',
      'std::vector<BookCopy> searchBooks(const std::string& query);'
    ],
    expectedBehavior: 'Checking out a book changes its status from AVAILABLE to BORROWED, links it to the member, and decrements available copies.',
    examplesScenarios: `Scenario 1: Checkout and Return
1. Member borrows "Clean Code" Copy #101. Status becomes BORROWED.
2. Member returns Copy #101 5 days later. Status becomes AVAILABLE. Fine: $0.00.`,
    constraintsAssumptions: [
      'A member cannot borrow more than 5 books at a time.',
      'Fines are calculated at $0.50 per overdue day.'
    ],
    edgeCasesErrorHandling: [
      'Borrowing an already borrowed copy throws CopyNotAvailableException.',
      'Borrowing with unpaid fines above threshold throws MemberSuspendedException.',
      'Returning a copy that was never checked out throws InvalidReturnException.'
    ],
    stateLifecycleRules: 'BookCopy states: AVAILABLE -> BORROWED -> RESERVED -> LOST.',
    acceptanceCriteria: [
      'Clear separation between Book metadata and BookCopy physical instances.',
      'FIFO waitlist correctly notifies next waiting member upon return.',
      'Fine calculation is strictly deterministic.'
    ],
    whatYouNeedToImplement: 'Implement Book, BookCopy, Member, and LibraryService classes in modern C++ with unit tests.'
  })
};

PHASE1_REWRITE['LLDP1-P4-V1'] = {
  taskName: 'Version 1: Catalog & Physical Copy Multiplicity',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Baseline catalog model distinguishing Book (concept) from BookCopy (physical item).',
    whyOldDesignStruggles: 'N/A — initial baseline.',
    newRequirements: [
      'Model Book entity (Title, Author, ISBN).',
      'Model BookCopy entity with unique barcode and status (AVAILABLE / BORROWED).',
      'Allow searching by title or author and checking copy availability.'
    ],
    observableBehavior: 'Adding 3 physical copies of 1 ISBN shows 3 available items.',
    examples: 'Library has 1 Book "Dune" with 3 copies: Barcodes D-01, D-02, D-03.',
    acceptanceCriteria: [
      'Book and BookCopy are distinct classes.',
      'Availability queries return accurate copy counts.'
    ]
  })
};

PHASE1_REWRITE['LLDP1-P4-V2'] = {
  taskName: 'Version 2: Borrowing Policies & FIFO Reservation Queue',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Members can now checkout books, and if all copies are checked out, join a reservation queue.',
    whyOldDesignStruggles: 'Without a reservation queue, members must constantly poll or fight over returned books.',
    newRequirements: [
      'Enforce maximum borrowing limit (5 books per member).',
      'If all copies are checked out, allow members to reserve the book.',
      'When a copy is returned, transition its status to RESERVED for the first member in the queue.'
    ],
    observableBehavior: 'Returning a reserved book holds it for the reserver instead of making it public.',
    examples: 'Member A returns book -> Book status becomes RESERVED for Member B (first in waitlist).',
    acceptanceCriteria: [
      'Enforces max 5 books limit.',
      'FIFO reservation ordering respected.'
    ]
  })
};

PHASE1_REWRITE['LLDP1-P4-V3'] = {
  taskName: 'Version 3: Overdue Fine Engine & Member Suspension',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added overdue fine calculations and member suspension when fines exceed limits.',
    whyOldDesignStruggles: 'Without automated fine calculation and suspension, late returns cannot be governed.',
    newRequirements: [
      'Track checkout date and due date (14-day loan).',
      'On return, if current date > due date, compute fine ($0.50 / day).',
      'If member has accumulated > $10 in unpaid fines, suspend borrowing privileges.'
    ],
    observableBehavior: 'Member with $12 in unpaid fines is blocked from borrowing new books.',
    examples: 'Book returned 4 days late -> $2.00 fine charged to member account.',
    acceptanceCriteria: [
      'Calculates exact overdue fine.',
      'Suspends borrowing when fine limit is breached.'
    ]
  })
};

PHASE1_REWRITE['LLDP1-P4-V4'] = {
  taskName: 'Version 4: Design Review & Invariant Audit',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Complete architectural review of Library Management System.',
    whyOldDesignStruggles: 'Validates that loan dates, waitlists, and physical copies behave consistently under heavy circulation.',
    newRequirements: [
      'Comprehensive integration tests covering full lifecycle: Add Book -> Add Copies -> Checkout -> Reserve -> Late Return -> Fine Assessment.'
    ],
    observableBehavior: 'All circulation operations succeed deterministically.',
    examples: '100% test pass across all borrowing scenarios.',
    acceptanceCriteria: [
      'Zero dangling copy references.',
      'Clean domain boundary separation.'
    ],
    designReviewNote: 'In post-attempt review: examine how separating Book (metadata) from BookCopy (physical item with lifecycle) prevented duplicating author/ISBN strings across physical items.'
  })
};

fs.writeFileSync(path.resolve(__dirname, 'phase1_rewritten_data.json'), JSON.stringify(PHASE1_REWRITE, null, 2));
console.log(`✓ Phase 1 successfully generated: ${Object.keys(PHASE1_REWRITE).length} records authored.`);

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatUnitDescription, formatDrillDescription, formatMajorProblemDescription, formatProblemVersionDescription } from './content_formatters.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PHASE3_REWRITE = {};

// ============================================================================
// MODULES (4)
// ============================================================================
PHASE3_REWRITE['LLDP3-M1'] = {
  taskName: 'Module 3.1: Discovering How Objects Communicate and React',
  taskDescription: 'Learn how to solve recurring communication problems between objects—like broadcasting events, swapping calculations, managing state lifecycles, and handling requests.'
};

PHASE3_REWRITE['LLDP3-M2'] = {
  taskName: 'Module 3.2: Discovering How Objects Are Built and Connected',
  taskDescription: 'Learn how to create objects without hardcoding constructors, how to wrap objects with extra features dynamically, and how to treat individual items and groups identically.'
};

PHASE3_REWRITE['LLDP3-M3'] = {
  taskName: 'Module 3.3: Understanding More Specialized Object Structures',
  taskDescription: 'Master structural wrappers, clean up global variable traps (Singletons), and learn how to recognize specialized object designs in real systems.'
};

PHASE3_REWRITE['LLDP3-M4'] = {
  taskName: 'Module 3.4: Choosing the Right Design When Patterns Look Similar',
  taskDescription: 'Learn how to tell seemingly similar patterns apart in interviews (like Strategy vs State, or Decorator vs Adapter vs Proxy) and predict which design is needed under scale.'
};

// ============================================================================
// LEARNING UNITS (14) — ZERO-SPOILER DISCOVERY PEDAGOGY
// ============================================================================

// Unit 3.1.1
PHASE3_REWRITE['LLDP3-U3.1.1'] = {
  taskName: 'Unit 3.1.1: What Happens When Our Calculation Rules Keep Changing?',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'If your online store calculates shipping using FedEx, DHL, or Postal Service, and marketing keeps adding new dynamic promotional discounts, how do you stop checkout code from turning into an enormous mess of if/else statements?',
    seeItWithASmallExample: `Notice how calculations multiply:
int calculateShipping(string carrier, int weight) {
    if (carrier == "FEDEX") return 500 + weight * 10;
    else if (carrier == "DHL") return 450 + weight * 12;
    else if (carrier == "POSTAL") return 200 + weight * 5;
    // Next week: Overnight, Holiday Discount, Prime Free Shipping!
}`,
    whatIsGoingWrong: 'Every new delivery rule forces editing and re-testing the core checkout function. You cannot test FedEx pricing without risking breaking DHL calculations.',
    theSimpleIdea: 'Isolate the part that changes. Put each shipping calculation rule into its own small class that implements one common method: `calculateCost(order)`. Pass whichever rule is active into checkout.',
    technicalWords: [
      { term: 'Strategy Pattern', explanation: 'A design pattern that defines a family of interchangeable algorithms behind a common interface.' },
      { term: 'Context', explanation: 'The main class (like CheckoutService) that uses the interchangeable algorithm without caring which one is active.' },
      { term: 'Algorithm Family', explanation: 'A group of different ways to accomplish the same general task (e.g. different ways to calculate shipping).' }
    ],
    whyThisMattersInLLD: 'This is the most widely tested design pattern in software interviews. It completely decouples your core business workflow from rapidly changing pricing or calculation formulas.',
    tryIt: 'Define a contract `ShippingRule` with `calculate(order)`. Implement `FedExRule` and `PostalRule`. Swap them in a checkout object and compare totals.',
    nowChangeTheRequirement: 'Add a new "OvernightCourier" rule. Did you modify CheckoutService?',
    whatDidTheChangeTeachUs: 'CheckoutService stayed 100% untouched! You added the new feature purely by adding a new class.',
    canYouExplainIt: 'Can you explain why separating the shipping math into its own object makes adding new delivery partners easy?'
  })
};

// Unit 3.1.2
PHASE3_REWRITE['LLDP3-U3.1.2'] = {
  taskName: 'Unit 3.1.2: How Can Multiple Services React to an Event Without Calling Each Other Directly?',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'When a customer places an order, the Inventory service must reserve stock, the Email service must send a receipt, Analytics must log a sale, and Fraud Detection must inspect the payment. How do you do this without `OrderService` knowing about all 10 services?',
    seeItWithASmallExample: `Without decoupling:
void completeOrder(Order o) {
    inventory.deduct(o);
    emailService.send(o);
    analytics.log(o);
    fraudService.inspect(o);
    smsService.notify(o); // OrderService knows everyone!
}`,
    whatIsGoingWrong: 'OrderService is tightly glued to every department in the company. If the SMS service crashes or has a bug, the entire checkout crashes.',
    theSimpleIdea: 'Have OrderService simply shout: "An order was placed!" Anyone interested in orders registers as a listener. When the event happens, the system automatically loops through the listeners and notifies them.',
    technicalWords: [
      { term: 'Observer Pattern', explanation: 'A design pattern where an object maintains a list of dependents and notifies them automatically of state changes.' },
      { term: 'Subject / Publisher', explanation: 'The object that triggers events (e.g. OrderService).' },
      { term: 'Observer / Subscriber', explanation: 'The objects that listen for events and react (e.g. EmailNotifier, InventoryTracker).' }
    ],
    whyThisMattersInLLD: 'Event-driven architectures in production use this exact pattern to decouple disparate microservices and user interface listeners.',
    tryIt: 'Create an `OrderListener` contract with `onOrderPlaced(order)`. Have `EmailService` implement it and register with an `OrderEventManager`.',
    nowChangeTheRequirement: 'Add a new Slack channel notifier. Did you change OrderService?',
    whatDidTheChangeTeachUs: 'OrderService remained completely unaware of Slack! Slack simply subscribed itself as another listener.',
    canYouExplainIt: 'Can you explain why a YouTube channel owner does not need to know who every subscriber is to post a video?'
  })
};

// Unit 3.1.3
PHASE3_REWRITE['LLDP3-U3.1.3'] = {
  taskName: 'Unit 3.1.3: What Happens When an Object Behaves Differently Depending on Its Status?',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'A document publishing tool has stages: Draft, Moderation Review, Published, and Archived. You can edit a Draft, but editing an Archived document is illegal. How do you manage this without writing 20 nested `if (status == DRAFT)` blocks inside every single method?',
    seeItWithASmallExample: `Sprawling status checks:
void edit(string newText) {
    if (status == DRAFT) { /* allow */ }
    else if (status == REVIEW) { /* warning */ }
    else if (status == PUBLISHED) { /* error */ }
    else if (status == ARCHIVED) { /* fatal error */ }
}
// You have to repeat this entire if/else tree inside publish(), review(), and delete()!`,
    whatIsGoingWrong: 'Adding a new status (like "Scheduled") requires finding and editing every single action method in the class. Missing a status check leads to silent data corruption.',
    theSimpleIdea: 'Turn each status into its own small class (`DraftState`, `PublishedState`). Each class only defines what is legal in that specific state. When status changes, swap the active state object.',
    technicalWords: [
      { term: 'State Pattern', explanation: 'A design pattern that allows an object to alter its behavior when its internal state changes, appearing as if its class changed.' },
      { term: 'State Transition', explanation: 'Moving an object from one valid state to another (e.g. Draft -> InReview).' },
      { term: 'Context', explanation: 'The main object holding a reference to the current active state.' }
    ],
    whyThisMattersInLLD: 'From Vending Machines and ATMs to Amazon Order lifecycles, real-world systems are stateful. Modeling states as objects eliminates hundreds of fragile if/else statements.',
    tryIt: 'Create a `DocumentState` contract. Implement `DraftState` (which allows edit) and `ArchivedState` (which throws an exception on edit).',
    nowChangeTheRequirement: 'Transition a document from Draft to Archived, then attempt to call edit.',
    whatDidTheChangeTeachUs: 'The call was instantly rejected by `ArchivedState` without a single if/else check in the Document class.',
    canYouExplainIt: 'Can you explain why a traffic light behaves differently when it is red versus green, and how you would model that with objects?'
  })
};

// Unit 3.1.4
PHASE3_REWRITE['LLDP3-U3.1.4'] = {
  taskName: 'Unit 3.1.4: How Do We Record, Queue, and Undo Actions?',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'In a text editor, when a user types a word, deletes a line, or pastes text, how do you make the "Undo" (Ctrl+Z) and "Redo" buttons work reliably?',
    seeItWithASmallExample: `Direct execution:
editor.deleteLine(5); // Text is gone! How do you reverse it?`,
    whatIsGoingWrong: 'If operations modify data directly without saving what happened, reversing an action requires complex guessing or saving massive full-document snapshots after every keystroke.',
    theSimpleIdea: 'Turn the action itself into an object! A `DeleteCommand` stores what text was deleted and where. It has two methods: `execute()` (deletes the text) and `undo()` (re-inserts the text). Store commands in a history stack.',
    technicalWords: [
      { term: 'Command Pattern', explanation: 'A design pattern that encapsulates a request as a standalone object containing all information needed to perform or reverse the action.' },
      { term: 'Undo / Redo Stack', explanation: 'LIFO collections that track executed and undone commands.' },
      { term: 'Receiver', explanation: 'The actual business object (e.g. TextBuffer) that the command acts upon.' }
    ],
    whyThisMattersInLLD: 'Commands allow scheduling background tasks, queuing job requests, tracking audit logs, and supporting transaction rollback.',
    tryIt: 'Create an `InsertTextCommand` that holds the inserted string and position. Implement `execute()` and `undo()`.',
    nowChangeTheRequirement: 'Push 3 insert commands onto a stack and call `undo()` twice.',
    whatDidTheChangeTeachUs: 'The text buffer reverted cleanly to its exact state from two moves ago without storing full document copies.',
    canYouExplainIt: 'Can you explain why a TV remote button is like a Command object that sends a signal to the TV receiver?'
  })
};

// Unit 3.1.5
PHASE3_REWRITE['LLDP3-U3.1.5'] = {
  taskName: 'Unit 3.1.5: How Do We Pass a Request Through a Series of Checks?',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'Before a web server processes an API request, it must: 1. Check rate limits, 2. Check authentication token, 3. Validate request schema, 4. Check user permissions. How do you chain these checks without nesting 10 if-statements inside your controller?',
    seeItWithASmallExample: `Nested mess:
void handleRequest(Request r) {
    if (rateLimiter.isAllowed(r)) {
        if (auth.isAuthenticated(r)) {
            if (validator.isValid(r)) {
                // Process request...
            }
        }
    }
}`,
    whatIsGoingWrong: 'Adding a new check (like Fraud Detection) makes the pyramid of if-statements deeper. Reordering checks or enabling checks only for certain routes becomes a maintenance nightmare.',
    theSimpleIdea: 'Link the checks into a pipeline like a bucket brigade. Each handler inspects the request: if valid, it passes the request to the `next` handler in line. If invalid, it halts the chain immediately.',
    technicalWords: [
      { term: 'Chain of Responsibility', explanation: 'A design pattern that passes a request along a chain of handlers until one handles it or the chain completes.' },
      { term: 'Middleware / Filter', explanation: 'An individual processing step in a request pipeline.' },
      { term: 'Next Pointer', explanation: 'Each handler holds a reference to the next handler in the pipeline.' }
    ],
    whyThisMattersInLLD: 'Every modern web framework (Express, Spring, ASP.NET) uses this pattern for request middleware, logging, security, and validation.',
    tryIt: 'Create `AuthHandler` and `RateLimitHandler`. Connect them so `authHandler->setNext(rateLimitHandler)`.',
    nowChangeTheRequirement: 'Add an IP blocklist filter before authentication.',
    whatDidTheChangeTeachUs: 'You simply inserted `IpFilter` at the head of the chain without touching the existing handlers.',
    canYouExplainIt: 'Can you explain how customer support escalation (Tier 1 -> Tier 2 -> Manager) works like a Chain of Responsibility?'
  })
};

// Unit 3.2.1
PHASE3_REWRITE['LLDP3-U3.2.1'] = {
  taskName: 'Unit 3.2.1: How Do We Create Objects When Constructors Are Too Complicated?',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'What happens when a class has 15 configuration parameters (like a database connection or HTTP client), or when calling code shouldn\'t know the exact concrete class name to instantiate?',
    seeItWithASmallExample: `Telescoping Constructor Nightmare:
HttpClient client("https://api.com", 8080, true, 5000, 3, false, nullptr, "", true, ...);
// What does the 6th boolean even do? It is impossible to read!`,
    whatIsGoingWrong: 'Passing 10 positional parameters into a constructor causes bugs where you accidentally swap two numbers. Furthermore, hardcoding `new ConcreteClass()` in 50 files makes swapping implementations painful.',
    theSimpleIdea: 'Use a Builder to configure optional settings step-by-step with readable names (e.g. `builder.setTimeout(5000).setRetries(3).build()`), or use a Factory method to choose the right object based on input.',
    technicalWords: [
      { term: 'Builder Pattern', explanation: 'A creational pattern that constructs complex objects step-by-step using fluent method calls.' },
      { term: 'Factory Method', explanation: 'A creational pattern that delegates object instantiation to a specialized method or class.' },
      { term: 'Fluent Interface', explanation: 'Method chaining where each setter returns `*this` so you can write `obj.setA().setB()`.' }
    ],
    whyThisMattersInLLD: 'Builders make configuration self-documenting and safe. Factories isolate object creation so client code remains decoupled from concrete classes.',
    tryIt: 'Build an `HttpRequestBuilder` that allows setting URL, headers, and timeout, then creates an immutable `HttpRequest`.',
    nowChangeTheRequirement: 'Create a factory `DocumentExporterFactory::create("PDF")` that returns a `PdfExporter`.',
    whatDidTheChangeTeachUs: 'Callers only asked for "PDF" without knowing or caring how `PdfExporter` is constructed internally.',
    canYouExplainIt: 'Can you explain why ordering a customized pizza (crust, toppings, sauce) is like using a Builder?'
  })
};

// Unit 3.2.2
PHASE3_REWRITE['LLDP3-U3.2.2'] = {
  taskName: 'Unit 3.2.2: Adding Features to an Object at Runtime & Bridging Incompatible Classes',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'How do you add features (like encryption or logging) to an existing object dynamically without modifying its class, and how do you use a 3rd-party library whose method names do not match your interface?',
    seeItWithASmallExample: `Two common problems:
Problem 1: You have a PlainCoffee object. You want to wrap it with Milk and Sugar dynamically at runtime.
Problem 2: Your app expects \`pay(int cents)\`, but a 3rd-party Stripe library expects \`makePayment(double dollars)\`.`,
    whatIsGoingWrong: 'Using inheritance to add features causes class explosion. Rewriting 3rd-party libraries is impossible because you do not own their source code.',
    theSimpleIdea: 'Wrap the object! A Decorator wraps an object to add extra behavior while keeping the same interface. An Adapter wraps an incompatible object to convert its interface into the one your app expects.',
    technicalWords: [
      { term: 'Decorator Pattern', explanation: 'Attaches additional responsibilities to an object dynamically by wrapping it.' },
      { term: 'Adapter Pattern', explanation: 'Converts the interface of a class into another interface that clients expect.' },
      { term: 'Wrapper', explanation: 'A general term for an object that contains another object to modify or adapt its behavior.' }
    ],
    whyThisMattersInLLD: 'Decorators power Java/C++ I/O streams (`BufferedReader(FileReader)`). Adapters let your clean architecture integrate cleanly with legacy or vendor SDKs.',
    tryIt: 'Wrap a `SimpleCoffee` ($2) inside `MilkDecorator` (+$1) and `SugarDecorator` (+$0.50). Verify total cost is $3.50.',
    nowChangeTheRequirement: 'Wrap a 3rd-party `LegacyPaymentGateway` behind your `PaymentMethod` interface.',
    whatDidTheChangeTeachUs: 'Your checkout code called `pay()` normally, while the Adapter quietly translated the call for the vendor library.',
    canYouExplainIt: 'Can you explain how a travel plug adapter lets your phone charger fit into a European wall socket?'
  })
};

// Unit 3.2.3
PHASE3_REWRITE['LLDP3-U3.2.3'] = {
  taskName: 'Unit 3.2.3: Treating Single Items and Groups of Items Exactly the Same',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'In a file system, a Directory can contain Files, and a Directory can also contain other Directories. When you ask for the total file size, why should your code care whether an item is a single file or a folder of 100 files?',
    seeItWithASmallExample: `Without uniform handling:
if (item.isDirectory()) {
    // loop over children, recursive checks...
} else {
    // get file size directly
}`,
    whatIsGoingWrong: 'Every function that interacts with your tree (calculating size, searching, rendering UI) has to constantly check "is this a leaf or is this a container?", writing duplicate recursive loops everywhere.',
    theSimpleIdea: 'Make both `File` and `Directory` implement the exact same `FileSystemItem` interface with `getSize()`. A File returns its own size; a Directory returns the sum of its children\'s sizes.',
    technicalWords: [
      { term: 'Composite Pattern', explanation: 'Composes objects into tree structures to represent part-whole hierarchies, allowing clients to treat individual objects and compositions uniformly.' },
      { term: 'Leaf', explanation: 'An item with no children (e.g. a File).' },
      { term: 'Composite', explanation: 'A container that holds children (e.g. a Directory).' }
    ],
    whyThisMattersInLLD: 'Used in graphic scene graphs, organizational hierarchies (Employee / Manager), and UI layout trees (Button inside Panel inside Window).',
    tryIt: 'Create `FileSystemItem` with `getSize()`. Create a `Directory` holding two `File`s and another `Directory`. Call `root->getSize()`.',
    nowChangeTheRequirement: 'Calculate the size of an entire nested project folder.',
    whatDidTheChangeTeachUs: 'A single call to `root->getSize()` automatically traversed the entire nested tree cleanly with zero special cases.',
    canYouExplainIt: 'Can you explain why a delivery box containing two smaller boxes can be weighed the same way as a box with a single toy?'
  })
};

// Unit 3.3.1
PHASE3_REWRITE['LLDP3-U3.3.1'] = {
  taskName: 'Unit 3.3.1: Controlling Access, Hiding Complexity & Standardizing Algorithms',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'How do you lazily load a 100MB image only when it is displayed (Proxy)? How do you give callers a simple 1-button interface to a complicated 10-class subsystem (Facade)? How do you outline an algorithm’s skeleton while letting subclasses fill in details (Template Method)?',
    seeItWithASmallExample: `Facade example:
// Instead of client doing:
power.on(); cpu.init(); ram.check(); gpu.load(); disk.boot();
// Just do:
computerFacade.start();`,
    whatIsGoingWrong: 'Exposing complicated subsystems directly forces callers to understand low-level wiring. Loading heavy resources eagerly wastes memory.',
    theSimpleIdea: 'Use structural patterns to simplify interactions: a Facade provides a clean front door; a Proxy acts as a stand-in controlling access; a Template Method defines algorithm steps in a base class.',
    technicalWords: [
      { term: 'Facade Pattern', explanation: 'Provides a simplified high-level interface to a complex subsystem.' },
      { term: 'Proxy Pattern', explanation: 'Provides a surrogate or placeholder for another object to control access, lazy load, or log requests.' },
      { term: 'Template Method Pattern', explanation: 'Defines the skeleton of an algorithm in a base class method, deferring specific steps to subclasses.' }
    ],
    whyThisMattersInLLD: 'These patterns keep code clean, protect boundaries, and eliminate boilerplate.',
    tryIt: 'Create a `DatabaseProxy` that checks user permissions before delegating queries to `RealDatabase`.',
    nowChangeTheRequirement: 'Create a `DataMiner` template method with `openFile()`, `extractData()`, and `closeFile()`.',
    whatDidTheChangeTeachUs: 'Subclasses customized how PDF vs CSV data is extracted, while the file open/close lifecycle remained standardized.',
    canYouExplainIt: 'Can you explain how a hotel receptionist acts like a Facade for the housekeeping, kitchen, and billing departments?'
  })
};

// Unit 3.3.2
PHASE3_REWRITE['LLDP3-U3.3.2'] = {
  taskName: 'Unit 3.3.2: Why Global Singletons Cause Hidden Problems',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'Why do software architects warn against using `Database::getInstance()` everywhere, and how does a global singleton make unit testing almost impossible?',
    seeItWithASmallExample: `The Global Trap:
void placeOrder() {
    Database::getInstance().save(); // Hidden global dependency!
}`,
    whatIsGoingWrong: 'Singletons introduce hidden state coupling. Unit tests cannot run in parallel because they all overwrite the same global instance. Swapping databases for testing is impossible without rewriting code.',
    theSimpleIdea: 'If only one instance of an object should exist, create one instance in your application setup (main) and pass it into the classes that need it via dependency injection. Do not make it a global static grab-bag.',
    technicalWords: [
      { term: 'Singleton Pattern', explanation: 'A creational pattern that ensures a class has only one instance and provides global access to it.' },
      { term: 'Global State', explanation: 'Variables accessible anywhere in the program, which lead to untraceable side effects.' },
      { term: 'Composition Root', explanation: 'The single location in an app where objects are instantiated and wired together.' }
    ],
    whyThisMattersInLLD: 'Interviewers often ask candidates to critique the Singleton pattern to see if they understand testability and clean architecture.',
    tryIt: 'Refactor a class that calls `Config::getInstance()` to receive `const Config&` in its constructor.',
    nowChangeTheRequirement: 'Run two tests in parallel with different configurations.',
    whatDidTheChangeTeachUs: 'Because configuration was passed in, each test used its own isolated settings with zero interference.',
    canYouExplainIt: 'Can you explain why sharing a single global clipboard between 5 different programs can cause annoying bugs?'
  })
};

// Unit 3.3.3
PHASE3_REWRITE['LLDP3-U3.3.3'] = {
  taskName: 'Unit 3.3.3: Specialized Designs: Sharing Identical Data & Centralizing Dialogs',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'What do you do when a forest simulation needs to render 1,000,000 trees without running out of RAM (Flyweight), or when 5 UI elements need to talk to each other without forming a tangled web (Mediator)?',
    seeItWithASmallExample: `Flyweight idea:
Instead of 1,000,000 Tree objects each storing the same 10MB 3D mesh:
Store the 3D mesh ONCE in memory, and have 1,000,000 tiny Tree objects just store their (x, y) coordinates and point to that single shared mesh!`,
    whatIsGoingWrong: 'Duplicating heavy identical data across millions of objects causes out-of-memory crashes. Having 5 dialog elements notify each other directly causes a tangled web of dependencies.',
    theSimpleIdea: 'Share intrinsic immutable state across objects (Flyweight), and route cross-object conversations through a central coordinator (Mediator).',
    technicalWords: [
      { term: 'Flyweight Pattern', explanation: 'Reduces memory usage by sharing common state among multiple objects.' },
      { term: 'Mediator Pattern', explanation: 'Reduces coupling between components by forcing them to communicate through a mediator object.' },
      { term: 'Intrinsic State', explanation: 'Data that is identical and shareable across all instances (e.g. tree texture).' },
      { term: 'Extrinsic State', explanation: 'Data that is unique to each instance (e.g. tree coordinates).' }
    ],
    whyThisMattersInLLD: 'These patterns show deep architectural mastery in high-scale and complex UI design rounds.',
    tryIt: 'Implement a `CharacterFormat` flyweight shared by 10,000 characters in a text document.',
    nowChangeTheRequirement: 'Create a `DialogMediator` coordinating a Checkbox and a Submit Button.',
    whatDidTheChangeTeachUs: 'The checkbox and button do not know about each other; they only talk to the mediator, keeping UI widgets decoupled.',
    canYouExplainIt: 'Can you explain how an air traffic control tower acts like a Mediator between planes landing at an airport?'
  })
};

// Unit 3.4.1
PHASE3_REWRITE['LLDP3-U3.4.1'] = {
  taskName: 'Unit 3.4.1: Strategy vs State: Spotting the Difference',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'Both the Strategy pattern and State pattern look virtually identical in UML diagrams (Context delegating to an interface). How do you know which one to use in an interview?',
    seeItWithASmallExample: `Compare:
Strategy: The client chooses the algorithm from the outside (e.g. "Use FedEx shipping"). The strategy usually does not change itself.
State: The object transitions its own state from the inside (e.g. VendingMachine transitions itself from Idle to Dispensing). The states know about each other!`,
    whatIsGoingWrong: 'Using State when you need Strategy leads to rigid coupling. Using Strategy when you need State leads to external code trying to manage internal lifecycles.',
    theSimpleIdea: 'Strategy is about HOW you do something (interchangeable algorithm). State is about WHAT you can do right now (lifecycle state machine).',
    technicalWords: [
      { term: 'Strategy Intent', explanation: 'Interchangeable algorithms selected by the client.' },
      { term: 'State Intent', explanation: 'Behavior changes automatically as internal lifecycle evolves.' }
    ],
    whyThisMattersInLLD: 'Interviewers frequently test this exact distinction. Being able to cleanly articulate the difference demonstrates senior design maturity.',
    tryIt: 'Review a PaymentCalculator and an OrderStatusTracker. Classify which is Strategy and which is State.',
    nowChangeTheRequirement: 'An Order moves from Pending to Shipped automatically upon payment confirmation.',
    whatDidTheChangeTeachUs: 'This is State! The transitions are driven by internal lifecycle events, not external user algorithm selection.',
    canYouExplainIt: 'Can you explain why choosing between driving a car or taking a train is a Strategy, but being a teenager vs an adult is a State?'
  })
};

// Unit 3.4.2
PHASE3_REWRITE['LLDP3-U3.4.2'] = {
  taskName: 'Unit 3.4.2: Decorator vs Adapter vs Proxy: Choosing the Right Wrapper',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'Decorator, Adapter, and Proxy all wrap an underlying object. How do you distinguish them in a high-pressure interview?',
    seeItWithASmallExample: `Compare their intentions:
Adapter: Changes the interface so incompatible code can talk. ("I make this square peg fit a round hole").
Decorator: Keeps the SAME interface, but adds extra behavior dynamically. ("I wrap this coffee with milk").
Proxy: Keeps the SAME interface, but controls access, lazy loads, or logs. ("I guard this database").`,
    whatIsGoingWrong: 'Using the wrong term in an interview confuses the interviewer and suggests you memorized definitions without understanding intent.',
    theSimpleIdea: 'Look at the intent! Adapter changes the interface. Decorator enhances the behavior. Proxy controls the access.',
    technicalWords: [
      { term: 'Adapter Intent', explanation: 'Interface translation for compatibility.' },
      { term: 'Decorator Intent', explanation: 'Dynamic enhancement of functionality.' },
      { term: 'Proxy Intent', explanation: 'Access control, caching, or lazy loading.' }
    ],
    whyThisMattersInLLD: 'Understanding intent over structure is the hallmark of a true object-oriented designer.',
    tryIt: 'Write down 3 scenarios: a logging wrapper, a legacy API bridge, and an encrypted stream. Label each with its correct pattern.',
    nowChangeTheRequirement: 'An image should only be downloaded from the network when its `display()` method is first called.',
    whatDidTheChangeTeachUs: 'This is a Virtual Proxy! Same interface, but controls lazy initialization.',
    canYouExplainIt: 'Can you explain how a bodyguard (Proxy), an English translator (Adapter), and a winter coat (Decorator) all wrap a person differently?'
  })
};

// Unit 3.4.3
PHASE3_REWRITE['LLDP3-U3.4.3'] = {
  taskName: 'Unit 3.4.3: Predicting Which Pattern Will Emerge as Requirements Grow',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'When looking at a basic system, how do experienced engineers know in advance where requirement changes will occur, and which design pattern will be needed?',
    seeItWithASmallExample: `Look at this requirement:
"Currently we only accept Credit Card, but we will add Apple Pay, Crypto, and Bank Transfer next month."
-> Predict: Strategy pattern will emerge for Payment!

"Currently we only print invoices to the screen, but we will add PDF, Email, and SMS alerts."
-> Predict: Observer or Chain of Responsibility will emerge!`,
    whatIsGoingWrong: 'Designing reactively without anticipating architectural stress points forces expensive system rewrites later.',
    theSimpleIdea: 'Look for the "Axes of Change". Wherever business rules, 3rd party providers, or lifecycles are described as growing, design that boundary with an abstraction.',
    technicalWords: [
      { term: 'Axis of Change', explanation: 'A specific dimension along which requirements are expected to evolve.' },
      { term: 'Architectural Foresight', explanation: 'Designing hooks for anticipated changes without over-engineering.' }
    ],
    whyThisMattersInLLD: 'Senior engineers design systems that absorb new features with zero friction.',
    tryIt: 'Analyze a Ride-Sharing app prompt. Identify 3 axes of change (pricing, dispatch matching, notifications).',
    nowChangeTheRequirement: 'Surge pricing is introduced based on weather and demand.',
    whatDidTheChangeTeachUs: 'Because pricing was identified as an axis of change, surge pricing slotted in cleanly as a new pricing strategy.',
    canYouExplainIt: 'Can you explain how identifying what is likely to change helps you decide where to place interfaces?'
  })
};

// ============================================================================
// PRACTICAL DRILLS (14) — COMPLETE LEETCODE-STYLE SPECIFICATIONS
// ============================================================================

PHASE3_REWRITE['LLDP3-D3.1.1'] = {
  taskName: 'Dynamic Shipping Cost Engine Refactor',
  oneLineSummary: 'Refactor hardcoded carrier calculation conditionals into interchangeable rule objects.',
  taskDescription: formatDrillDescription({
    title: 'Dynamic Shipping Cost Calculation Drill',
    problemStatement: 'Refactor a `ShippingRateCalculator` that hardcodes carrier rules for FedEx, DHL, and Postal into interchangeable calculation rules, allowing new carriers and discounts to be plugged in at checkout without editing existing code.',
    contextScenario: 'An e-commerce checkout service must calculate shipping rates dynamically based on package weight and selected shipping carrier. Adding dynamic holiday discounts and overnight couriers has caused giant nested conditionals.',
    startingPoint: `Problematic Starting Implementation:
\`\`\`cpp
class ShippingCalculator {
public:
    int calculate(string carrier, int weightGrams) {
        if (carrier == "FEDEX") return 500 + weightGrams * 2;
        else if (carrier == "DHL") return 400 + weightGrams * 3;
        else if (carrier == "POSTAL") return 150 + weightGrams;
        throw invalid_argument("Unknown carrier");
    }
};
\`\`\``,
    yourTask: `1. Extract an interchangeable calculation interface: \`ShippingCostRule\` with \`virtual int calculate(int weightGrams) const = 0;\`.
2. Implement concrete rules for FedEx, DHL, and Postal.
3. Refactor \`CheckoutService\` to receive a \`ShippingCostRule\` pointer/reference and calculate shipping dynamically.
4. Add an \`OvernightCourierRule\` and verify zero modifications to \`CheckoutService\`.`,
    apiInterface: `class ShippingCostRule {
public:
    virtual ~ShippingCostRule() = default;
    virtual int calculate(int weightGrams) const = 0;
};

class CheckoutService {
public:
    int computeFinalTotal(int orderSubtotal, int weightGrams, const ShippingCostRule& shippingRule);
};`,
    inputInteractionModel: 'Pass chosen shipping rule into checkout calculation.',
    expectedBehavior: 'Computes correct total based on active shipping algorithm.',
    examples: 'Subtotal $50, Weight 1000g, FedEx ($5 + 1000*2 = $25) -> Total = $75.00.',
    constraintsAssumptions: 'Currency in integer cents. Weight in grams.',
    edgeCases: 'Negative weight throws std::invalid_argument.',
    acceptanceCriteria: [
      'Conditionals on carrier name are completely eliminated.',
      'New shipping algorithms can be introduced with zero edits to CheckoutService.'
    ],
    whatToObserve: 'Notice how CheckoutService no longer cares who the carrier is—it only invokes the rule.',
    thinkAbout: 'How does this structure make unit testing checkout discounts trivial?'
  })
};

PHASE3_REWRITE['LLDP3-D3.1.2'] = {
  taskName: 'Decoupled Order Event Broker',
  oneLineSummary: 'Broadcast order completion events to secondary listeners without OrderService holding direct dependencies.',
  taskDescription: formatDrillDescription({
    title: 'Decoupled Order Event Broadcasting Drill',
    problemStatement: 'Build an in-memory event broadcasting system where completing an order notifies Inventory, Email, and Analytics services without `OrderService` holding direct references to them.',
    contextScenario: 'An order processing pipeline crashes if the marketing analytics tracking service is slow or throws an error. Decouple order completion from secondary listeners.',
    startingPoint: 'Start from scratch. Define event listener interface and event manager.',
    yourTask: `1. Define \`OrderEventListener\` with \`virtual void onOrderPlaced(const Order& order) = 0;\`.
2. Implement listeners: \`InventoryListener\`, \`EmailListener\`, and \`AnalyticsListener\`.
3. Implement \`OrderEventManager\` allowing dynamic \`subscribe()\` and \`unsubscribe()\`.
4. Isolate errors: if one listener throws an exception during broadcast, log the error and continue notifying remaining listeners.`,
    apiInterface: `class OrderEventListener {
public:
    virtual ~OrderEventListener() = default;
    virtual void onOrderPlaced(const Order& order) = 0;
};

class OrderEventManager {
public:
    void subscribe(std::shared_ptr<OrderEventListener> listener);
    void unsubscribe(std::shared_ptr<OrderEventListener> listener);
    void notifyAll(const Order& order);
};`,
    inputInteractionModel: 'Register listeners, place order, and verify broadcast.',
    expectedBehavior: 'All subscribed listeners receive notification upon order completion.',
    examples: 'Order placed -> Inventory decrements, Email sends, Analytics logs.',
    constraintsAssumptions: 'In-memory observer registry.',
    edgeCases: 'Listener throwing exception must not block subsequent listeners.',
    acceptanceCriteria: [
      'OrderService depends only on OrderEventManager, not concrete listeners.',
      'Listeners can be added and removed dynamically at runtime.'
    ],
    whatToObserve: 'Notice how OrderService has zero knowledge of who is listening.',
    thinkAbout: 'What happens if a listener takes 10 seconds to process an event?'
  })
};

PHASE3_REWRITE['LLDP3-D3.1.3'] = {
  taskName: 'Document Workflow Lifecycle State Machine',
  oneLineSummary: 'Encapsulate document publishing states to eliminate sprawling status conditionals and illegal transitions.',
  taskDescription: formatDrillDescription({
    title: 'Document Workflow Lifecycle State Machine Drill',
    problemStatement: 'Refactor a document management system with statuses DRAFT, MODERATION_REVIEW, PUBLISHED, and ARCHIVED by modeling each status as a state object, eliminating nested status conditionals.',
    contextScenario: 'A publishing platform suffered data corruption when users edited documents after they were archived. The bug was traced to an incomplete `if (status == DRAFT)` check inside an update method.',
    startingPoint: 'Review the document class with enum status conditionals.',
    yourTask: `1. Extract \`DocumentState\` interface: \`edit()\`, \`submitForReview()\`, \`publish()\`, \`archive()\`.
2. Implement concrete states: \`DraftState\`, \`ReviewState\`, \`PublishedState\`, \`ArchivedState\`.
3. Disallowed operations (e.g. editing an Archived document) must throw an explicit \`IllegalStateOperationException\`.
4. Refactor \`Document\` to delegate all workflow actions to its current state object.`,
    apiInterface: `class DocumentState {
public:
    virtual ~DocumentState() = default;
    virtual void edit(Document& doc, const std::string& newText) = 0;
    virtual void submitForReview(Document& doc) = 0;
    virtual void publish(Document& doc) = 0;
    virtual void archive(Document& doc) = 0;
};

class Document {
public:
    void setState(std::unique_ptr<DocumentState> newState);
    void edit(const std::string& text);
    void publish();
    void archive();
};`,
    inputInteractionModel: 'Execute actions on Document across its lifecycle.',
    expectedBehavior: 'State transitions occur deterministically; invalid actions throw domain exceptions.',
    examples: 'Draft -> submitForReview() -> ReviewState. Calling publish() on Draft throws exception.',
    constraintsAssumptions: 'Explicit state transitions.',
    edgeCases: 'Attempting invalid transition throws IllegalStateOperationException.',
    acceptanceCriteria: [
      'Nested status conditionals completely removed.',
      'Illegal transitions safely rejected by state classes.'
    ],
    whatToObserve: 'Notice how each state class is self-contained and easy to reason about.',
    thinkAbout: 'How does this structure make adding a "Scheduled" state easy?'
  })
};

PHASE3_REWRITE['LLDP3-D3.1.4'] = {
  taskName: 'Transactional Undo/Redo Text Buffer Engine',
  oneLineSummary: 'Build an in-memory text editor buffer with full Undo and Redo capabilities by encapsulating operations as objects.',
  taskDescription: formatDrillDescription({
    title: 'Transactional Undo/Redo Engine Drill',
    problemStatement: 'Build an in-memory text editor engine with full Undo and Redo capabilities by encapsulating text modifications as executable and reversible command objects.',
    contextScenario: 'A collaborative document editor needs a rock-solid Undo/Redo engine. Saving full string snapshots after every keystroke exhausts memory. Implement command-based reversal.',
    startingPoint: 'Start from scratch. Create TextBuffer, Command interface, and CommandManager.',
    yourTask: `1. Implement \`TextBuffer\` storing characters.
2. Define \`Command\` interface with \`execute()\` and \`undo()\`.
3. Implement \`InsertTextCommand\` and \`DeleteTextCommand\`.
4. Implement \`CommandManager\` with undo and redo stacks.
5. Demonstrate inserting text, deleting text, undoing, and redoing.`,
    apiInterface: `class Command {
public:
    virtual ~Command() = default;
    virtual void execute() = 0;
    virtual void undo() = 0;
};

class CommandManager {
public:
    void executeCommand(std::shared_ptr<Command> cmd);
    void undo();
    void redo();
};`,
    inputInteractionModel: 'Dispatch commands through CommandManager and invoke undo/redo.',
    expectedBehavior: 'Undo reverses the exact effect of the previous command. Redo re-applies it.',
    examples: 'Type "Hello", Type " World", Undo -> Text is "Hello". Redo -> Text is "Hello World".',
    constraintsAssumptions: 'LIFO stacks for undo/redo.',
    edgeCases: 'Undoing on empty stack does nothing or throws exception. New command clears redo stack.',
    acceptanceCriteria: [
      'Reversible text modifications.',
      'Redo stack cleared on new command execution.'
    ],
    whatToObserve: 'Notice how storing the delta rather than full copies saves memory.',
    thinkAbout: 'How would you implement macro recording with this structure?'
  })
};

PHASE3_REWRITE['LLDP3-D3.1.5'] = {
  taskName: 'Extensible Request Filter Pipeline',
  oneLineSummary: 'Build an extensible request filtering pipeline where requests pass sequentially through validation filters.',
  taskDescription: formatDrillDescription({
    title: 'Extensible Request Filter Pipeline Drill',
    problemStatement: 'Build a request processing pipeline where incoming HTTP requests pass through Rate Limiting, Authentication, and Schema Validation filters before reaching the controller.',
    contextScenario: 'An API gateway handles sensitive financial transactions. Every request must be checked for rate limits, API keys, and valid JSON payloads. If any check fails, the request must halt immediately.',
    startingPoint: 'Start from scratch. Define RequestFilter interface and concrete filters.',
    yourTask: `1. Define \`RequestFilter\` with \`virtual bool handle(Request& req) = 0;\` and pointer to next filter.
2. Implement \`RateLimitFilter\`, \`AuthFilter\`, and \`ValidationFilter\`.
3. Chain filters: if a filter returns false, request processing terminates immediately with an error.
4. Verify that adding a \`CorsFilter\` requires zero changes to existing filters.`,
    apiInterface: `class RequestFilter {
protected:
    std::shared_ptr<RequestFilter> next;
public:
    virtual ~RequestFilter() = default;
    void setNext(std::shared_ptr<RequestFilter> nextFilter) { next = nextFilter; }
    virtual bool handle(Request& req) = 0;
};`,
    inputInteractionModel: 'Assemble pipeline chain and process incoming requests.',
    expectedBehavior: 'Valid request traverses entire pipeline. Invalid request stops at failing filter.',
    examples: 'Missing auth header rejected at AuthFilter; RateLimitFilter and ValidationFilter never run.',
    constraintsAssumptions: 'Sequential pipeline execution.',
    edgeCases: 'Empty request or unconfigured pipeline handles gracefully.',
    acceptanceCriteria: [
      'Filters pass to next or reject cleanly.',
      'Pipeline order easily configurable.'
    ],
    whatToObserve: 'Notice how each filter has a single responsibility.',
    thinkAbout: 'How does this structure compare to middleware in web frameworks?'
  })
};

PHASE3_REWRITE['LLDP3-D3.2.1'] = {
  taskName: 'Document Exporter Factory & HTTP Config Builder',
  oneLineSummary: 'Decouple document exporter instantiation using a factory method, and assemble client configurations cleanly.',
  taskDescription: formatDrillDescription({
    title: 'Document Exporter Factory Drill',
    problemStatement: 'Implement a `DocumentExporterFactory` that instantiates the correct exporter (PDF, CSV, JSON) based on format, and implement an `HttpClientConfigBuilder` for assembling network client settings without giant constructors.',
    contextScenario: 'Clients need to export reports in various formats without hardcoding concrete exporter classes, and configure complex HTTP clients without 10-parameter constructors.',
    startingPoint: 'Start from scratch. Implement Factory first, then Builder.',
    yourTask: `1. Implement \`DocumentExporterFactory\` creating \`PdfExporter\`, \`CsvExporter\`, and \`JsonExporter\` behind a common \`DocumentExporter\` interface.
2. Ensure new formats can be added to the factory registry with minimal friction.
3. Implement \`HttpClientConfigBuilder\` supporting fluent configuration: \`setBaseUrl()\`, \`setTimeoutMs()\`, \`setRetries()\`, and \`build()\`.
4. Verify validation on build (e.g. non-empty URL).`,
    apiInterface: `class DocumentExporterFactory {
public:
    static std::unique_ptr<DocumentExporter> create(const std::string& format);
};

class HttpClientConfigBuilder {
public:
    HttpClientConfigBuilder& setBaseUrl(const std::string& url);
    HttpClientConfigBuilder& setTimeoutMs(int timeout);
    HttpClientConfig build();
};`,
    inputInteractionModel: 'Instantiate exporters via factory and build configs via builder.',
    expectedBehavior: 'Factory returns correct type; Builder returns validated immutable config.',
    examples: 'builder.setBaseUrl("https://api.com").setTimeoutMs(5000).build();',
    constraintsAssumptions: 'C++ fluent API returning *this.',
    edgeCases: 'Invalid format in factory throws UnknownFormatException.',
    acceptanceCriteria: [
      'Factory hides concrete class construction.',
      'Builder validates required fields on build.'
    ],
    whatToObserve: 'Notice how readable builder configuration is compared to giant constructors.',
    thinkAbout: 'When should a constructor be private and only accessible to a Builder?'
  })
};

PHASE3_REWRITE['LLDP3-D3.2.2'] = {
  taskName: 'Dynamic Beverage Addons & Legacy Payment Bridge',
  oneLineSummary: 'Stack dynamic beverage add-ons using wrapper objects, and adapt legacy SDK interfaces to modern standards.',
  taskDescription: formatDrillDescription({
    title: 'Dynamic Beverage Addons Drill',
    problemStatement: 'Implement a dynamic beverage add-on calculator by wrapping beverage objects to add milk and caramel, and adapt an old banking SDK behind a modern payment gateway interface.',
    contextScenario: 'A coffee shop orders customizable drinks with dynamic add-ons (Milk, Caramel), and integrates an old banking SDK whose method names do not match the company standard.',
    startingPoint: 'Start from scratch. Implement Beverage Decorator, then Payment Adapter.',
    yourTask: `1. Implement \`Beverage\` interface with \`getCostCents()\` and \`getDescription()\`.
2. Implement base \`Espresso\` ($2.00) and wrapper decorators: \`MilkDecorator\` (+$0.50), \`CaramelDecorator\` (+$0.75).
3. Demonstrate chaining multiple decorators: Espresso + Milk + Caramel = $3.25.
4. Wrap legacy \`OldBankSdk\` (having \`doTransaction(double amt)\`) behind modern \`PaymentGateway\` (having \`pay(int cents)\`).`,
    apiInterface: `class Beverage { public: virtual ~Beverage() = default; virtual int getCostCents() const = 0; virtual std::string getDescription() const = 0; };
class PaymentGateway { public: virtual ~PaymentGateway() = default; virtual void pay(int cents) = 0; };`,
    inputInteractionModel: 'Wrap beverages and pass adapted payment gateway to checkout.',
    expectedBehavior: 'Beverage cost sums decorators correctly. Adapter translates calls seamlessly.',
    examples: 'Espresso + Milk + Caramel = $3.25.',
    constraintsAssumptions: 'Costs in integer cents.',
    edgeCases: 'Zero-cost add-ons or multiple layers of same add-on (Double Milk).',
    acceptanceCriteria: [
      'Decorator keeps identical interface.',
      'Adapter translates incompatible interface.'
    ],
    whatToObserve: 'Notice how both patterns wrap objects, but with completely different intents.',
    thinkAbout: 'Can you stack 5 decorators around a single object?'
  })
};

PHASE3_REWRITE['LLDP3-D3.2.3'] = {
  taskName: 'In-Memory FileSystem Tree Hierarchy',
  oneLineSummary: 'Treat individual files and composite directory trees uniformly for recursive size calculations.',
  taskDescription: formatDrillDescription({
    title: 'In-Memory FileSystem Tree Hierarchy Drill',
    problemStatement: 'Implement an in-memory FileSystem tree where `File` (leaf) and `Directory` (composite) implement the same interface, allowing uniform size calculation and recursive search.',
    contextScenario: 'A cloud storage desktop client needs to calculate total folder sizes and print directory trees without checking whether each item is a file or a folder.',
    startingPoint: 'Start from scratch. Create FileSystemItem, File, and Directory.',
    yourTask: `1. Define \`FileSystemItem\` with \`virtual int getSize() const = 0;\` and \`virtual void print(int indent) const = 0;\`.
2. Implement \`File\` returning its own byte size.
3. Implement \`Directory\` maintaining child items and returning the sum of children sizes.
4. Demonstrate creating a deep nested folder tree and computing total size with a single call.`,
    apiInterface: `class FileSystemItem {
public:
    virtual ~FileSystemItem() = default;
    virtual std::string getName() const = 0;
    virtual int getSize() const = 0;
};

class Directory : public FileSystemItem {
private:
    std::vector<std::shared_ptr<FileSystemItem>> children;
public:
    void add(std::shared_ptr<FileSystemItem> item);
    int getSize() const override;
};`,
    inputInteractionModel: 'Add files and directories to root and query total size.',
    expectedBehavior: 'Recursively calculates total size across all nested folders uniformly.',
    examples: 'Root folder containing 2MB file and subfolder (3MB) returns 5MB.',
    constraintsAssumptions: 'Tree structure with no circular cycles.',
    edgeCases: 'Empty directory returns size 0.',
    acceptanceCriteria: [
      'Files and Directories treated uniformly.',
      'Recursive calculations work accurately.'
    ],
    whatToObserve: 'Notice how calling code never has to check instanceof or write recursive loops.',
    thinkAbout: 'How would you implement file search across the entire composite tree?'
  })
};

PHASE3_REWRITE['LLDP3-D3.3.1'] = {
  taskName: 'Proxy, Facade & Template Method Implementation Drill',
  oneLineSummary: 'Implement lazy image loading via proxy and simplify subsystem startup with a facade.',
  taskDescription: formatDrillDescription({
    title: 'Lazy Image Proxy & Computer Subsystem Facade Drill',
    problemStatement: 'Implement a lazy-loading `ImageProxy` that delays loading heavy image bytes from disk until displayed, and a `ComputerFacade` for coordinating subsystem startup.',
    contextScenario: 'Large desktop applications require fast startup (lazy image loading) and simple APIs for complex subsystems like CPU, RAM, and storage (Facade).',
    startingPoint: 'Start from scratch. Implement ImageProxy and ComputerFacade.',
    yourTask: `1. Implement \`ImageProxy\` that delays loading heavy image bytes from disk until \`display()\` is called.
2. Implement \`ComputerFacade\` with \`start()\` that initializes CPU, RAM, and HardDrive in the correct startup sequence.
3. Contrast with Template Method: analyze how a standardized parsing skeleton coordinates fixed algorithm steps.`,
    apiInterface: `class Image { public: virtual ~Image() = default; virtual void display() = 0; };
class ImageProxy : public Image { ... };
class ComputerFacade { public: void start(); };`,
    inputInteractionModel: 'Call display on proxy, start on facade, and mine on parser subclasses.',
    expectedBehavior: 'Proxy loads lazily; Facade coordinates startup; Template method enforces pipeline sequence.',
    examples: 'ImageProxy loads disk file only upon display() call.',
    constraintsAssumptions: 'Standard C++17.',
    edgeCases: 'Multiple display calls on proxy load file only once (caching).',
    acceptanceCriteria: [
      'All 3 patterns implemented cleanly with correct semantics.',
      'Lazy loading verified in unit test.'
    ],
    whatToObserve: 'Notice how each pattern solves a different architectural problem.',
    thinkAbout: 'How does Template Method enforce rules that subclasses cannot bypass?'
  })
};

PHASE3_REWRITE['LLDP3-D3.3.2'] = {
  taskName: 'Singleton Antipattern & Thread Safety Refactor',
  taskDescription: formatDrillDescription({
    title: 'Refactoring Singleton Global State to Dependency Injection',
    problemStatement: 'Analyze a buggy, thread-unsafe Singleton `ConfigurationManager` that causes race conditions and test failures, fix its thread safety (Meyers Singleton), and then refactor it away using Dependency Injection.',
    contextScenario: 'Parallel unit tests fail randomly because they all mutate a single global `DatabaseConfig` singleton. Refactor the codebase to eliminate the global trap.',
    startingPoint: `Flawed Singleton:
\`\`\`cpp
class ConfigManager {
    static ConfigManager* instance;
public:
    static ConfigManager* getInstance() {
        if (!instance) instance = new ConfigManager(); // Race condition!
        return instance;
    }
};
\`\`\``,
    yourTask: `1. Identify the race condition in the classic pointer singleton.
2. Implement thread-safe Meyers Singleton (\`static ConfigManager instance;\`).
3. Refactor calling classes to accept \`const ConfigManager&\` in constructors instead of calling \`getInstance()\`.
4. Run parallel tests verifying isolated configurations.`,
    apiInterface: `class ConfigManager {
public:
    static ConfigManager& getInstance(); // Thread-safe Meyers Singleton
};`,
    inputInteractionModel: 'Inject config instances into services.',
    expectedBehavior: 'Thread-safe initialization and full test isolation.',
    examples: 'Test A and Test B run simultaneously with different config objects without interference.',
    constraintsAssumptions: 'Thread-safe execution.',
    edgeCases: 'Concurrent first-time initialization.',
    acceptanceCriteria: [
      'Race condition eliminated.',
      'Services decoupled from global singleton access.'
    ],
    whatToObserve: 'Notice how constructor injection makes parallel testing instant and reliable.',
    thinkAbout: 'Why is global state considered an anti-pattern in modern software design?'
  })
};

PHASE3_REWRITE['LLDP3-D3.3.3'] = {
  taskName: 'Specialized GoF Patterns Comparison Drill',
  taskDescription: formatDrillDescription({
    title: 'Specialized Patterns: Flyweight & Mediator Implementation',
    problemStatement: 'Implement a memory-optimized `Forest` rendering 100,000 trees using shared `TreeType` flyweights, and a `ChatRoomMediator` where users send messages without referencing each other directly.',
    contextScenario: 'A game crashes with out-of-memory when rendering large forests, and an in-game chat system causes circular dependencies when players message each other directly.',
    startingPoint: 'Start from scratch. Implement Flyweight and Mediator.',
    yourTask: `1. Implement \`TreeType\` (holds heavy texture name and color) as a shared Flyweight.
2. Implement \`Tree\` holding only (x, y) coordinates and a shared pointer to \`TreeType\`.
3. Implement \`ChatRoomMediator\` coordinating messages between \`User\` objects.`,
    apiInterface: `class TreeType { std::string name; std::string textureData; };
class Tree { int x, y; std::shared_ptr<TreeType> type; };
class ChatMediator { public: virtual void sendMessage(const std::string& msg, int senderId) = 0; };`,
    inputInteractionModel: 'Instantiate 100,000 trees and send messages via chat mediator.',
    expectedBehavior: 'Tree instances share a single TreeType object. Chat mediator broadcasts messages without circular references.',
    examples: '100,000 trees reference only 2 TreeType objects in memory.',
    constraintsAssumptions: 'Memory efficiency demonstration.',
    edgeCases: 'User sending message to chatroom with zero participants.',
    acceptanceCriteria: [
      'Flyweight shares heavy state.',
      'Mediator eliminates direct peer-to-peer coupling.'
    ],
    whatToObserve: 'Notice how memory consumption drops from megabytes to kilobytes with Flyweight.',
    thinkAbout: 'How does Mediator prevent tangled spider-web dependencies?'
  })
};

PHASE3_REWRITE['LLDP3-D3.4.1'] = {
  taskName: 'Strategy vs State Discrimination Decision Drill',
  taskDescription: formatDrillDescription({
    title: 'Strategy vs State Architectural Decision Drill',
    problemStatement: 'Given two feature requests—a dynamic discounts calculator and an ATM user session tracker—accurately identify which requires Strategy and which requires State, and defend your choice in an interview format.',
    contextScenario: 'Candidates frequently mix up Strategy and State because both use interface delegation. You must articulate the difference and implement the correct structure for each.',
    startingPoint: 'Review the two feature requirements.',
    yourTask: `1. Implement Discount Calculator using Strategy (caller selects algorithm from outside).
2. Implement ATM Session using State (system transitions its own states from the inside).
3. Write a 4-bullet point interview defense explaining the distinction.`,
    apiInterface: `class IDiscountStrategy { ... };
class IAtmState { ... };`,
    inputInteractionModel: 'Execute both implementations and compare control flow.',
    expectedBehavior: 'Strategy algorithms do not know about each other; State classes drive transitions.',
    examples: 'Discount strategy swapped at checkout; ATM transitions itself from PinEntered to Dispensing.',
    constraintsAssumptions: 'Clean object-oriented modeling.',
    edgeCases: 'Illegal state transition throws exception.',
    acceptanceCriteria: [
      'Correct pattern chosen and implemented for each scenario.',
      'Clear verbal defense articulated.'
    ],
    whatToObserve: 'Notice who drives the change: client (Strategy) vs internal state machine (State).',
    thinkAbout: 'Can a State pattern also use Strategy patterns internally?'
  })
};

PHASE3_REWRITE['LLDP3-D3.4.2'] = {
  taskName: 'Decorator vs Adapter vs Proxy Decision Drill',
  taskDescription: formatDrillDescription({
    title: 'Decorator vs Adapter vs Proxy Decision Drill',
    problemStatement: 'Analyze 3 real-world wrapper requirements—adding caching to an API client, integrating a third-party SMS SDK, and adding encryption to a stream—and implement the exact matching pattern for each.',
    contextScenario: 'An interviewer asks: "All three patterns wrap an object. Why did you call this an Adapter instead of a Proxy?" You must demonstrate exact knowledge of intent.',
    startingPoint: 'Review the three wrapper scenarios.',
    yourTask: `1. Implement Caching Wrapper as a Proxy (same interface, controls execution).
2. Implement SMS SDK Wrapper as an Adapter (translates different interface).
3. Implement Stream Encryption as a Decorator (same interface, enhances behavior).
4. Explain how interface matching and behavioral intent determine the pattern.`,
    apiInterface: `// Scenarios:
// 1. ApiClientProxy (Proxy)
// 2. ThirdPartySmsAdapter (Adapter)
// 3. EncryptedStreamDecorator (Decorator)`,
    inputInteractionModel: 'Test each wrapper against client expectations.',
    expectedBehavior: 'Each wrapper fulfills its distinct design goal.',
    examples: 'Proxy caches responses; Adapter bridges methods; Decorator encrypts bytes.',
    constraintsAssumptions: 'Standard C++.',
    edgeCases: 'Cache misses in proxy pass through to real client.',
    acceptanceCriteria: [
      'All 3 patterns implemented with correct semantic intent.',
      'Clear distinction articulated.'
    ],
    whatToObserve: 'Notice how interface compatibility defines Adapter, while intent defines Proxy vs Decorator.',
    thinkAbout: 'Can you wrap a Decorator inside a Proxy?'
  })
};

PHASE3_REWRITE['LLDP3-D3.4.3'] = {
  taskName: 'E-Commerce Architecture Pattern Prediction Exercise',
  taskDescription: formatDrillDescription({
    title: 'E-Commerce Architecture Pattern Prediction Exercise',
    problemStatement: 'Read an end-to-end e-commerce system specification and predict where Strategy, Observer, State, Factory, and Composite patterns will naturally emerge as scale increases.',
    contextScenario: 'In a staff engineer system design interview, you are given an open-ended prompt. You must proactively identify axes of change and structure the design so patterns emerge naturally.',
    startingPoint: 'Read the comprehensive e-commerce prompt.',
    yourTask: `1. Identify the 5 axes of change (pricing, notifications, order lifecycle, catalog categories, payment gateways).
2. Map each axis to its corresponding GoF pattern.
3. Implement a clean skeletal architecture proving that all 5 patterns integrate harmoniously.`,
    apiInterface: `class ECommercePlatform {
    // Coordinated architecture integrating Strategy, Observer, State, Factory, Composite
};`,
    inputInteractionModel: 'Simulate order placement, payment, and category browsing.',
    expectedBehavior: 'All patterns work together with zero architectural friction.',
    examples: 'Category tree (Composite) -> Pricing (Strategy) -> Order (State) -> Notification (Observer).',
    constraintsAssumptions: 'Clean modular domain design.',
    edgeCases: 'Order cancellation during payment processing.',
    acceptanceCriteria: [
      'Accurate prediction and integration of all 5 patterns.',
      'Zero unnecessary or forced abstractions.'
    ],
    whatToObserve: 'Notice how patterns emerge naturally from business pain, not from memorization.',
    thinkAbout: 'How do you know when NOT to add another design pattern?'
  })
};

// ============================================================================
// MAJOR PROBLEMS (4) & VERSIONS (21)
// ============================================================================

// Problem 8: Elevator System (P1)
PHASE3_REWRITE['LLDP3-P1'] = {
  taskName: 'Problem 8 — Design an Elevator Control System',
  taskDescription: formatMajorProblemDescription({
    contextScenario: 'Design an automated elevator control system for a high-rise office building managing multiple elevator cars, floor hall calls (Up/Down), internal car destination buttons, and real-time scheduling algorithms.',
    functionalRequirements: [
      'Multi-Car Topology: 20 floors, 3 elevator cars.',
      'Hall Calls: Passenger at floor F presses UP or DOWN.',
      'Car Calls: Passenger inside car C presses destination floor D.',
      'LOOK / SCAN Algorithm: Serve requests in current direction before reversing.',
      'Door Safety & Capacity: Prevent movement while doors are open; sound alarm if weight limit exceeded.'
    ],
    operationsApi: [
      'void pressHallButton(int floor, Direction direction);',
      'void pressCarButton(int carId, int destinationFloor);',
      'void stepSimulation();',
      'ElevatorStatus getCarStatus(int carId) const;'
    ],
    expectedBehavior: 'Elevator cars move towards assigned floors, stop, open doors, let passengers board, and reverse direction only when no further requests exist ahead.',
    examplesScenarios: `Scenario 1: Hall Call Assignment
Car 1 at Floor 2 moving UP.
Passenger on Floor 4 presses UP.
Dispatcher assigns call to Car 1. Car 1 stops at Floor 4.`,
    constraintsAssumptions: ['Floors 1-20.', 'Discrete simulation ticks.'],
    edgeCasesErrorHandling: ['Pressing current floor opens doors immediately.', 'Overweight stops door closing.'],
    stateLifecycleRules: 'Car states: IDLE, MOVING_UP, MOVING_DOWN, DOORS_OPEN.',
    acceptanceCriteria: ['LOOK algorithm implemented correctly.', 'All calls served without starvation.'],
    whatYouNeedToImplement: 'Implement ElevatorCar, Dispatcher, HallCall, and ElevatorSystem classes in C++.'
  })
};

PHASE3_REWRITE['LLDP3-P1-V1'] = {
  taskName: 'Version 1: Single Car Baseline',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Baseline single car serving sequential destination requests.',
    whyOldDesignStruggles: 'N/A — initial baseline.',
    newRequirements: ['Single car serving Floors 1-10.', 'FIFO request queue.'],
    observableBehavior: 'Car moves floor-by-floor to destinations in order.',
    examples: 'Press 3, then 7 -> Car moves 1 -> 3 -> 7.',
    acceptanceCriteria: ['Car stops at requested floors.']
  })
};

PHASE3_REWRITE['LLDP3-P1-V2'] = {
  taskName: 'Version 2: LOOK & SCAN Scheduling Algorithms',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Replaced FIFO with LOOK algorithm to eliminate elevator thrashing.',
    whyOldDesignStruggles: 'FIFO causes long wait times and excessive motor wear.',
    newRequirements: ['Serve all requests in travel direction first.', 'Reverse only when no requests remain ahead.'],
    observableBehavior: 'Car moving UP from 2 to 8 stops at 5 along the way.',
    examples: 'Requests: 8, 3, 5 -> Serves 3, then 5, then 8.',
    acceptanceCriteria: ['LOOK algorithm strictly enforced.']
  })
};

PHASE3_REWRITE['LLDP3-P1-V3'] = {
  taskName: 'Version 3: Multi-Car Bank Controller',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added 3 elevator cars and a centralized dispatcher.',
    whyOldDesignStruggles: 'Multiple cars without a dispatcher all chase the same hall call.',
    newRequirements: ['3 elevator cars.', 'Dispatcher selects best car based on distance and direction.'],
    observableBehavior: 'Call on Floor 6 assigned to nearest car moving UP.',
    examples: 'Car 1 at Floor 4 moving UP gets assigned call at Floor 6.',
    acceptanceCriteria: ['Dispatcher minimizes total wait time.']
  })
};

PHASE3_REWRITE['LLDP3-P1-V4'] = {
  taskName: 'Version 4: Door Obstruction & Weight Invariants',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added infrared door obstruction sensors and weight scale alarms.',
    whyOldDesignStruggles: 'Safety systems must override elevator movement.',
    newRequirements: ['Door obstruction re-opens doors.', 'Overweight prevents car from moving.'],
    observableBehavior: 'Door sensor obstruction holds doors open.',
    examples: 'Obstruction detected -> Doors reopen for 5 seconds.',
    acceptanceCriteria: ['Safety interlocks prevent car movement with open doors.']
  })
};

PHASE3_REWRITE['LLDP3-P1-V5'] = {
  taskName: 'Version 5: Requirement Change — VIP & Maintenance Modes',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added VIP priority service and maintenance lockout mode.',
    whyOldDesignStruggles: 'Hardcoded scheduling algorithms cannot accommodate priority overrides.',
    newRequirements: ['VIP call overrides normal queue and directs car immediately to VIP floor.', 'Maintenance mode takes car out of service.'],
    observableBehavior: 'VIP call preempts pending hall calls.',
    examples: 'VIP button at Penthouse brings Car 1 directly to Floor 20.',
    acceptanceCriteria: ['Priority overrides work deterministically.']
  })
};

PHASE3_REWRITE['LLDP3-P1-V6'] = {
  taskName: 'Version 6: Design Review & Invariant Audit',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Final architectural review of Elevator System.',
    whyOldDesignStruggles: 'Validates scheduling, safety, and multi-car concurrency.',
    newRequirements: ['Comprehensive 100-passenger morning rush hour simulation.'],
    observableBehavior: 'All passengers reach destinations with zero starvation.',
    examples: '100% test pass across rush hour scenarios.',
    acceptanceCriteria: ['Clean separation between Dispatcher, Car, and Scheduling algorithm.'],
    designReviewNote: 'In post-attempt review: observe how separating the scheduling policy from the elevator car mechanics made implementing the LOOK algorithm straightforward.'
  })
};

// Problem 9: Splitwise (P2)
PHASE3_REWRITE['LLDP3-P2'] = {
  taskName: 'Problem 9 — Design Splitwise',
  taskDescription: formatMajorProblemDescription({
    contextScenario: 'Design an expense-sharing application like Splitwise where users can record shared expenses among friends or groups, support multiple split types (Equal, Exact, Percentage), track balances, and simplify group debts.',
    functionalRequirements: [
      'User & Group Management: Register users and create expense groups.',
      'Expense Creation: Support splits: EQUAL, EXACT amounts, and PERCENTAGE.',
      'Balance Ledger: Track who owes whom across all transactions.',
      'Debt Simplification: Minimize total cash transactions required to settle group debts using graph algorithms.'
    ],
    operationsApi: [
      'Expense addExpense(const std::string& paidBy, int totalCents, const std::vector<Split>& splits);',
      'std::map<std::string, int> getUserBalances(const std::string& userId) const;',
      'std::vector<Transaction> simplifyGroupDebts(const std::string& groupId);'
    ],
    expectedBehavior: 'Adding an expense updates pairwise balances. If A owes B $10 and B owes C $10, debt simplification resolves it to A owes C $10.',
    examplesScenarios: `Scenario 1: Equal Split
User A pays $30 for A, B, C.
Result: B owes A $10, C owes A $10.`,
    constraintsAssumptions: ['Currency in integer cents.', 'Split sums must equal total expense amount.'],
    edgeCasesErrorHandling: ['Percentage split not summing to 100% throws InvalidSplitException.', 'Rounding 1 cent drift assigned to first payee.'],
    stateLifecycleRules: 'Expenses are immutable once created.',
    acceptanceCriteria: ['Pairwise balance consistency.', 'Debt simplification minimizes total transaction count.'],
    whatYouNeedToImplement: 'Implement User, Group, Expense, SplitStrategy, and SplitwiseService classes in C++.'
  })
};

PHASE3_REWRITE['LLDP3-P2-V1'] = {
  taskName: 'Version 1: User & Group Foundation',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Baseline user management and equal expense splits.',
    whyOldDesignStruggles: 'N/A — initial baseline.',
    newRequirements: ['Create users and groups.', 'Split expense equally among N participants.'],
    observableBehavior: 'Splits $60 among 3 users as $20 each.',
    examples: 'Alice pays $60 for Alice, Bob, Charlie -> Bob owes $20, Charlie owes $20.',
    acceptanceCriteria: ['Balances update accurately.']
  })
};

PHASE3_REWRITE['LLDP3-P2-V2'] = {
  taskName: 'Version 2: Pluggable Split Strategies',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Support Exact amounts ($10, $20, $30) and Percentage splits (20%, 30%, 50%).',
    whyOldDesignStruggles: 'Hardcoded equal split cannot handle unequal shares.',
    newRequirements: ['Support EXACT and PERCENT split rules.', 'Validate that total matches expense amount.'],
    observableBehavior: 'Percent split validates that percentages sum to 100%.',
    examples: 'Split $100 (50%, 50%) -> $50 each.',
    acceptanceCriteria: ['Validates split total before saving.']
  })
};

PHASE3_REWRITE['LLDP3-P2-V3'] = {
  taskName: 'Version 3: Rounding & Currency Invariants',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Handle 1-cent rounding drift when splitting odd amounts (e.g. $100 / 3 = 33.33 + 33.33 + 33.34).',
    whyOldDesignStruggles: 'Floating point division loses cents and causes accounting errors.',
    newRequirements: ['All calculations in integer cents.', 'Distribute remainder cents deterministically to first payer.'],
    observableBehavior: '$100.00 split 3 ways yields 3334¢, 3333¢, 3333¢.',
    examples: 'Sum of splits always equals total cents exactly.',
    acceptanceCriteria: ['Zero lost cents.']
  })
};

PHASE3_REWRITE['LLDP3-P2-V4'] = {
  taskName: 'Version 4: Debt Simplification Graph Algorithm',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Implemented debt simplification to minimize total number of settlement transactions.',
    whyOldDesignStruggles: 'Circular debts (A owes B, B owes C, C owes A) cause unnecessary payments.',
    newRequirements: ['Calculate net balance per user.', 'Use greedy min-heap/max-heap graph simplification algorithm.'],
    observableBehavior: 'Reduces 5 circular debts to 2 direct settlements.',
    examples: 'A owes B $10, B owes C $10 -> Simplified: A owes C $10.',
    acceptanceCriteria: ['Net balances preserved while minimizing transaction count.']
  })
};

PHASE3_REWRITE['LLDP3-P2-V5'] = {
  taskName: 'Version 5: Requirement Change — Multi-Currency & Activity Feed',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added multi-currency expenses (USD, EUR, INR) and user activity feed.',
    whyOldDesignStruggles: 'Mixing currencies without an exchange rate or separate ledgers corrupts totals.',
    newRequirements: ['Maintain separate balance ledgers per currency.', 'Log all expense events to activity feed.'],
    observableBehavior: 'Balances tracked separately: "Bob owes Alice $10 USD and 500 INR".',
    examples: 'Activity feed shows formatted history of all expense events.',
    acceptanceCriteria: ['Zero cross-currency invalid arithmetic.']
  })
};

PHASE3_REWRITE['LLDP3-P2-V6'] = {
  taskName: 'Version 6: Design Review & Invariant Audit',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Final architectural review of Splitwise system.',
    whyOldDesignStruggles: 'Validates debt simplification and financial invariants.',
    newRequirements: ['Full integration test suite covering 10-user group with 50 mixed expenses and settlement.'],
    observableBehavior: 'Net group balance always equals zero.',
    examples: '100% test pass on debt simplification.',
    acceptanceCriteria: ['Clean separation between SplitStrategy, BalanceLedger, and GraphSimplifier.'],
    designReviewNote: 'In post-attempt review: examine how the Strategy pattern allowed adding Exact and Percent splits without modifying expense persistence.'
  })
};

// Problem 10: Snake & Ladder (P3)
PHASE3_REWRITE['LLDP3-P3'] = {
  taskName: 'Problem 10 — Design Snake & Ladder',
  taskDescription: formatMajorProblemDescription({
    contextScenario: 'Design an extensible in-memory board game engine for Snake & Ladder supporting customizable board sizes, snakes, ladders, obstacle entities, and dice mechanics.',
    functionalRequirements: [
      'Board Configuration: Board of size N (default 100 cells).',
      'Jump Entities: Snakes (move backward from head to tail) and Ladders (move forward from bottom to top).',
      'Multi-Player Turns: M players rolling dice in round-robin sequence.',
      'Game Win Condition: First player to land exactly on cell N wins.'
    ],
    operationsApi: [
      'void initializeGame(int boardSize, const std::vector<Snake>& snakes, const std::vector<Ladder>& ladders, const std::vector<Player>& players);',
      'TurnResult playTurn();',
      'bool isGameOver() const;'
    ],
    expectedBehavior: 'Player rolls dice, moves forward, triggers snake or ladder if landing on jump head/bottom, and checks for win.',
    examplesScenarios: `Scenario 1: Ladder Climb
Player at cell 4 rolls 4 -> Lands on 8.
Ladder at 8 leads to 26 -> Player advances to 26.`,
    constraintsAssumptions: ['Snakes cannot have head at 100; Ladders cannot have bottom at 100.', 'No infinite loops (snake head at ladder top).'],
    edgeCasesErrorHandling: ['Roll exceeding 100 does not move player (must land exactly on 100).'],
    stateLifecycleRules: 'Game states: INITIALIZING -> ACTIVE -> COMPLETED.',
    acceptanceCriteria: ['Correct jump mechanics.', 'Exact landing win condition enforced.'],
    whatYouNeedToImplement: 'Implement Board, JumpEntity, Snake, Ladder, Dice, and GameEngine classes in C++.'
  })
};

PHASE3_REWRITE['LLDP3-P10-V1'] = {
  taskName: 'Version 1: Classic Board & Movement',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Baseline 100-cell board with fixed snakes and ladders.',
    whyOldDesignStruggles: 'N/A — initial baseline.',
    newRequirements: ['100-cell board.', 'Snakes and ladders move players.', 'First to 100 wins.'],
    observableBehavior: 'Player moves by dice roll; lands on snake tail or ladder top.',
    examples: 'Land on 14 (ladder to 48) -> Position becomes 48.',
    acceptanceCriteria: ['Snakes slide down; ladders climb up.']
  })
};

PHASE3_REWRITE['LLDP3-P10-V2'] = {
  taskName: 'Version 2: Extensible Jump Entities',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Support customizable jump obstacles (e.g. Trampoline, Pit, Portal) beyond snakes and ladders.',
    whyOldDesignStruggles: 'Hardcoded `if (isSnake)` checks prevent adding new obstacle types.',
    newRequirements: ['Abstract `JumpEntity` with `virtual int getDestination(int current) = 0;\`.', 'Support custom obstacles.'],
    observableBehavior: 'Landing on Trampoline moves player forward 10 cells.',
    examples: 'Portal transports player to linked portal cell.',
    acceptanceCriteria: ['New jump entities integrate polymorphically.']
  })
};

PHASE3_REWRITE['LLDP3-P10-V3'] = {
  taskName: 'Version 3: Requirement Change — Multiple Dice & Turn Rules',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Support rolling 2 or more dice, and rolling a 6 grants a bonus turn.',
    whyOldDesignStruggles: 'Single-die assumption hardcoded into turn engine.',
    newRequirements: ['Configurable number of dice.', 'Rolling maximum number on all dice grants bonus turn (up to 3 consecutive times).'],
    observableBehavior: 'Rolling a 6 allows rolling again; rolling three 6s cancels bonus.',
    examples: 'Roll 6 -> Moves 6, rolls again.',
    acceptanceCriteria: ['Bonus turn rules enforced.']
  })
};

PHASE3_REWRITE['LLDP3-P10-V4'] = {
  taskName: 'Version 4: Design Review & Invariant Audit',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Architectural review and simulation of complete Snake & Ladder game.',
    whyOldDesignStruggles: 'Validates cycle prevention and exact-win boundaries.',
    newRequirements: ['Full simulation test verifying game termination and loop prevention.'],
    observableBehavior: 'Game always terminates with a clear winner.',
    examples: '100% test pass across 1,000 simulated games.',
    acceptanceCriteria: ['Clean separation between Board, JumpEntities, and GameLoop.'],
    designReviewNote: 'In post-attempt review: examine how the Composite/Polymorphic JumpEntity hierarchy allowed adding Portals and Trampolines without changing board logic.'
  })
};

// Problem 11: Multi-Channel Notification Engine (P4)
PHASE3_REWRITE['LLDP3-P4'] = {
  taskName: 'Problem 11 — Design a Multi-Channel Notification Engine',
  taskDescription: formatMajorProblemDescription({
    contextScenario: 'Design an enterprise-grade multi-channel notification engine that delivers messages via Email, SMS, Push Notification, and Slack with template rendering, rate limiting, and vendor failover.',
    functionalRequirements: [
      'Multi-Channel Delivery: Support Email, SMS, Mobile Push, and Slack.',
      'Template Rendering: Merge dynamic payload data into message templates.',
      'Rate Limiting & Throttling: Enforce per-user notification limits to prevent spam.',
      'Provider Failover: If primary vendor (e.g. Twilio) fails, automatically failover to secondary vendor (e.g. MessageBird).'
    ],
    operationsApi: [
      'void sendNotification(const NotificationRequest& request);',
      'void registerChannel(ChannelType type, std::shared_ptr<NotificationChannel> channel);',
      'void setRateLimit(int maxPerHour);'
    ],
    expectedBehavior: 'Merges template, applies rate limit, selects provider, and delivers message. Fails over automatically on provider error.',
    examplesScenarios: `Scenario 1: Email Dispatch
Send "WELCOME" template to user with name="Alice".
Renders: "Welcome Alice!", delivers via Email.`,
    constraintsAssumptions: ['In-memory execution with mock provider gateways.'],
    edgeCasesErrorHandling: ['Exceeding hourly rate limit drops message or queues for later delivery.', 'Provider timeout triggers automatic retry and failover.'],
    stateLifecycleRules: 'Notification status: CREATED -> VALIDATED -> SENT (or FAILED).',
    acceptanceCriteria: ['Delivery across all channels verified.', 'Automatic failover on vendor failure.'],
    whatYouNeedToImplement: 'Implement NotificationService, TemplateEngine, ChannelProvider, and FailoverHandler in C++.'
  })
};

PHASE3_REWRITE['LLDP3-P11-V1'] = {
  taskName: 'Version 1: Basic Multi-Channel Dispatch',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Baseline multi-channel dispatcher supporting Email and SMS.',
    whyOldDesignStruggles: 'N/A — initial baseline.',
    newRequirements: ['Support Email and SMS channels.', 'Dispatch simple text messages.'],
    observableBehavior: 'Message delivered to target channel.',
    examples: 'Send Email to alice@example.com -> Dispatched.',
    acceptanceCriteria: ['Email and SMS delivery operational.']
  })
};

PHASE3_REWRITE['LLDP3-P11-V2'] = {
  taskName: 'Version 2: Template & Formatting Decorators',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added template rendering and message decorators (e.g. footer disclaimer, link tracking).',
    whyOldDesignStruggles: 'Hardcoding HTML or text templates inside sender classes pollutes delivery logic.',
    newRequirements: ['Render dynamic variables into template placeholders.', 'Wrap messages with formatting decorators.'],
    observableBehavior: 'Template "Hello {name}" renders "Hello Bob".',
    examples: 'Decorator appends "Unsubscribe" footer to all marketing emails.',
    acceptanceCriteria: ['Template rendering decoupled from channel delivery.']
  })
};

PHASE3_REWRITE['LLDP3-P11-V3'] = {
  taskName: 'Version 3: Rate Limiting & Filter Pipeline',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added rate limiting to prevent spamming users (max 5 notifications per hour).',
    whyOldDesignStruggles: 'Without rate limiting, runaway batch jobs flood users with notifications.',
    newRequirements: ['Enforce max 5 notifications per recipient per hour.', 'Chain rate limiter as a pre-send filter.'],
    observableBehavior: '6th notification within an hour is throttled.',
    examples: 'Drop or queue notifications exceeding rate limit.',
    acceptanceCriteria: ['Rate limiting strictly enforced.']
  })
};

PHASE3_REWRITE['LLDP3-P11-V4'] = {
  taskName: 'Version 4: Requirement Change — Provider Failover & Retry',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added automated provider failover (e.g. Twilio -> MessageBird) with exponential backoff retry.',
    whyOldDesignStruggles: 'Single vendor outages cause 100% notification delivery failure.',
    newRequirements: ['If primary provider throws error, retry up to 2 times.', 'If still failing, switch to secondary provider.'],
    observableBehavior: 'Twilio 500 error causes automatic delivery via MessageBird.',
    examples: 'Primary fails -> Secondary delivers successfully.',
    acceptanceCriteria: ['Zero notification loss during primary vendor downtime.']
  })
};

PHASE3_REWRITE['LLDP3-P11-V5'] = {
  taskName: 'Version 5: Design Review & Invariant Audit',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Complete architectural review of Notification Engine.',
    whyOldDesignStruggles: 'Validates pipeline filters, failover, and multi-channel reliability.',
    newRequirements: ['Comprehensive integration test covering 1,000 notifications with simulated provider failures.'],
    observableBehavior: 'All notifications delivered reliably.',
    examples: '100% test pass across all channels and failover scenarios.',
    acceptanceCriteria: ['Clean separation between TemplateEngine, FilterChain, and ChannelProviders.'],
    designReviewNote: 'In post-attempt review: examine how the Chain of Responsibility and Decorator patterns created an extensible delivery pipeline without tangled code.'
  })
};

fs.writeFileSync(path.resolve(__dirname, 'phase3_rewritten_data.json'), JSON.stringify(PHASE3_REWRITE, null, 2));
console.log(`✓ Phase 3 successfully generated: ${Object.keys(PHASE3_REWRITE).length} records authored.`);

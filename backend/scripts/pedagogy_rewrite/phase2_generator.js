import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatUnitDescription, formatDrillDescription, formatMajorProblemDescription, formatProblemVersionDescription } from './content_formatters.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PHASE2_REWRITE = {};

// ============================================================================
// MODULES (4)
// ============================================================================
PHASE2_REWRITE['LLDP2-M1'] = {
  taskName: 'Module 2.1: Spotting Messy Code & Giving Classes One Job',
  taskDescription: 'Learn how to detect code that is trying to do too much at once, and how to break giant classes into small, focused helpers that do one job well.'
};

PHASE2_REWRITE['LLDP2-M2'] = {
  taskName: 'Module 2.2: Adding New Features Without Breaking Old Code',
  taskDescription: 'Learn how to design your classes so that when a new requirement arrives, you can simply add new code without opening and modifying tested classes.'
};

PHASE2_REWRITE['LLDP2-M3'] = {
  taskName: 'Module 2.3: Decoupling Classes with Interfaces and Injection',
  taskDescription: 'Learn how to stop classes from hardcoding their own dependencies, making your system easy to test, mock, and reconfigure.'
};

PHASE2_REWRITE['LLDP2-M4'] = {
  taskName: 'Module 2.4: Trade-offs & Defending Your Design in Interviews',
  taskDescription: 'Learn how to evaluate performance versus cleanliness, know when to say no to over-engineering, and articulate why you chose a specific design.'
};

// ============================================================================
// LEARNING UNITS (6)
// ============================================================================

// Unit 2.1.1
PHASE2_REWRITE['LLDP2-U2.1.1'] = {
  taskName: 'Unit 2.1.1: What Happens When One Class Tries to Do Everything?',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'If a single `UserManager` class handles password hashing, database SQL queries, sending emails, generating PDF invoices, and validating sessions, what happens when you need to change the email wording?',
    seeItWithASmallExample: `Look at this class:
class UserManager {
public:
    void registerUser(...) {
        // 1. Validate email
        // 2. Hash password with bcrypt
        // 3. Run raw SQL: INSERT INTO users...
        // 4. Send email via SMTP socket
        // 5. Generate PDF invoice!
    }
};`,
    whatIsGoingWrong: 'A small change in PDF invoice layout accidentally breaks user registration. Testing registration requires a real database and real email server. Multiple engineers editing the same file run into painful Git merge conflicts.',
    theSimpleIdea: 'Give every class exactly one job. Let `PasswordHasher` hash passwords, `UserRepository` talk to the database, and `EmailNotifier` send emails. `UserService` just coordinates them.',
    technicalWords: [
      { term: 'Single Responsibility (SRP)', explanation: 'A class should have only one reason to change.' },
      { term: 'God Class', explanation: 'An anti-pattern where one giant class knows too much and does too much.' },
      { term: 'Cohesion', explanation: 'How closely related and focused the methods of a single class are.' },
      { term: 'Coupling', explanation: 'How tightly connected classes are to one another.' }
    ],
    whyThisMattersInLLD: 'In system design, breaking problems into cohesive components makes each piece independently testable and simple to understand.',
    tryIt: 'Take the monolithic `UserManager` and extract an `EmailService` class with a single method `sendWelcomeEmail(string email)`.',
    nowChangeTheRequirement: 'Now change your email provider from SMTP to SendGrid.',
    whatDidTheChangeTeachUs: 'Only `EmailService` changed! You did not have to touch user registration, password hashing, or database queries.',
    canYouExplainIt: 'Can you explain why a class that handles both user passwords and PDF printing is dangerous?'
  })
};

// Unit 2.1.2
PHASE2_REWRITE['LLDP2-U2.1.2'] = {
  taskName: 'Unit 2.1.2: Forcing Classes to Implement Methods They Do Not Need',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'If an interface has 10 functions (like `uploadFile`, `downloadFile`, `transcodeVideo`, `burnToDVD`), why should a simple text-storage class be forced to implement `burnToDVD()`?',
    seeItWithASmallExample: `Suppose an interface has:
class CloudStorage {
    virtual void upload() = 0;
    virtual void transcodeVideo() = 0; // Simple text storage has no video!
};

A simple TextNoteStorage is forced to do:
void transcodeVideo() override {
    throw runtime_error("Not supported!"); // Awkward dummy function!
}`,
    whatIsGoingWrong: 'Callers cannot trust the interface contract. If calling `storage->transcodeVideo()` crashes at runtime with an exception, the interface promised something it could not deliver.',
    theSimpleIdea: 'Split fat interfaces into small, role-specific contracts. Let classes implement only what they actually support.',
    technicalWords: [
      { term: 'Interface Segregation (ISP)', explanation: 'Clients should not be forced to depend on methods they do not use.' },
      { term: 'Fat Interface', explanation: 'An interface with too many diverse methods bundled together.' },
      { term: 'Role Interface', explanation: 'A small, focused interface tailored to a specific job (like `Reader`, `Writer`).' }
    ],
    whyThisMattersInLLD: 'Small interfaces keep your components decoupled. A client that only needs to read data only depends on `DataReader`, making it impossible to accidentally trigger writes.',
    tryIt: 'Split `CloudStorage` into `FileStorage` (`upload`, `download`) and `MediaProcessor` (`transcodeVideo`).',
    nowChangeTheRequirement: 'Create an `AudioPlayer` that only needs `MediaProcessor`.',
    whatDidTheChangeTeachUs: 'The AudioPlayer depends strictly on media processing without carrying useless storage functions.',
    canYouExplainIt: 'Can you explain why throwing "UnsupportedOperationException" inside an interface method is a sign of bad design?'
  })
};

// Unit 2.2.1
PHASE2_REWRITE['LLDP2-U2.2.1'] = {
  taskName: 'Unit 2.2.1: What Happens When Every New Option Forces Us to Edit the Same Big If/Else?',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'When you have a function that calculates tax using a 50-line `switch(countryCode)`, what happens every time your company launches in a new country?',
    seeItWithASmallExample: `Notice how switch statements grow:
double calculateTax(string country, double amount) {
    if (country == "US") return amount * 0.08;
    else if (country == "UK") return amount * 0.20;
    else if (country == "IN") return amount * 0.18;
    // Every new country forces editing this tested function!
}`,
    whatIsGoingWrong: 'Every time you add a new country or payment method, you risk introducing typos or syntax bugs into previously tested code, forcing full regression testing.',
    theSimpleIdea: 'Make each country’s rule its own small class implementing a common `TaxCalculator` contract. When a new country launches, write a new class without editing the existing engine.',
    technicalWords: [
      { term: 'Open/Closed Principle (OCP)', explanation: 'Code should be open for extension (easy to add new features) but closed for modification (never edit existing working code).' },
      { term: 'Polymorphic Dispatch', explanation: 'Delegating to a common interface so the right child class executes automatically.' }
    ],
    whyThisMattersInLLD: 'This is the most critical principle in low level design. It allows software systems to grow gracefully over years without turning into fragile spaghetti.',
    tryIt: 'Define `TaxRule` with `virtual double getTax(double amount) = 0`. Implement `UsTax` and `UkTax`. Pass a `TaxRule*` to your order checkout.',
    nowChangeTheRequirement: 'Add support for German tax (19%). Did you edit `UsTax` or checkout code?',
    whatDidTheChangeTeachUs: 'You only created `GermanTax`! Existing tested classes remained completely untouched.',
    canYouExplainIt: 'Can you explain why adding a new class is safer than editing an existing 100-line if/else block?'
  })
};

// Unit 2.2.2
PHASE2_REWRITE['LLDP2-U2.2.2'] = {
  taskName: 'Unit 2.2.2: When a Child Class Breaks the Promises Made by Its Parent',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'If a program works with a base `Bird` class that has `fly()`, what happens when someone creates an `Ostrich` subclass that cannot fly?',
    seeItWithASmallExample: `Consider:
void makeBirdFly(Bird* b) {
    b->fly(); // Caller assumes all birds fly!
}

class Ostrich : public Bird {
public:
    fly() override { throw runtime_error("I cannot fly!"); } // CRASH!
};`,
    whatIsGoingWrong: 'Code written to use the parent class crashes when handed the child class. The caller must start writing `if (typeid(*b) == typeid(Ostrich))` checks everywhere, destroying polymorphism.',
    theSimpleIdea: 'A child class must honor all promises of the parent class. If an Ostrich cannot fly, then "flying" was not a universal property of all birds to begin with.',
    technicalWords: [
      { term: 'Liskov Substitution (LSP)', explanation: 'Any subclass should be usable anywhere its parent class is expected without breaking the program.' },
      { term: 'Behavioral Subtyping', explanation: 'A child class must fulfill the behavioral expectations, not just the function names, of the parent.' }
    ],
    whyThisMattersInLLD: 'Violating this principle makes inheritance dangerous. In interviews, recognizing when a proposed subclass will violate base invariants proves strong design maturity.',
    tryIt: 'Split `Bird` into `Bird` (eats, sleeps) and `FlyingBird` (adds `fly()`). Pass only `FlyingBird` to flight simulators.',
    nowChangeTheRequirement: 'Create a `Penguin` subclass.',
    whatDidTheChangeTeachUs: 'Penguin safely inherits from `Bird` without being forced to fake a flight function.',
    canYouExplainIt: 'Can you explain why a child class throwing an error on an inherited function breaks the contract?'
  })
};

// Unit 2.3.1
PHASE2_REWRITE['LLDP2-U2.3.1'] = {
  taskName: 'Unit 2.3.1: How Do We Stop One Class From Creating Everything It Needs?',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'If `OrderService` creates a `new MySQLDatabase()` directly inside its constructor, how can you test `OrderService` on your laptop without connecting to a real production database?',
    seeItWithASmallExample: `Compare:
Hardcoded (Bad):
class OrderService {
    MySQLDatabase db; // Hardcoded dependency!
public:
    OrderService() : db("prod-server.com") {}
};

Injected (Good):
class OrderService {
    Database& db; // Passed in from the outside!
public:
    OrderService(Database& database) : db(database) {}
};`,
    whatIsGoingWrong: 'When a class creates its own dependencies with `new`, it is tightly glued to that specific concrete implementation. You cannot test it with fake data, and you cannot swap the database later.',
    theSimpleIdea: 'Do not create your tools inside the house. Have someone hand you your tools through your front door (constructor parameters).',
    technicalWords: [
      { term: 'Dependency', explanation: 'A helper object that a class needs to do its job (e.g. a database or logger).' },
      { term: 'Dependency Injection (DI)', explanation: 'Passing required dependencies into a class via its constructor rather than having the class create them.' },
      { term: 'Dependency Inversion (DIP)', explanation: 'High-level business logic should depend on abstract contracts, not on low-level database or network tools.' }
    ],
    whyThisMattersInLLD: 'Dependency injection makes systems modular and effortlessly testable. In interviews, building classes that accept dependencies in their constructors is standard best practice.',
    tryIt: 'Define an abstract `Database` contract. Pass a `FakeTestDatabase` into `OrderService` inside a unit test.',
    nowChangeTheRequirement: 'Switch the production database from MySQL to PostgreSQL.',
    whatDidTheChangeTeachUs: '`OrderService` code did not change by a single character! You simply passed the new Postgres database instance into the constructor.',
    canYouExplainIt: 'Can you explain the difference between a class creating a database versus receiving a database in its constructor?'
  })
};

// Unit 2.4.1
PHASE2_REWRITE['LLDP2-U2.4.1'] = {
  taskName: 'Unit 2.4.1: When Is a Simple Design Better Than 10 Abstractions?',
  taskDescription: formatUnitDescription({
    whatAreWeTryingToSolve: 'If an interviewer asks you to build a simple calculator that only adds and subtracts, should you create an `AbstractCalculationStrategyFactoryProvider` with 8 interfaces?',
    seeItWithASmallExample: `Simple code:
int add(int a, int b) { return a + b; }

Over-engineered code:
class IAdditionOperationFactoryProvider { ... }; // 100 lines of boilerplate for 1 line of math!`,
    whatIsGoingWrong: 'Over-engineering makes code impossible to read, introduces mental overhead, and wastes valuable interview time on problems that do not exist.',
    theSimpleIdea: 'Start with the simplest design that solves the problem and defends invariants. Introduce abstraction only when there is genuine requirement pressure or multiple variations.',
    technicalWords: [
      { term: 'Over-Engineering', explanation: 'Building complex abstractions for imaginary future requirements that do not yet exist.' },
      { term: 'YAGNI', explanation: '"You Aren’t Gonna Need It" — do not add code until you actually need it.' },
      { term: 'KISS', explanation: '"Keep It Simple, Stupid" — simple designs have fewer bugs and are easier to change.' }
    ],
    whyThisMattersInLLD: 'Interviewers intentionally probe whether you know how to balance clean design with simplicity, or whether you mindlessly apply patterns everywhere.',
    tryIt: 'Write a simple 5-line string formatter. Now consider whether it needs an abstract factory.',
    nowChangeTheRequirement: 'The client requests supporting JSON, XML, and YAML output formats.',
    whatDidTheChangeTeachUs: 'NOW you have real requirement pressure! Now an abstraction is justified.',
    canYouExplainIt: 'Can you explain why writing simple code first and refactoring when requirements change is better than guessing the future?'
  })
};

// ============================================================================
// PRACTICAL DRILLS (10)
// ============================================================================

PHASE2_REWRITE['LLDP2-D2.1.1'] = {
  taskName: 'Dismantling the God Class UserManager',
  taskDescription: formatDrillDescription({
    title: 'Dismantling the God Class UserManager Refactor',
    problemStatement: 'Refactor a monolithic 600-line `UserManager` class that handles password hashing, database queries, email delivery, session tokens, and PDF generation into focused, single-responsibility collaborators.',
    contextScenario: 'In an e-commerce platform, modifying the PDF invoice template caused a regression that broke user logins. An audit showed that all user operations live in a single massive file.',
    startingPoint: `Monolithic Starting Code:
\`\`\`cpp
class UserManager {
public:
    void registerUser(string email, string pass) {
        // checks email regex, hashes pass, executes SQL, sends email, logs audit
    }
};
\`\`\``,
    yourTask: `1. Extract single-purpose classes:
   - \`PasswordHasher\` (hashes and verifies passwords)
   - \`UserRepository\` (handles user persistence)
   - \`EmailNotifier\` (sends email notifications)
2. Refactor \`UserService\` into a coordinator that delegates each task to its specialized collaborator.
3. Write unit tests for \`UserService\` using simple fake/mock implementations of repository and notifier.`,
    apiInterface: `class PasswordHasher {
public:
    std::string hash(const std::string& rawPassword);
    bool verify(const std::string& rawPassword, const std::string& hash);
};

class UserRepository {
public:
    virtual ~UserRepository() = default;
    virtual void save(const User& user) = 0;
    virtual std::optional<User> findByEmail(const std::string& email) = 0;
};

class UserService {
public:
    UserService(std::shared_ptr<UserRepository> repo,
                std::shared_ptr<PasswordHasher> hasher,
                std::shared_ptr<EmailNotifier> notifier);
    void registerUser(const std::string& email, const std::string& password);
};`,
    inputInteractionModel: 'Instantiate UserService by injecting mock collaborators and test registration.',
    expectedBehavior: 'Registering a user hashes the password, saves to the repository, and sends a welcome email.',
    examples: `auto repo = std::make_shared<InMemoryUserRepo>();
auto hasher = std::make_shared<PasswordHasher>();
auto notifier = std::make_shared<MockEmailNotifier>();
UserService service(repo, hasher, notifier);
service.registerUser("user@example.com", "Secret123!");`,
    constraintsAssumptions: 'In-memory execution. Safe shared pointer injection.',
    edgeCases: 'Attempting to register with an already existing email throws DuplicateUserException without sending an email.',
    acceptanceCriteria: [
      'UserManager is completely dismantled into focused collaborators.',
      'UserService coordinates domain logic without touching raw I/O or SQL.',
      'Unit tests run with in-memory mocks.'
    ],
    whatToObserve: 'Notice how easy it is to test UserService without needing a real database or SMTP server.',
    thinkAbout: 'If we need to add SMS notifications tomorrow, which classes need to change?'
  })
};

PHASE2_REWRITE['LLDP2-D2.1.2'] = {
  taskName: 'Segregating Bloated CloudStorageProvider',
  taskDescription: formatDrillDescription({
    title: 'Segregating Fat Interfaces (ISP Refactor)',
    problemStatement: 'Refactor a bloated `CloudStorageProvider` interface that forces simple text storage clients to implement video transcoding and thumbnail generation methods.',
    contextScenario: 'A logging agent only needs to upload `.log` files to S3, but its class is forced to implement `transcodeVideo()` and `billTenant()` with dummy `throw UnsupportedOperationException()` bodies.',
    startingPoint: `Bloated Interface:
\`\`\`cpp
class CloudStorageProvider {
public:
    virtual void uploadFile(string path, vector<uint8_t> data) = 0;
    virtual vector<uint8_t> downloadFile(string path) = 0;
    virtual void transcodeVideo(string videoPath, string codec) = 0;
};
\`\`\``,
    yourTask: `1. Segregate the bloated interface into role-based contracts:
   - \`StorageReader\` (downloadFile)
   - \`StorageWriter\` (uploadFile)
   - \`MediaProcessor\` (transcodeVideo)
2. Implement \`SimpleBlobStore\` implementing only \`StorageReader\` and \`StorageWriter\`.
3. Refactor client \`LogUploader\` to depend strictly on \`StorageWriter\`.`,
    apiInterface: `class StorageReader { public: virtual ~StorageReader() = default; virtual std::vector<uint8_t> download(const std::string& p) = 0; };
class StorageWriter { public: virtual ~StorageWriter() = default; virtual void upload(const std::string& p, const std::vector<uint8_t>& d) = 0; };`,
    inputInteractionModel: 'Pass storage instances to LogUploader.',
    expectedBehavior: 'LogUploader only has access to upload operations. No class throws UnsupportedOperationException.',
    examples: 'LogUploader accepts StorageWriter and uploads logs safely.',
    constraintsAssumptions: 'C++ pure virtual interface contracts.',
    edgeCases: 'Uploading empty files is allowed; invalid paths throw std::invalid_argument.',
    acceptanceCriteria: [
      'No class contains dummy or unsupported methods.',
      'Clients depend only on the minimal interface they require.'
    ],
    whatToObserve: 'Notice how LogUploader cannot accidentally call media functions because they simply do not exist on StorageWriter.',
    thinkAbout: 'Why is it better to have 3 small interfaces than 1 big interface?'
  })
};

PHASE2_REWRITE['LLDP2-D2.2.1'] = {
  taskName: 'Replacing Type-Code Switch with Polymorphic Strategy',
  taskDescription: formatDrillDescription({
    title: 'Eliminating Switch Statements with Extensible Rules (OCP)',
    problemStatement: 'Refactor a `TaxCalculator` class that contains a 40-line `switch(countryCode)` statement so new tax jurisdictions can be added without modifying existing code.',
    contextScenario: 'An international e-commerce checkout engine has to be updated every quarter as new regional tax rules are enacted. Editing the centralized switch statement has repeatedly caused bugs in existing countries.',
    startingPoint: `Problematic Switch Code:
\`\`\`cpp
double calculateTax(string region, double amount) {
    if (region == "US_CA") return amount * 0.0925;
    else if (region == "EU_DE") return amount * 0.19;
}
\`\`\``,
    yourTask: `1. Define a \`TaxRule\` interface with \`virtual int calculateTaxCents(int amountCents) const = 0;\`.
2. Implement concrete rules for \`UsCaTax\` and \`EuDeTax\`.
3. Create a \`TaxRuleRegistry\` where regional tax rules can be registered dynamically by region code.
4. Verify that adding a new jurisdiction requires writing only a new class without modifying existing engine code.`,
    apiInterface: `class TaxRule { public: virtual ~TaxRule() = default; virtual int calculateTaxCents(int amountCents) const = 0; };
class TaxEngine { public: void registerRule(const std::string& region, std::shared_ptr<TaxRule> rule); int computeTax(const std::string& region, int amountCents) const; };`,
    inputInteractionModel: 'Register tax rules into TaxEngine and compute taxes for transactions.',
    expectedBehavior: 'Looks up the tax rule for the region and calculates the tax.',
    examples: 'Compute tax for US_CA returns exact cents without switch statements.',
    constraintsAssumptions: 'Amounts in integer cents.',
    edgeCases: 'Unknown region throws UnknownRegionException.',
    acceptanceCriteria: [
      'Switch statement is completely eliminated.',
      'New regions can be added with zero changes to TaxEngine.'
    ],
    whatToObserve: 'Notice how the engine is now closed for modification but open for extension.',
    thinkAbout: 'How does this pattern make code easier to test?'
  })
};

PHASE2_REWRITE['LLDP2-D2.2.2'] = {
  taskName: 'Spotting Liskov Substitution Violations',
  taskDescription: formatDrillDescription({
    title: 'Spotting & Fixing Subclass Contract Violations (LSP)',
    problemStatement: 'Analyze a code snippet where a `ReadOnlyFile` subclass inherits from `File` and throws an error on `write()`, breaking file batch processing. Refactor the inheritance hierarchy.',
    contextScenario: 'An automated document archiver iterates over a folder of `File*` calling `f->write(header)`. When it encounters a `ReadOnlyFile`, the entire backup batch crashes.',
    startingPoint: `Broken Inheritance Code:
\`\`\`cpp
class File { public: virtual void read() = 0; virtual void write(string s) = 0; };
class ReadOnlyFile : public File { public: void write(string s) override { throw runtime_error("Read only!"); } };
\`\`\``,
    yourTask: `1. Explain why ReadOnlyFile violates behavioral subtyping.
2. Split the contract into \`Readable\` and \`Writable\`.
3. Update callers so only \`Writable\` files can be passed to write operations.`,
    apiInterface: `class Readable { public: virtual ~Readable() = default; virtual std::string read() = 0; };
class Writable { public: virtual ~Writable() = default; virtual void write(const std::string& data) = 0; };`,
    inputInteractionModel: 'Pass writable files to archiving writers.',
    expectedBehavior: 'Compile-time enforcement guarantees non-writable files are never passed to write operations.',
    examples: 'ReadOnlyFile implements Readable only; compiler prevents passing to writeArchive().',
    constraintsAssumptions: 'C++ compile-time type safety.',
    edgeCases: 'Attempting to write empty strings.',
    acceptanceCriteria: [
      'No subclass throws UnsupportedOperationException.',
      'Compile-time safety replaces runtime crashes.'
    ],
    whatToObserve: 'Notice how interface segregation directly assists Liskov substitution.',
    thinkAbout: 'Why is compile-time safety better than runtime exception handling?'
  })
};

PHASE2_REWRITE['LLDP2-D2.3.1'] = {
  taskName: 'Manual Constructor Injection & Fake Ports',
  taskDescription: formatDrillDescription({
    title: 'Manual Constructor Injection & In-Memory Ports',
    problemStatement: 'Refactor an `OrderService` that creates a concrete `PostgresOrderRepository` inside its constructor, decoupling it through an abstract database interface and in-memory mock.',
    contextScenario: 'Unit tests take 45 seconds because they hit a real database. Refactor using constructor injection so tests run in 5 milliseconds.',
    startingPoint: `Coupled Code:
\`\`\`cpp
class OrderService {
    PostgresOrderRepository repo;
public:
    OrderService() : repo("localhost:5432") {}
};
\`\`\``,
    yourTask: `1. Define \`OrderRepositoryPort\` interface.
2. Refactor \`OrderService\` to receive \`std::shared_ptr<OrderRepositoryPort>\` in its constructor.
3. Implement \`InMemoryOrderRepository\` and write ultra-fast unit tests.`,
    apiInterface: `class OrderRepositoryPort { public: virtual ~OrderRepositoryPort() = default; virtual void save(const Order& order) = 0; };
class OrderService { public: explicit OrderService(std::shared_ptr<OrderRepositoryPort> repo); };`,
    inputInteractionModel: 'Inject in-memory repository into OrderService during tests.',
    expectedBehavior: 'OrderService functions identically without knowing what database is running.',
    examples: 'Mock repository records order in memory instantly.',
    constraintsAssumptions: 'C++17 shared_ptr.',
    edgeCases: 'Passing nullptr throws std::invalid_argument.',
    acceptanceCriteria: [
      'OrderService has zero Postgres dependencies.',
      'Unit tests run completely in memory.'
    ],
    whatToObserve: 'Notice how clean tests become when I/O is passed in rather than created internally.',
    thinkAbout: 'How does this structure help when moving from MySQL to DynamoDB?'
  })
};

PHASE2_REWRITE['LLDP2-D2.4.1'] = {
  taskName: 'Inheritance vs Composition Trade-offs',
  taskDescription: formatDrillDescription({
    title: 'Benchmarking & Defending Inheritance vs Composition',
    problemStatement: 'Compare two designs for a Character Combat system: one using a deep inheritance tree (Warrior -> ArmoredWarrior -> FireArmoredWarrior) and one using Composition (Character with Armor and Enchantment components).',
    contextScenario: 'A game studio is facing class explosion with 50 subclasses for every weapon and armor combination. You must refactor to composition and defend the decision.',
    startingPoint: 'Review the 50-class inheritance hierarchy.',
    yourTask: `1. Refactor Character to hold pluggable \`Armor\` and \`Weapon\` components.
2. Compare lines of code, flexibility at runtime, and compile-time complexity.
3. Write a 3-bullet point architectural defense for an interview.',`,
    apiInterface: `class Character {
private:
    std::shared_ptr<Weapon> weapon;
    std::shared_ptr<Armor> armor;
public:
    void equipWeapon(std::shared_ptr<Weapon> w);
    int takeDamage(int incoming);
};`,
    inputInteractionModel: 'Equip characters dynamically at runtime.',
    expectedBehavior: 'Character changes equipment dynamically during combat without creating new classes.',
    examples: 'Character swaps sword for bow at runtime.',
    constraintsAssumptions: 'Modern C++ memory management.',
    edgeCases: 'Character without weapon does default hand-to-hand damage.',
    acceptanceCriteria: [
      '50 subclasses eliminated.',
      'Equipment swappable at runtime.'
    ],
    whatToObserve: 'Notice how composition allows runtime changes, which inheritance cannot do.',
    thinkAbout: 'When would inheritance still be appropriate in a game engine?'
  })
};

PHASE2_REWRITE['LLDP2-D2.4.2'] = {
  taskName: 'Switch vs Polymorphism: Defining the Threshold',
  taskDescription: formatDrillDescription({
    title: 'Switch vs Polymorphism Architectural Threshold Drill',
    problemStatement: 'Determine when a simple `switch` statement is the correct, pragmatic choice versus when polymorphic classes are required.',
    contextScenario: 'An engineer replaced a 3-case `switch(direction)` (NORTH, SOUTH, EAST, WEST) with 4 new classes and an abstract DirectionFactory, bloating the codebase. You must define the boundary.',
    startingPoint: 'Analyze the bloated Direction classes.',
    yourTask: `1. Articulate the rule of thumb: stable enums that never change (e.g. HTTP methods, compass directions) belong in switches.
2. Open-ended business variants (payment methods, shipping carriers) belong in polymorphic classes.
3. Refactor the bloated Direction classes back into a clean, simple enum switch.`,
    apiInterface: `enum class Direction { NORTH, SOUTH, EAST, WEST };
Point move(Point current, Direction dir);`,
    inputInteractionModel: 'Execute movement using simple enum values.',
    expectedBehavior: 'Clean, readable 10-line function replaces 5 classes.',
    examples: 'move(p, Direction::NORTH) increments Y by 1.',
    constraintsAssumptions: 'Fixed 4-point coordinate system.',
    edgeCases: 'Invalid enum cast handled by default branch.',
    acceptanceCriteria: [
      'Unnecessary abstraction removed.',
      'Clear guideline articulated for interview defense.'
    ],
    whatToObserve: 'Notice how removing useless classes improves readability.',
    thinkAbout: 'What is the danger of blindly following design patterns everywhere?'
  })
};

PHASE2_REWRITE['LLDP2-D2.4.3'] = {
  taskName: 'Concrete Class vs Abstract Class vs Interface',
  taskDescription: formatDrillDescription({
    title: 'Choosing Between Concrete, Abstract, and Interface Types',
    problemStatement: 'Given a domain specification for an Audio Streaming Service, decide which components should be pure interfaces, which should be abstract classes with shared logic, and which should be concrete classes.',
    contextScenario: 'Junior engineers often make everything an interface or everything a concrete class without understanding the trade-offs between shared code reuse and pure contract decoupling.',
    startingPoint: 'Audio domain requirements: AudioPlayer, Track, Mp3Decoder, FlacDecoder, Playlist.',
    yourTask: `1. Implement \`AudioDecoder\` as a pure interface (pure contract).
2. Implement \`BaseAudioPlayer\` as an abstract class (holds volume state, playback queue).
3. Implement \`Track\` as a concrete value object.
4. Document why each choice fits its role.`,
    apiInterface: `class AudioDecoder { public: virtual ~AudioDecoder() = default; virtual void decode(const std::vector<uint8_t>& b) = 0; };
class BaseAudioPlayer { protected: int volume = 50; public: void setVolume(int v); virtual void play() = 0; };`,
    inputInteractionModel: 'Assemble players with decoders.',
    expectedBehavior: 'Shared state lives in abstract class; decoding variation is delegated to interface.',
    examples: 'FlacPlayer shares volume logic with Mp3Player.',
    constraintsAssumptions: 'C++ virtual inheritance.',
    edgeCases: 'Volume clamped between 0 and 100.',
    acceptanceCriteria: [
      'Correct classification of each component.',
      'Zero code duplication for common player state.'
    ],
    whatToObserve: 'Notice how abstract classes are ideal for sharing state, while interfaces are ideal for pure behavior.',
    thinkAbout: 'Why can a class implement multiple interfaces but only inherit from one base in many languages?'
  })
};

PHASE2_REWRITE['LLDP2-D2.4.4'] = {
  taskName: 'YAGNI & Over-Engineering Audit',
  taskDescription: formatDrillDescription({
    title: 'Pruning Over-Engineered Code (YAGNI Audit)',
    problemStatement: 'Review a 1,200-line codebase written for a simple CSV to JSON converter that has 14 interfaces, 3 abstract factories, and a custom event broker. Prune it down to clean, maintainable code.',
    contextScenario: 'An overzealous developer created an enterprise-grade framework for a one-off CLI tool. Bugs take hours to track down because execution passes through 9 layers of indirection.',
    startingPoint: 'Review the over-engineered repository.',
    yourTask: `1. Identify speculative abstractions that have only 1 implementation.
2. Collapse redundant interfaces into direct concrete classes.
3. Reduce the codebase by at least 60% while maintaining 100% functionality and testability.`,
    apiInterface: `class CsvToJsonConverter {
public:
    std::string convert(const std::string& csvData);
};`,
    inputInteractionModel: 'Pass CSV string and receive JSON string.',
    expectedBehavior: 'Correctly converts tabular CSV into JSON array of objects.',
    examples: 'Input: "name,age\\nAlice,30" -> Output: \'[{"name":"Alice","age":30}]\'',
    constraintsAssumptions: 'Standard C++ standard library.',
    edgeCases: 'Malformed CSV lines or empty files.',
    acceptanceCriteria: [
      'Over-engineered layers collapsed.',
      'All original test cases pass in under 50 lines of clear code.'
    ],
    whatToObserve: 'Notice how simplicity makes debugging instantaneous.',
    thinkAbout: 'What questions should you ask before creating an interface?'
  })
};

PHASE2_REWRITE['LLDP2-D2.4.5'] = {
  taskName: 'Predicting OCP Failures in Notification Engine',
  taskDescription: formatDrillDescription({
    title: 'Predicting & Mitigating Open/Closed Failures',
    problemStatement: 'Analyze an existing notification delivery engine and predict exactly where adding Push Notifications and Slack channels will break existing code, then refactor ahead of time.',
    contextScenario: 'Management announced plans to add WhatsApp and Push Notifications next quarter. You are asked to review the current email and SMS engine to identify and eliminate architectural bottlenecks.',
    startingPoint: 'Review the existing NotificationDispatcher.',
    yourTask: `1. Pinpoint tight couplings and hardcoded channel enums.
2. Refactor the dispatcher to use a registry of pluggable \`NotificationChannel\` handlers.
3. Demonstrate adding a mock \`SlackChannel\` with zero changes to existing delivery code.`,
    apiInterface: `class NotificationChannel { public: virtual ~NotificationChannel() = default; virtual void send(const std::string& recipient, const std::string& msg) = 0; };
class NotificationHub { public: void registerChannel(const std::string& type, std::shared_ptr<NotificationChannel> ch); void dispatch(const std::string& type, const std::string& to, const std::string& msg); };`,
    inputInteractionModel: 'Dispatch notifications across registered channels.',
    expectedBehavior: 'Hub dispatches to target channel dynamically.',
    examples: 'dispatch("slack", "#alerts", "Server down!") delivers to SlackChannel.',
    constraintsAssumptions: 'Dynamic channel registration.',
    edgeCases: 'Dispatching to unregistered channel throws UnknownChannelException.',
    acceptanceCriteria: [
      'Adding Slack requires zero edits to existing channels or Hub.',
      'Full OCP compliance achieved.'
    ],
    whatToObserve: 'Notice how predicting requirement pressure protects your codebase from future pain.',
    thinkAbout: 'How do you convince a team to refactor before the new feature is built?'
  })
};

// ============================================================================
// MAJOR PROBLEMS (3) & VERSIONS (17)
// ============================================================================

// Problem 5: Multi-Floor Parking Lot (P1)
PHASE2_REWRITE['LLDP2-P1'] = {
  taskName: 'Problem 5 — Design a Multi-Floor Parking Lot',
  taskDescription: formatMajorProblemDescription({
    contextScenario: 'Design the backend software for an automated multi-floor commercial parking garage with multiple entry and exit gates, dynamic spot allocation based on vehicle size, ticketing, and real-time floor display boards.',
    functionalRequirements: [
      'Vehicle & Spot Sizing: Support Motorcycle, Car, and Large Truck with Small, Compact, and Large spots. Motorcycle fits any spot; Car fits Compact or Large; Truck fits only Large.',
      'Multi-Floor Architecture: Support F floors with S spots per floor partitioned by size.',
      'Entry Processing: On entry, find an available spot matching vehicle size, mark it occupied, and issue an immutable ParkingTicket.',
      'Exit Processing & Billing: On exit, calculate fee based on hours parked and vehicle type, free the spot, and issue a receipt.',
      'Display Boards: Each floor displays real-time available counts per spot category.'
    ],
    operationsApi: [
      'ParkingTicket parkVehicle(const Vehicle& vehicle, int entryGateId);',
      'Receipt unparkVehicle(const std::string& ticketId, int exitGateId, const PaymentDetails& payment);',
      'int getAvailableSpotCount(int floorNumber, SpotType spotType) const;',
      'DisplayBoard getDisplayBoard(int floorNumber) const;'
    ],
    expectedBehavior: 'When a Car enters, the system allocates the nearest available Compact (or Large) spot on the lowest floor, updates occupancy, prints a ticket, and decrements available count. On exit, spot is freed and bill generated.',
    examplesScenarios: `Scenario 1: Happy Path Parking
1. Car enters Gate 1.
2. System allocates Floor 1, Spot C-04.
3. Ticket T-101 issued. Display board for Floor 1 Compact spots decrements by 1.

Scenario 2: Lot Full Rejection
1. Truck arrives. All Large spots on all floors are occupied.
2. System throws ParkingLotFullException and does not issue ticket.`,
    constraintsAssumptions: [
      'In-memory simulation with simulated clock for duration calculation.',
      'Spots cannot be double-booked.',
      'Single-threaded for Phase 2 core design focus.'
    ],
    edgeCasesErrorHandling: [
      'Unparking with an invalid or already settled ticket throws InvalidTicketException.',
      'Vehicle larger than available spots throws ParkingLotFullException.',
      'Negative parking duration throws InvalidDurationException.'
    ],
    stateLifecycleRules: 'Spot: VACANT -> OCCUPIED -> VACANT. Ticket: ACTIVE -> PAID -> CLOSED.',
    acceptanceCriteria: [
      'Sizing rules strictly enforced.',
      'Display boards reflect exact real-time counts.',
      'Billing applies duration schedules accurately.'
    ],
    whatYouNeedToImplement: 'Implement Vehicle, Spot, Floor, ParkingTicket, and ParkingLot classes in modern C++ with unit tests.'
  })
};

PHASE2_REWRITE['LLDP2-P1-V1'] = {
  taskName: 'Version 1: Single Floor Baseline',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Baseline single-floor parking lot with motorcycle and car support.',
    whyOldDesignStruggles: 'N/A — initial baseline.',
    newRequirements: [
      'Single floor with 10 Small and 20 Compact spots.',
      'Park motorcycle and car, issue ticket, unpark, and release spot.'
    ],
    observableBehavior: 'Calling parkVehicle issues ticket and reduces available count.',
    examples: 'Park Car -> Allocates Compact spot #1.',
    acceptanceCriteria: [
      'Cars do not park in Small spots.',
      'Unpark restores spot availability.'
    ]
  })
};

PHASE2_REWRITE['LLDP2-P1-V2'] = {
  taskName: 'Version 2: Vehicle & Spot Multiplicity',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added Large spots and Large Trucks to the single floor.',
    whyOldDesignStruggles: 'Fixed size assumption cannot handle multi-tier compatibility.',
    newRequirements: [
      'Add Large spots.',
      'Trucks fit only in Large spots.',
      'Cars fit in Compact or Large spots.'
    ],
    observableBehavior: 'Truck allocated Large spot; Car uses Compact unless full.',
    examples: 'Truck arrives -> Assigned Large Spot.',
    acceptanceCriteria: [
      'Trucks never fit in Compact or Small spots.'
    ]
  })
};

PHASE2_REWRITE['LLDP2-P1-V3'] = {
  taskName: 'Version 3: Multi-Floor Topology & Displays',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Scale to F floors (1-5) and add per-floor electronic display boards.',
    whyOldDesignStruggles: 'Single floor flat array does not scale to vertical garages.',
    newRequirements: [
      'Support F floors.',
      'Each floor has real-time display board of available spots by type.',
      'Allocate nearest spot starting on lowest floor.'
    ],
    observableBehavior: 'Display board accurately reflects counts for Floor 2 after parking.',
    examples: 'Floor 1 full -> Vehicle allocated spot on Floor 2.',
    acceptanceCriteria: [
      'Display boards match actual vacancy counts.'
    ]
  })
};

PHASE2_REWRITE['LLDP2-P1-V4'] = {
  taskName: 'Version 4: Pluggable Spot Allocation Strategies',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added support for different spot allocation rules (e.g. Nearest to Entrance vs Best Fit).',
    whyOldDesignStruggles: 'Hardcoded spot selection algorithm cannot adapt to mall preferences.',
    newRequirements: [
      'Support FirstAvailable on lowest floor strategy.',
      'Support BestFit strategy (exact size match preferred to save large spots).'
    ],
    observableBehavior: 'Under BestFit, Car chooses Compact spot even if Large spot is closer to gate.',
    examples: 'Car arrives -> BestFit chooses Floor 2 Compact instead of Floor 1 Large.',
    acceptanceCriteria: [
      'Strategy can be changed without modifying ParkingLot core.'
    ]
  })
};

PHASE2_REWRITE['LLDP2-P1-V5'] = {
  taskName: 'Version 5: Dynamic Tiered Fee Structures',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Implemented tiered hourly fee billing (e.g. 1st hour $2, 2nd-4th hours $3/hr, 5th+ hours $5/hr).',
    whyOldDesignStruggles: 'Flat fees do not incentivize vehicle turnover.',
    newRequirements: [
      'Tiered duration fee calculation.',
      'Different rate tables for Motorcycle, Car, and Truck.'
    ],
    observableBehavior: 'Car parked 3 hours billed $2 + $3 + $3 = $8.00.',
    examples: 'Calculate fee on unpark based on elapsed hours.',
    acceptanceCriteria: [
      'Duration calculated and rounded up accurately.'
    ]
  })
};

PHASE2_REWRITE['LLDP2-P1-V6'] = {
  taskName: 'Version 6: Requirement Change — EV Charging Bays',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added Electric Vehicle charging bays with energy metering.',
    whyOldDesignStruggles: 'Rigid spot types make adding equipment features cumbersome.',
    newRequirements: [
      'Support EV charging spots.',
      'Bill parking fee + electricity consumed.'
    ],
    observableBehavior: 'EV car parked in EV spot receives combined parking and charging receipt.',
    examples: 'Fee = $6 parking + $4 energy = $10 total.',
    acceptanceCriteria: [
      'Energy usage correctly calculated and added to bill.'
    ]
  })
};

PHASE2_REWRITE['LLDP2-P1-V7'] = {
  taskName: 'Version 7: Comprehensive Design Review & Invariant Audit',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Complete architectural review of the entire Multi-Floor Parking Lot.',
    whyOldDesignStruggles: 'Validates all components under comprehensive integration stress testing.',
    newRequirements: [
      'Full integration test suite covering vehicle overflow, EV charging, lost tickets, and gate changes.'
    ],
    observableBehavior: 'All operational workflows pass deterministically.',
    examples: '100% test pass on multi-floor parking simulation.',
    acceptanceCriteria: [
      'Zero double-booking of spots.',
      'Clean separation between spot allocation, billing, and display boards.'
    ],
    designReviewNote: 'In post-attempt review: examine how separating allocation policies from spot entities made adding EV spots seamless.'
  })
};

// Problem 6: ATM (P2)
PHASE2_REWRITE['LLDP2-P2'] = {
  taskName: 'Problem 6 — Design an Automated Teller Machine (ATM)',
  taskDescription: formatMajorProblemDescription({
    contextScenario: 'Design the control software for an Automated Teller Machine (ATM) that interfaces with a bank card reader, cash dispenser, receipt printer, and bank verification backend.',
    functionalRequirements: [
      'Card & PIN Authentication: Insert card -> Enter PIN -> Authenticate with Bank.',
      'Account Operations: View balance, withdraw cash, deposit cash.',
      'Cash Dispensing: Dispense requested amount using available note denominations ($10, $20, $50, $100).',
      'Transaction Rollback: If cash dispenser jams or account has insufficient funds, abort safely and eject card.'
    ],
    operationsApi: [
      'void insertCard(const Card& card);',
      'bool enterPin(int pin);',
      'int checkBalance(const std::string& accountId);',
      'DispenseResult withdrawCash(const std::string& accountId, int amount);',
      'void ejectCard();'
    ],
    expectedBehavior: 'Card must be authenticated with valid PIN before any financial transaction. Dispensing deducts account balance and cash cassettes atomically.',
    examplesScenarios: `Scenario 1: Successful Withdrawal
1. User inserts card, enters PIN 1234 (Authenticated).
2. User requests $60 withdrawal.
3. ATM dispenses three $20 bills, deducts $60 from account, prints receipt, and ejects card.`,
    constraintsAssumptions: [
      'Amounts in integer dollars or cents.',
      'Max 3 PIN attempts before card is locked.'
    ],
    edgeCasesErrorHandling: [
      '3 incorrect PIN attempts locks card and halts transaction.',
      'ATM cash cassettes unable to form requested amount throws InsufficientCashInAtmException.'
    ],
    stateLifecycleRules: 'ATM states: IDLE -> CARD_INSERTED -> AUTHENTICATED -> PROCESSING -> CARD_EJECTED.',
    acceptanceCriteria: [
      'Atomic balance deduction and cash dispense.',
      'Strict PIN defense and card locking.',
      'Cassette inventory properly maintained.'
    ],
    whatYouNeedToImplement: 'Implement Card, Account, CashDispenser, and AtmSystem classes in C++ with unit tests.'
  })
};

PHASE2_REWRITE['LLDP2-P2-V1'] = {
  taskName: 'Version 1: Card & PIN Flow',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Baseline ATM card reading and PIN validation.',
    whyOldDesignStruggles: 'N/A — initial baseline.',
    newRequirements: [
      'Insert card and enter PIN.',
      'Validate PIN against bank record.',
      'Eject card on cancel.'
    ],
    observableBehavior: 'Valid PIN unlocks account; invalid PIN rejects.',
    examples: 'Insert card, enter PIN 1234 -> Authenticated.',
    acceptanceCriteria: [
      'Allows access only after correct PIN.',
      'Ejects card on completion.'
    ]
  })
};

PHASE2_REWRITE['LLDP2-P2-V2'] = {
  taskName: 'Version 2: State-Driven User Lifecycle',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Enforce strict state transitions so users cannot withdraw before inserting a card or entering PIN.',
    whyOldDesignStruggles: 'Boolean flags in a single class allow calling withdraw() in Idle state.',
    newRequirements: [
      'Model states: Idle, CardInserted, PinVerified, Dispensing.',
      'Illegal actions for current state throw domain exceptions.'
    ],
    observableBehavior: 'Calling withdrawCash in Idle state throws InvalidAtmStateException.',
    examples: 'User cannot withdraw without inserting card.',
    acceptanceCriteria: [
      'State transitions strictly enforced.'
    ]
  })
};

PHASE2_REWRITE['LLDP2-P2-V3'] = {
  taskName: 'Version 3: Cash Cassettes & Dispensing Algorithm',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added physical cash cassettes holding $10, $20, $50, and $100 bills.',
    whyOldDesignStruggles: 'Treating cash as an abstract number fails when physical bills run out.',
    newRequirements: [
      'Maintain count of each bill denomination.',
      'Calculate combination of bills to dispense requested amount using greedy algorithm.',
      'If exact combination cannot be formed, reject withdrawal.'
    ],
    observableBehavior: 'Withdrawing $70 dispenses one $50 bill and one $20 bill.',
    examples: 'Request $70 -> Dispenses 1x$50 + 1x$20.',
    acceptanceCriteria: [
      'Cassette bill counts decrement accurately.',
      'Rejects withdrawal if exact notes unavailable.'
    ]
  })
};

PHASE2_REWRITE['LLDP2-P2-V4'] = {
  taskName: 'Version 4: Requirement Change — Transaction Rollback & Audit',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added physical dispenser jam detection and compensation rollback.',
    whyOldDesignStruggles: 'If dispenser jams after account balance is deducted, user loses money without receiving cash.',
    newRequirements: [
      'Simulate dispenser hardware failure.',
      'If hardware fails, rollback account debit and write transaction audit failure log.'
    ],
    observableBehavior: 'Dispenser jam restores customer account balance immediately.',
    examples: 'Jam during $100 dispense -> Account refunded $100.',
    acceptanceCriteria: [
      'Zero financial leakage on hardware failure.'
    ]
  })
};

PHASE2_REWRITE['LLDP2-P2-V5'] = {
  taskName: 'Version 5: Design Review & Invariant Audit',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Complete architectural review of ATM system.',
    whyOldDesignStruggles: 'Validates state transitions and hardware safety.',
    newRequirements: [
      'Comprehensive test suite covering 3 bad PIN attempts, low cash, and dispenser jams.'
    ],
    observableBehavior: 'All ATM workflows operate deterministically.',
    examples: '100% test pass across all banking operations.',
    acceptanceCriteria: [
      'Clean separation between ATM controller, bank gateway, and cash dispenser.'
    ],
    designReviewNote: 'In post-attempt review: examine how the State pattern cleanly managed the complex card lifecycle compared to deeply nested conditionals.'
  })
};

// Problem 7: Car Rental System (P3)
PHASE2_REWRITE['LLDP2-P3'] = {
  taskName: 'Problem 7 — Design a Car Rental System',
  taskDescription: formatMajorProblemDescription({
    contextScenario: 'Design an automated car rental reservation and fleet management system for an agency managing vehicles across city branches, reservations, returns, inspections, and billing.',
    functionalRequirements: [
      'Fleet & Branch Topology: Maintain vehicles categorized by type (Sedan, SUV, Van) across multiple branch locations.',
      'Reservation Engine: Check vehicle availability for specified date range [startDate, endDate], reserve vehicle, and generate reservation ID.',
      'Pickup & Return: Customer picks up vehicle at branch; returns at same or different branch.',
      'Billing & Fuel/Damage Inspection: Compute rental fee based on daily rates, extra mileage, fuel tank level differences, and late return penalties.'
    ],
    operationsApi: [
      'std::vector<Vehicle> searchAvailable(VehicleType type, const std::string& branch, Date start, Date end);',
      'Reservation makeReservation(const std::string& customerId, const std::string& vehicleId, Date start, Date end);',
      'RentalAgreement pickupVehicle(const std::string& reservationId);',
      'RentalInvoice returnVehicle(const std::string& agreementId, int returnOdometer, double fuelFraction, const std::string& returnBranch);'
    ],
    expectedBehavior: 'Vehicle cannot be double-booked for overlapping date ranges. Pickup marks vehicle in-use; return marks vehicle available and calculates invoice.',
    examplesScenarios: `Scenario 1: Happy Path Rental
1. Customer reserves SUV for March 1 to March 5.
2. Customer picks up vehicle on March 1.
3. Customer returns on March 5 with full tank -> Invoiced 4 days at $50/day = $200.`,
    constraintsAssumptions: [
      'Date intervals are discrete days.',
      'Vehicle can only be at one branch at a time.'
    ],
    edgeCasesErrorHandling: [
      'Reserving a vehicle for overlapping dates throws VehicleUnavailableException.',
      'Returning vehicle with less fuel than pickup incurs refuel penalty fee.'
    ],
    stateLifecycleRules: 'Vehicle states: AVAILABLE -> RESERVED -> IN_USE -> MAINTENANCE.',
    acceptanceCriteria: [
      'Zero overlapping reservation conflicts.',
      'Accurate fee and penalty calculation.',
      'Branch inventory updates on cross-branch returns.'
    ],
    whatYouNeedToImplement: 'Implement Vehicle, Reservation, Branch, and RentalSystem classes in C++ with unit tests.'
  })
};

PHASE2_REWRITE['LLDP2-P3-V1'] = {
  taskName: 'Version 1: Fleet Catalog & Basic Reservation',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Baseline fleet catalog and single-day reservations.',
    whyOldDesignStruggles: 'N/A — initial baseline.',
    newRequirements: [
      'Maintain catalog of vehicles (Sedan, SUV).',
      'Reserve vehicle for a single day.',
      'Pickup and return.'
    ],
    observableBehavior: 'Vehicle is marked reserved and cannot be booked by others for that day.',
    examples: 'Reserve Car 1 for today -> Succeeds.',
    acceptanceCriteria: [
      'Basic reservation and return workflow operational.'
    ]
  })
};

PHASE2_REWRITE['LLDP2-P3-V2'] = {
  taskName: 'Version 2: Temporal Conflict Resolution',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Extended reservations to arbitrary date ranges [start, end] with overlap collision detection.',
    whyOldDesignStruggles: 'Checking single-day flags fails when customers book multi-day and week-long rentals.',
    newRequirements: [
      'Support multi-day date ranges.',
      'Detect overlapping date intervals using interval overlap logic `(startA <= endB && endA >= startB)`.'
    ],
    observableBehavior: 'Booking March 3-7 succeeds; subsequent attempt to book March 5-10 for same vehicle is rejected.',
    examples: 'Overlap collision detected -> VehicleUnavailableException.',
    acceptanceCriteria: [
      'Zero temporal booking collisions.'
    ]
  })
};

PHASE2_REWRITE['LLDP2-P3-V3'] = {
  taskName: 'Version 3: Add-on Services & Dynamic Pricing',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Added optional add-on equipment (GPS, Child Seat, Roadside Assistance) and seasonal weekend pricing.',
    whyOldDesignStruggles: 'Hardcoding add-ons inside vehicle class pollutes vehicle entity.',
    newRequirements: [
      'Support add-on services with per-day fees.',
      'Dynamic rates for weekend vs weekday rentals.'
    ],
    observableBehavior: 'Rental total includes daily vehicle rate + GPS ($10/day) + child seat ($5/day).',
    examples: '3 days rental + GPS = Base + $30.',
    acceptanceCriteria: [
      'Add-ons compose onto reservation cleanly.',
      'Rates calculated accurately.'
    ]
  })
};

PHASE2_REWRITE['LLDP2-P3-V4'] = {
  taskName: 'Version 4: Requirement Change — One-Way Rentals & Penalties',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Customers can now pick up in City A and return in City B (one-way rental with drop-off fee) and late return penalties.',
    whyOldDesignStruggles: 'Assuming pickup branch == return branch breaks inventory balance across branches.',
    newRequirements: [
      'Support different return branch.',
      'Charge one-way relocation surcharge.',
      'Update vehicle branch location upon return.'
    ],
    observableBehavior: 'Vehicle picked up in NYC and returned in Boston updates its location to Boston branch.',
    examples: 'Pickup NYC -> Return Boston -> Billed $50 drop-off fee; vehicle now available in Boston.',
    acceptanceCriteria: [
      'Branch inventory adjusts accurately.',
      'Relocation fee assessed.'
    ]
  })
};

PHASE2_REWRITE['LLDP2-P3-V5'] = {
  taskName: 'Version 5: Design Review & Invariant Audit',
  taskDescription: formatProblemVersionDescription({
    whatChanged: 'Complete architectural review of Car Rental System.',
    whyOldDesignStruggles: 'Validates date interval algorithms and cross-branch inventory integrity.',
    newRequirements: [
      'Comprehensive stress testing with 100 concurrent date reservation attempts.'
    ],
    observableBehavior: 'All reservations succeed deterministically without collisions.',
    examples: '100% test pass across all branches.',
    acceptanceCriteria: [
      'Clean separation between Fleet, Reservation, and Billing.'
    ],
    designReviewNote: 'In post-attempt review: observe how interval checking was encapsulated in a DateRange value object rather than scattered across rental services.'
  })
};

fs.writeFileSync(path.resolve(__dirname, 'phase2_rewritten_data.json'), JSON.stringify(PHASE2_REWRITE, null, 2));
console.log(`✓ Phase 2 successfully generated: ${Object.keys(PHASE2_REWRITE).length} records authored.`);

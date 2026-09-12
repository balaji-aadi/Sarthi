/**
 * Sarthi LLD — Refine LLDP1-U1.1.3: Clearly Teach Abstraction, Inheritance & Polymorphism
 * 
 * Satisfies:
 * 1. Simple beginner-friendly explanations of each:
 *    - Abstraction: The contract (what vs how)
 *    - Inheritance: The is-a relationship
 *    - Polymorphism: One pointer, many forms at runtime via virtual
 * 2. Clearly distinguishes the difference between them.
 * 3. Tiny C++ snippet illustrating all three with checkout(PaymentMethod* method, int amount).
 * 4. Virtual destructor safety explained.
 * 5. Clean fenced code blocks throughout sections 1 to 10.
 * 6. Frozen curriculum counts preserved (202 LLD, 458 DSA).
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const U113_NEW_DESCRIPTION = `### Concept Notes: Abstraction, Inheritance & Polymorphism
**What are they?**
These three principles solve different parts of building extensible systems:
- **Abstraction** is the *contract*: It defines *what* an object can do without revealing *how* it works internally (e.g. \`PaymentMethod\` promises a \`pay()\` operation).
- **Inheritance** is the *relationship*: A derived class receives structure and contract from a base class (\`UPI\` *is a* \`PaymentMethod\`).
- **Polymorphism** is the *dynamic behavior*: A single base pointer (\`PaymentMethod*\`) invokes the correct derived implementation at runtime without checking types.

**Why does it matter?**
Without abstraction, callers are coupled to concrete implementation details. Without polymorphism, adding a new payment method forces you to open and edit existing checkout code with sprawling \`if / else\` statements.

**Tiny C++ Example:**
\`\`\`cpp
// 1. ABSTRACTION: The contract (pure virtual function '= 0')
class PaymentMethod {
public:
    virtual void pay(int amount) = 0; // Defines WHAT, not HOW
    virtual ~PaymentMethod() = default; // Virtual destructor ensures safe deletion
};

// 2. INHERITANCE: The 'is-a' relationship (UPI is a PaymentMethod)
class UPI : public PaymentMethod {
public:
    void pay(int amount) override {
        std::cout << "Paid ₹" << amount << " via UPI QR\\n";
    }
};

class Card : public PaymentMethod {
public:
    void pay(int amount) override {
        std::cout << "Charged ₹" << amount << " to Card\\n";
    }
};

// 3. POLYMORPHISM: One pointer type, different behaviors at runtime
void checkout(PaymentMethod* method, int amount) {
    method->pay(amount); // Automatically runs UPI::pay or Card::pay!
}
\`\`\`

**What should I notice?**
- **Notice the difference**: Abstraction is the contract (\`PaymentMethod\`). Inheritance is the \`is-a\` derivation (\`class UPI : public PaymentMethod\`). Polymorphism is \`method->pay(amount)\` executing the right behavior at runtime without any \`if / else\` checks!
- **Virtual Destructor**: Always declare \`virtual ~PaymentMethod() = default;\` in polymorphic base classes so deleting through a base pointer (\`delete method;\`) safely frees the derived object.

→ Practice runtime polymorphism and dynamic dispatch in the following drill.

### 1. What Are We Trying To Solve?
Suppose your store accepts Credit Card and UPI. Both can make a payment. How do you write your checkout code once so it works with any current or future payment method without checking "is this a card? is this UPI?" everywhere?

### 2. See It With a Small Example
Without polymorphism, both classes exist separately:
\`\`\`cpp
class CreditCard { public: void pay(int amount) { /* charge card */ } };
class UPI        { public: void pay(int amount) { /* scan QR */ } };
\`\`\`

If Checkout has to know about both, it needs \`if / else\` branches everywhere:
\`\`\`cpp
if (type == "CARD") card.pay(amount);
else if (type == "UPI") upi.pay(amount);
\`\`\`

### 3. What Is Going Wrong?
Every time your business adds a new payment method (like NetBanking or ApplePay), you have to open and edit existing checkout code, adding more \`if / else\` blocks and risking breaking what was already working.

### 4. The Simple Idea
Create one common contract: "Anything that is a PaymentMethod must know how to \`pay(amount)\`". Then checkout only talks to the contract, and C++ automatically runs the right version of \`pay\` based on the real object behind it.

### 5. Remember This
- **Polymorphism**: The ability for different object types to respond to the same function call in their own specific way.
- **Virtual Function**: A function in a base class that tells C++: "call the function belonging to the actual derived object at runtime".
- **Abstract Class**: A class with at least one pure virtual function (\`= 0\`) that acts as a blueprint and cannot be instantiated on its own.
- **Virtual Destructor**: A destructor marked \`virtual\` so that deleting an object through a base pointer cleanly deletes the entire child object.

### 6. Why This Matters in LLD
This is the foundation of object-oriented design. It lets you add new features to a system by adding new classes, without rewriting or risking existing caller code.

### 7. Guided Experiment: Dynamic Dispatch in Action

#### Step 1 — Base Contract
Define the abstract contract with a virtual destructor:
\`\`\`cpp
class PaymentMethod {
public:
    virtual void pay(int amount) = 0;
    virtual ~PaymentMethod() = default;
};
\`\`\`

#### Step 2 — Derived Implementations
Implement \`UPI\` and \`CreditCard\` derived from \`PaymentMethod\`:
\`\`\`cpp
PaymentMethod* p = new UPI();
p->pay(100); // Observe UPI's pay run
\`\`\`

#### Step 3 — Safe Polymorphic Deletion
Delete through the base pointer:
\`\`\`cpp
delete p; // Virtual destructor ensures UPI cleanup runs safely
\`\`\`

### 8. What To Observe
Notice how the function \`checkout(PaymentMethod* method, int amount)\` has no idea whether it received a Card or UPI. It simply calls \`method->pay(amount)\`, and C++ dynamic dispatch resolves the correct implementation at runtime.

### 9. Can You Explain It?
Can you explain to a friend why C++ needs the word \`virtual\` on both \`pay()\` and \`~PaymentMethod()\` when working with base pointers?`;

async function updateU113() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);

  const taskSchema = new mongoose.Schema({
    taskId: String,
    taskName: String,
    taskDescription: String
  }, { strict: false });

  const Task = mongoose.model('Task', taskSchema);

  const u = await Task.findOne({ taskId: 'LLDP1-U1.1.3' });
  if (!u) {
    console.error('LLDP1-U1.1.3 not found!');
    process.exit(1);
  }

  u.taskDescription = U113_NEW_DESCRIPTION;
  await u.save();
  console.log('Successfully updated LLDP1-U1.1.3 with clear Abstraction, Inheritance, and Polymorphism distinction!');

  // Verify frozen counts
  const totalTasks = await Task.countDocuments();
  const dsaCount = await Task.countDocuments({ taskId: { $not: /^LLD/ } });
  const lldCount = await Task.countDocuments({ taskId: /^LLD/ });

  console.log('\n--- Curriculum Counts ---');
  console.log(`Total Tasks: ${totalTasks} (Expected: 660)`);
  console.log(`DSA Tasks:   ${dsaCount} (Expected: 458)`);
  console.log(`LLD Tasks:   ${lldCount} (Expected: 202)`);

  if (dsaCount === 458 && lldCount === 202) {
    console.log('>>> 100% CLEAN: All curriculum counts frozen! <<<');
  }

  await mongoose.disconnect();
}

updateU113().catch(err => {
  console.error('Failed to update U113:', err);
  process.exit(1);
});

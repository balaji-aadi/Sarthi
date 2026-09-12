import { LldDirectProgramExecutor } from '../services/judge/lld/LldDirectProgramExecutor.js';

console.log('===============================================================================');
console.log('  LLD DIRECT PROGRAM EXECUTOR AUTOMATED TEST SUITE');
console.log('===============================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, message, details = '') {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`, details);
    failed++;
  }
}

async function runLldTests() {
  // ---------------------------------------------------------------------------
  // GROUP 1: C++ Direct Program Execution Tests
  // ---------------------------------------------------------------------------
  console.log('[Group 1: C++ Direct Program Tests]');

  // 1. Simple Hello World
  const cppHello = await LldDirectProgramExecutor.execute({
    language: 'cpp',
    code: `
#include <iostream>
using namespace std;
int main() {
    cout << "Hello LLD World!" << endl;
    return 0;
}`
  });
  assert(cppHello.status === 'SUCCESS' && cppHello.stdout.includes('Hello LLD World!'), '1. C++ simple hello world executes and captures stdout');

  // 2. Class + Object
  const cppClass = await LldDirectProgramExecutor.execute({
    language: 'cpp',
    code: `
#include <iostream>
using namespace std;
class Vehicle {
public:
    void drive() {
        cout << "Vehicle is moving" << endl;
    }
};
int main() {
    Vehicle v;
    v.drive();
    return 0;
}`
  });
  assert(cppClass.status === 'SUCCESS' && cppClass.stdout.includes('Vehicle is moving'), '2. C++ class + object instantiation and method invocation');

  // 3. Multiple Classes
  const cppMultiClass = await LldDirectProgramExecutor.execute({
    language: 'cpp',
    code: `
#include <iostream>
#include <string>
using namespace std;
class Engine {
public:
    string start() { return "Vroom"; }
};
class Car {
    Engine engine;
public:
    void drive() {
        cout << "Car says: " << engine.start() << endl;
    }
};
int main() {
    Car c;
    c.drive();
    return 0;
}`
  });
  assert(cppMultiClass.status === 'SUCCESS' && cppMultiClass.stdout.includes('Car says: Vroom'), '3. C++ multiple collaborating classes (composition)');

  // 4. Constructors & State
  const cppCtor = await LldDirectProgramExecutor.execute({
    language: 'cpp',
    code: `
#include <iostream>
using namespace std;
class Account {
    int balance;
public:
    Account(int initial) : balance(initial) {}
    int getBalance() const { return balance; }
};
int main() {
    Account acc(500);
    cout << "Balance: " << acc.getBalance() << endl;
    return 0;
}`
  });
  assert(cppCtor.status === 'SUCCESS' && cppCtor.stdout.includes('Balance: 500'), '4. C++ custom constructor with state initialization');

  // 5. Inheritance & Polymorphism
  const cppInherit = await LldDirectProgramExecutor.execute({
    language: 'cpp',
    code: `
#include <iostream>
using namespace std;
class PaymentMethod {
public:
    virtual void pay(int amount) = 0;
    virtual ~PaymentMethod() = default;
};
class CreditCard : public PaymentMethod {
public:
    void pay(int amount) override {
        cout << "Paid " << amount << " via Credit Card" << endl;
    }
};
int main() {
    PaymentMethod* p = new CreditCard();
    p->pay(100);
    delete p;
    return 0;
}`
  });
  assert(cppInherit.status === 'SUCCESS' && cppInherit.stdout.includes('Paid 100 via Credit Card'), '5. C++ abstract class, inheritance, and virtual polymorphism');

  // 6. Student Own Main Logic
  const cppOwnMain = await LldDirectProgramExecutor.execute({
    language: 'cpp',
    code: `
#include <iostream>
using namespace std;
int main(int argc, char* argv[]) {
    int x = 10, y = 20;
    cout << "Sum is " << (x + y) << endl;
    return 0;
}`
  });
  assert(cppOwnMain.status === 'SUCCESS' && cppOwnMain.stdout.includes('Sum is 30'), "6. C++ student's own main() function with standalone logic");

  // 7. stdout Verification
  const cppStdout = await LldDirectProgramExecutor.execute({
    language: 'cpp',
    code: `
#include <iostream>
using namespace std;
int main() {
    cout << "Line 1" << endl;
    cout << "Line 2" << endl;
    return 0;
}`
  });
  assert(cppStdout.status === 'SUCCESS' && cppStdout.stdout.replace(/\r\n/g, '\n').includes('Line 1\nLine 2'), '7. C++ multiline stdout preserved accurately', cppStdout);

  // 8. stderr Verification
  const cppStderr = await LldDirectProgramExecutor.execute({
    language: 'cpp',
    code: `
#include <iostream>
using namespace std;
int main() {
    cerr << "Warning: something minor happened" << endl;
    cout << "Output continues" << endl;
    return 0;
}`
  });
  assert(cppStderr.status === 'SUCCESS' && cppStderr.stderr.includes('Warning: something minor happened') && cppStderr.stdout.includes('Output continues'), '8. C++ separate stderr stream capture');

  // 9. Compile Error
  const cppCompileErr = await LldDirectProgramExecutor.execute({
    language: 'cpp',
    code: `
#include <iostream>
int main() {
    this_is_an_unknown_token_that_does_not_exist;
    return 0;
}`
  });
  assert(cppCompileErr.status === 'COMPILE_ERROR' && cppCompileErr.error.includes('error:'), '9. C++ compilation error caught and accurately typed');

  // 10. Runtime Error (Crash / Segmentation Fault)
  const cppRuntimeErr = await LldDirectProgramExecutor.execute({
    language: 'cpp',
    code: `
#include <iostream>
int main() {
    int* ptr = nullptr;
    *ptr = 42; // Segmentation fault
    return 0;
}`
  });
  assert(cppRuntimeErr.status === 'RUNTIME_ERROR', '10. C++ runtime crash/segfault caught cleanly');

  // 11. Timeout / Infinite Loop
  const cppTimeout = await LldDirectProgramExecutor.execute({
    language: 'cpp',
    code: `
int main() {
    while(true) {}
    return 0;
}`,
    executionLimits: { timeLimitMs: 800 }
  });
  assert(cppTimeout.status === 'TIME_LIMIT_EXCEEDED', '11. C++ infinite loop terminated with TIME_LIMIT_EXCEEDED');

  // 12. Output Buffer Limit Exceeded
  const cppOutputSpam = await LldDirectProgramExecutor.execute({
    language: 'cpp',
    code: `
#include <iostream>
using namespace std;
int main() {
    while(true) {
        cout << "Spamming characters to exceed buffer capacity..." << endl;
    }
    return 0;
}`,
    executionLimits: { outputLimitBytes: 8192, timeLimitMs: 5000 }
  });
  assert(cppOutputSpam.status === 'OUTPUT_LIMIT_EXCEEDED', '12. C++ output flood terminated with OUTPUT_LIMIT_EXCEEDED');

  // ---------------------------------------------------------------------------
  // GROUP 2: Python Direct Program Execution Tests
  // ---------------------------------------------------------------------------
  console.log('\n[Group 2: Python Direct Program Tests]');

  // 1. Simple Program
  const pySimple = await LldDirectProgramExecutor.execute({
    language: 'python',
    code: `
print("Hello Python LLD")
`
  });
  assert(pySimple.status === 'SUCCESS' && pySimple.stdout.includes('Hello Python LLD'), '1. Python simple program executes and captures stdout');

  // 2. Class + Object
  const pyClass = await LldDirectProgramExecutor.execute({
    language: 'python',
    code: `
class ParkingLot:
    def __init__(self, capacity):
        self.capacity = capacity
        self.parked = 0

    def park(self):
        if self.parked < self.capacity:
            self.parked += 1
            return True
        return False

lot = ParkingLot(2)
print(f"Parked: {lot.park()}, Remaining: {lot.capacity - lot.parked}")
`
  });
  assert(pyClass.status === 'SUCCESS' && pyClass.stdout.includes('Parked: True, Remaining: 1'), '2. Python class definition, constructor, and object interaction');

  // 3. stdout Verification
  const pyStdout = await LldDirectProgramExecutor.execute({
    language: 'python',
    code: `
print("First")
print("Second")
`
  });
  assert(pyStdout.status === 'SUCCESS' && pyStdout.stdout.includes('First\nSecond'), '3. Python multiline stdout preserved cleanly');

  // 4. stderr Verification
  const pyStderr = await LldDirectProgramExecutor.execute({
    language: 'python',
    code: `
import sys
sys.stderr.write("Diagnostic warning\\n")
print("Standard line")
`
  });
  assert(pyStderr.status === 'SUCCESS' && pyStderr.stderr.includes('Diagnostic warning') && pyStderr.stdout.includes('Standard line'), '4. Python separate stderr stream capture');

  // 5. Runtime Error
  const pyRuntimeErr = await LldDirectProgramExecutor.execute({
    language: 'python',
    code: `
def calculate():
    return 10 / 0
calculate()
`
  });
  assert(pyRuntimeErr.status === 'RUNTIME_ERROR' && (pyRuntimeErr.stderr.includes('ZeroDivisionError') || pyRuntimeErr.error.includes('ZeroDivisionError')), '5. Python runtime ZeroDivisionError reported cleanly');

  // 6. Timeout
  const pyTimeout = await LldDirectProgramExecutor.execute({
    language: 'python',
    code: `
while True:
    pass
`,
    executionLimits: { timeLimitMs: 800 }
  });
  assert(pyTimeout.status === 'TIME_LIMIT_EXCEEDED', '6. Python infinite loop terminated with TIME_LIMIT_EXCEEDED');

  // ---------------------------------------------------------------------------
  // GROUP 3: Java Direct Program Execution Tests
  // ---------------------------------------------------------------------------
  console.log('\n[Group 3: Java Direct Program Tests]');

  // Check host Java availability
  const javaRes = await LldDirectProgramExecutor.execute({
    language: 'java',
    code: `
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello Java LLD");
    }
}
`
  });

  if (javaRes.status === 'PROCESS_ERROR' && javaRes.error && javaRes.error.includes('JDK')) {
    console.log('  - SKIP: Host javac/java JDK is offline in local development environment.');
    console.log('  ✓ PASS: Java correctly identified offline JDK environment without false success');
    passed++;
  } else {
    // If JDK becomes available (e.g. Docker or host install)
    assert(javaRes.status === 'SUCCESS' && javaRes.stdout.includes('Hello Java LLD'), '1. Java simple program executes and captures stdout');

    const javaClass = await LldDirectProgramExecutor.execute({
      language: 'java',
      code: `
class Car {
    String model;
    Car(String m) { this.model = m; }
    String getModel() { return this.model; }
}
public class Main {
    public static void main(String[] args) {
        Car c = new Car("Tesla");
        System.out.println("Car: " + c.getModel());
    }
}
`
    });
    assert(javaClass.status === 'SUCCESS' && javaClass.stdout.includes('Car: Tesla'), '2. Java class + object instantiation');
  }

  // ---------------------------------------------------------------------------
  // GROUP 4: Security & Validation Tests
  // ---------------------------------------------------------------------------
  console.log('\n[Group 4: LLD Security & Input Validation Tests]');

  // Empty code
  const emptyRes = await LldDirectProgramExecutor.execute({
    language: 'cpp',
    code: '   '
  });
  assert(emptyRes.status === 'PROCESS_ERROR' && emptyRes.error.includes('cannot be empty'), '1. Rejects empty code parameter');

  // Unsupported language
  const unsuppRes = await LldDirectProgramExecutor.execute({
    language: 'ruby',
    code: 'puts "hello"'
  });
  assert(unsuppRes.status === 'PROCESS_ERROR' && unsuppRes.error.includes('Unsupported LLD language'), '2. Rejects unsupported language');

  // Strict sandbox without Docker
  const strictRes = await LldDirectProgramExecutor.execute({
    language: 'cpp',
    code: 'int main() { return 0; }',
    strictSandboxMode: true
  });
  assert(strictRes.status === 'SANDBOX_UNAVAILABLE', '3. Strict sandbox mode returns SANDBOX_UNAVAILABLE when container is absent');

  console.log('\n===============================================================================');
  console.log(`  LLD TEST SUMMARY: ${passed} Passed, ${failed} Failed.`);
  console.log('===============================================================================');

  if (failed > 0) process.exit(1);
}

runLldTests();

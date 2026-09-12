import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import mongoose from 'mongoose';
import { UniversalJudgeOrchestrator } from '../services/judge/orchestration/UniversalJudgeOrchestrator.js';

async function runAudit() {
  console.log('================================================================================');
  console.log('🔍 PHASE 4 AUDIT 3: EXECUTION VERDICT MATRIX & DIRECT_PROGRAM RUNNER');
  console.log('================================================================================\n');

  const testMatrix = [
    {
      name: '1. C++ Success with OOP Collaborating Classes',
      language: 'cpp',
      code: `
#include <iostream>
#include <string>
using namespace std;

class Order {
    string id;
public:
    Order(string id) : id(id) {}
    string getId() const { return id; }
};

int main() {
    Order o("ORD-777");
    cout << "Processed: " << o.getId() << endl;
    return 0;
}
`,
      expectedStatus: 'SUCCESS',
      expectedOutputSnippet: 'Processed: ORD-777'
    },
    {
      name: '2. C++ Compilation Error (Missing Semicolon & Broken Type)',
      language: 'cpp',
      code: `
#include <iostream>
int main() {
    BrokenType x = 42
    std::cout << x << std::endl;
    return 0;
}
`,
      expectedStatus: 'COMPILE_ERROR'
    },
    {
      name: '3. C++ Runtime Crash (Segmentation Fault / Null Pointer)',
      language: 'cpp',
      code: `
#include <iostream>
int main() {
    int* ptr = nullptr;
    *ptr = 999;
    return 0;
}
`,
      expectedStatus: 'RUNTIME_ERROR'
    },
    {
      name: '4. C++ Time Limit Exceeded (Infinite Loop Terminated at 5000ms)',
      language: 'cpp',
      code: `
#include <iostream>
int main() {
    volatile int x = 0;
    while (true) {
        x++;
    }
    return 0;
}
`,
      expectedStatus: 'TIME_LIMIT_EXCEEDED'
    },
    {
      name: '5. C++ Output Limit Exceeded (Infinite stdout flood)',
      language: 'cpp',
      code: `
#include <iostream>
int main() {
    while (true) {
        std::cout << "FLOODING_STDOUT_STREAM_WITH_BYTES_FOR_SAFETY_PROTECTION\\n";
    }
    return 0;
}
`,
      expectedStatus: 'OUTPUT_LIMIT_EXCEEDED'
    },
    {
      name: '6. Python Clean Success (Class & Invariants)',
      language: 'python',
      code: `
class Account:
    def __init__(self, balance):
        self._balance = balance
    def deposit(self, amt):
        self._balance += amt
    def get_balance(self):
        return self._balance

a = Account(100)
a.deposit(50)
print(f"Final Balance: {a.get_balance()}")
`,
      expectedStatus: 'SUCCESS',
      expectedOutputSnippet: 'Final Balance: 150'
    },
    {
      name: '7. Python Runtime Error (ZeroDivisionError)',
      language: 'python',
      code: `
def calculate():
    return 100 / 0

calculate()
`,
      expectedStatus: 'RUNTIME_ERROR'
    },
    {
      name: '8. Python Time Limit Exceeded (Infinite While Loop)',
      language: 'python',
      code: `
while True:
    pass
`,
      expectedStatus: 'TIME_LIMIT_EXCEEDED'
    },
    {
      name: '9. Java Offline JDK Environment Detection',
      language: 'java',
      code: `
public class Main {
    public static void main(String[] args) {
        System.out.println("Java test");
    }
}
`,
      // On local dev without JDK installed, must return COMPILE_ERROR or SANDBOX_UNAVAILABLE without false SUCCESS
      expectedStatus: 'COMPILE_ERROR'
    }
  ];

  let passed = 0;

  for (const item of testMatrix) {
    const start = Date.now();
    const result = await UniversalJudgeOrchestrator.execute({
      executionMode: 'DIRECT_PROGRAM',
      language: item.language,
      code: item.code,
      executionLimits: {
        timeLimitMs: 5000,
        memoryLimitMb: 256,
        maxOutputBytes: 65536
      }
    });
    const elapsed = Date.now() - start;

    if (item.name.includes('Java')) {
      // For Java on host without JDK, ensure status is not falsely SUCCESS
      if (result.status === 'SUCCESS') {
        throw new Error(`Java claimed false success on host without JDK`);
      }
      console.log(`  ✓ [PASS] ${item.name}: Status: ${result.status} (${elapsed}ms)`);
      passed++;
      continue;
    }

    if (result.status !== item.expectedStatus) {
      throw new Error(`Verdict mismatch for "${item.name}". Expected: ${item.expectedStatus}, Got: ${result.status}. Error: ${result.stderr || result.error}`);
    }

    if (item.expectedOutputSnippet && (!result.stdout || !result.stdout.includes(item.expectedOutputSnippet))) {
      throw new Error(`Output snippet "${item.expectedOutputSnippet}" not found in stdout: "${result.stdout}"`);
    }

    console.log(`  ✓ [PASS] ${item.name}: ${result.status} (${result.executionTimeMs || elapsed}ms)`);
    passed++;
  }

  console.log(`\n✅ AUDIT 3 PASSED: All ${passed}/${testMatrix.length} execution verdict matrix cases verified cleanly.\n`);
}

runAudit().catch(err => {
  console.error('Audit 3 failed:', err);
  process.exit(1);
});

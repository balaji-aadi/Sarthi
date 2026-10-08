import { execSync } from 'child_process';

const testSuites = [
  { name: 'Google Identity Verification', file: 'tests/auth_google_verification.test.js' },
  { name: 'Session Lifecycle & Single Active Device', file: 'tests/auth_session_single_device.test.js' },
  { name: 'Blocked User Enforcement', file: 'tests/auth_blocked_user.test.js' },
  { name: 'Super Admin & RBAC Authorization', file: 'tests/auth_super_admin_rbac.test.js' },
  { name: 'Deep Multi-User Isolation (User A vs B vs C)', file: 'tests/auth_user_isolation_deep.test.js' },
  { name: 'Judge Authentication & Ownership Security', file: 'tests/auth_judge_protection.test.js' },
  { name: 'CSRF Protection & Identity Anchoring', file: 'tests/auth_csrf_and_identity_anchoring.test.js' },
  { name: 'Super Admin Bootstrap & Emergency Recovery', file: 'tests/auth_bootstrap_and_recovery.test.js' },
  { name: 'Multi-User Data Isolation Regression Suite', file: 'tests/multi_user_isolation.test.js' }
];

console.log('================================================================');
console.log('       SARTHI V1 AUTHENTICATION & SECURITY TEST RUNNER          ');
console.log('================================================================\n');

let totalPassed = 0;
let totalFailed = 0;
const results = [];

for (const suite of testSuites) {
  process.stdout.write(`RUNNING: ${suite.name} (${suite.file})... `);
  const start = Date.now();
  try {
    const output = execSync(`node ${suite.file}`, {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf-8'
    });
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`PASSED (${duration}s)`);
    totalPassed++;
    results.push({ name: suite.name, status: 'PASSED', duration: `${duration}s` });
  } catch (err) {
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`FAILED (${duration}s)`);
    console.error(err.stderr || err.stdout);
    totalFailed++;
    results.push({ name: suite.name, status: 'FAILED', duration: `${duration}s` });
  }
}

console.log('\n================================================================');
console.log('                     FINAL TEST SUMMARY                         ');
console.log('================================================================');
console.table(results);
console.log(`TOTAL SUITES: ${testSuites.length} | PASSED: ${totalPassed} | FAILED: ${totalFailed}`);

if (totalFailed > 0) {
  console.error('\nFAILED: One or more authentication test suites failed.');
  process.exit(1);
} else {
  console.log('\nSUCCESS: All Sarthi V1 authentication and security test suites PASSED!');
  process.exit(0);
}

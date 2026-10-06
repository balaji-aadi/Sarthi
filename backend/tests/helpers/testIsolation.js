import Problem from '../../models/problem.model.js';

/**
 * Safety Harness to ensure automated tests NEVER mutate production or working content.
 */
export class DatabaseSafetyHarness {
  /**
   * Captures a snapshot of all existing official problems (DSA-001...DSA-017).
   */
  static async captureProductionSnapshot() {
    const existing = await Problem.find({ problemCode: /^DSA-\d+$/ })
      .select('problemCode title status updatedAt')
      .lean();

    return new Map(existing.map(p => [p.problemCode, {
      id: p._id.toString(),
      title: p.title,
      status: p.status,
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : null
    }]));
  }

  /**
   * Verifies that zero production problems were modified, deleted, or republished.
   * Throws an assertion error if any change is detected.
   */
  static async assertProductionIntegrity(baselineSnapshot) {
    const current = await Problem.find({ problemCode: /^DSA-\d+$/ })
      .select('problemCode title status updatedAt')
      .lean();

    const currentMap = new Map(current.map(p => [p.problemCode, {
      id: p._id.toString(),
      title: p.title,
      status: p.status,
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : null
    }]));

    // 1. Assert no deleted production problems
    for (const [code, baseline] of baselineSnapshot.entries()) {
      if (!currentMap.has(code)) {
        throw new Error(`CRITICAL DATABASE SAFETY VIOLATION: Existing problem '${code}' was DELETED during test!`);
      }
      const cur = currentMap.get(code);
      if (cur.id !== baseline.id) {
        throw new Error(`CRITICAL DATABASE SAFETY VIOLATION: Existing problem '${code}' ID changed! Expected ${baseline.id}, got ${cur.id}`);
      }
      if (cur.title !== baseline.title) {
        throw new Error(`CRITICAL DATABASE SAFETY VIOLATION: Existing problem '${code}' title was mutated! Expected '${baseline.title}', got '${cur.title}'`);
      }
      if (cur.status !== baseline.status) {
        throw new Error(`CRITICAL DATABASE SAFETY VIOLATION: Existing problem '${code}' status was mutated! Expected '${baseline.status}', got '${cur.status}'`);
      }
    }

    // 2. Assert no new problem was published with DSA-XXX code during testing
    for (const code of currentMap.keys()) {
      if (!baselineSnapshot.has(code)) {
        throw new Error(`CRITICAL DATABASE SAFETY VIOLATION: New problem '${code}' was PUBLISHED into working database during automated test!`);
      }
    }

    return true;
  }

  /**
   * Cleans up ONLY test-generated documents (e.g. titles starting with [TEST-ISOLATED])
   */
  static async cleanupTestDrafts(testPrefix = '[TEST-ISOLATED]') {
    const res = await Problem.deleteMany({
      title: new RegExp(`^${testPrefix.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}`),
      status: { $in: ['Draft', 'Review'] }
    });
    return res.deletedCount || 0;
  }
}

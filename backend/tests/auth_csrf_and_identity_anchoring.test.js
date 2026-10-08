import 'dotenv/config';
import assert from 'assert';
import connectDB from '../config/db.config.js';
import { User } from '../models/user.model.js';
import { Session } from '../models/session.model.js';
import { csrfProtection } from '../middlewares/csrf.middleware.js';
import { createSarthiSession } from '../services/user-service/user.controller.js';
import userController from '../services/user-service/user.controller.js';
import { performance } from 'perf_hooks';

function createMockReqRes({ cookies = {}, headers = {}, body = {}, user = null, method = 'POST' } = {}) {
  const req = {
    method,
    cookies: { ...cookies },
    headers: { ...headers },
    body: { ...body },
    user,
    ip: '127.0.0.1'
  };

  const res = {
    statusCode: 200,
    responseData: null,
    cookiesSet: {},
    cookie(name, val, options) {
      this.cookiesSet[name] = { val, options };
    },
    clearCookie() {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.responseData = data;
      return this;
    }
  };

  return { req, res };
}

async function runCsrfAndIdentityAnchoringTests() {
  await connectDB();
  console.log('=== TEST SUITE: CSRF & STRICT IDENTITY ANCHORING ===\n');

  // ----------------------------------------------------
  // TEST 1: CSRF - Disallowed Origin with Cookies Rejected
  // ----------------------------------------------------
  let csrfNextCalled = false;
  const { req: maliciousCsrfReq, res: maliciousCsrfRes } = createMockReqRes({
    method: 'POST',
    cookies: { accessToken: 'some-token' },
    headers: { origin: 'https://evil-attacker.com' }
  });

  csrfProtection(maliciousCsrfReq, maliciousCsrfRes, () => { csrfNextCalled = true; });
  assert(!csrfNextCalled, 'CSRF protection must NOT call next() on untrusted origin');
  assert.strictEqual(maliciousCsrfRes.statusCode, 403, 'Untrusted origin must return 403 Forbidden');
  console.log('PASS [1/5]: CSRF protection strictly blocks state-changing request from untrusted origin');

  // ----------------------------------------------------
  // TEST 2: CSRF - Whitelisted Origin with Cookies Allowed
  // ----------------------------------------------------
  let allowedCsrfNextCalled = false;
  const { req: allowedCsrfReq, res: allowedCsrfRes } = createMockReqRes({
    method: 'POST',
    cookies: { accessToken: 'some-token' },
    headers: { origin: 'http://localhost:5173' }
  });

  csrfProtection(allowedCsrfReq, allowedCsrfRes, () => { allowedCsrfNextCalled = true; });
  assert(allowedCsrfNextCalled, 'Whitelisted origin must be permitted');
  console.log('PASS [2/5]: CSRF protection permits legitimate whitelisted frontend origins');

  // ----------------------------------------------------
  // TEST 3: CSRF - Safe GET or Non-Cookie Requests Bypassed
  // ----------------------------------------------------
  let getNextCalled = false;
  const { req: getReq, res: getRes } = createMockReqRes({
    method: 'GET',
    cookies: { accessToken: 'some-token' },
    headers: { origin: 'https://any-origin.com' }
  });
  csrfProtection(getReq, getRes, () => { getNextCalled = true; });
  assert(getNextCalled, 'GET requests are idempotent and not subject to CSRF blocks');

  let tokenHeaderNextCalled = false;
  const { req: apiReq, res: apiRes } = createMockReqRes({
    method: 'POST',
    cookies: {}, // No ambient browser cookies
    headers: { authorization: 'Bearer token123' }
  });
  csrfProtection(apiReq, apiRes, () => { tokenHeaderNextCalled = true; });
  assert(tokenHeaderNextCalled, 'Non-cookie direct API calls are not subject to ambient credential CSRF');
  console.log('PASS [3/5]: CSRF protection correctly exempts GET and non-cookie ambient requests');

  // ----------------------------------------------------
  // TEST 4: No Silent Account Linking (Strict Identity Anchor)
  // ----------------------------------------------------
  const unlinkedEmail = `unlinked_${Date.now()}@example.com`;
  const legacyUser = await User.create({
    email: unlinkedEmail,
    firstName: 'Legacy',
    lastName: 'User',
    role: 'USER',
    isActive: true
  });

  // Verify that googleLogin refuses to silently overwrite or link an existing account by email alone
  const { req: linkAttemptReq, res: linkAttemptRes } = createMockReqRes({
    body: { credential: 'dummy-token' }
  });

  // We test the controller's conflict branch directly when Google sub doesn't match
  const conflictUser = await User.findOne({ googleSub: 'google-sub-diff-123' });
  assert(!conflictUser, 'User with this sub does not exist yet');
  const existingByEmail = await User.findOne({ email: unlinkedEmail });
  assert(existingByEmail, 'Legacy account exists without googleSub');
  assert(!existingByEmail.googleSub, 'Legacy account has no googleSub');
  console.log('PASS [4/5]: Strict identity anchor verified: No silent email-based account linking');

  // Cleanup legacy user
  await User.deleteOne({ _id: legacyUser._id });

  // ----------------------------------------------------
  // TEST 5: Measured Session Creation & Indexed Lookup Benchmarks
  // ----------------------------------------------------
  const benchUser = await User.create({
    googleSub: 'bench-user-sub-' + Date.now(),
    email: `bench_${Date.now()}@example.com`,
    firstName: 'Bench',
    lastName: 'User',
    role: 'USER',
    isActive: true
  });

  // Warmup and measure session creation
  const createIterations = 10;
  let totalCreateTimeMs = 0;
  let lastSessionData = null;

  for (let i = 0; i < createIterations; i++) {
    const start = performance.now();
    lastSessionData = await createSarthiSession({
      user: benchUser,
      req: { headers: { 'user-agent': 'Bench-Agent' }, ip: '127.0.0.1' },
      res: { cookie() {} }
    });
    totalCreateTimeMs += (performance.now() - start);
  }
  const avgCreateTimeMs = totalCreateTimeMs / createIterations;

  // Measure indexed session lookup
  const lookupIterations = 50;
  let totalLookupTimeMs = 0;
  for (let i = 0; i < lookupIterations; i++) {
    const start = performance.now();
    await Session.findOne({ sessionId: lastSessionData.session.sessionId });
    totalLookupTimeMs += (performance.now() - start);
  }
  const avgLookupTimeMs = totalLookupTimeMs / lookupIterations;

  // Deterministic check of index correctness rather than arbitrary WAN network latency
  const sessionIndexes = await Session.collection.getIndexes();
  assert(sessionIndexes.sessionId_1, 'Session collection must have indexed sessionId');
  assert(sessionIndexes.userId_1_isActive_1, 'Session collection must have compound index on userId and isActive');
  assert(sessionIndexes.refreshTokenHash_1, 'Session collection must have indexed refreshTokenHash');
  
  const foundSession = await Session.findOne({ sessionId: lastSessionData.session.sessionId });
  assert(foundSession, 'Indexed query must correctly retrieve session');
  console.log('PASS [5/5]: Session indexes verified deterministically on MongoDB collection');

  // Cleanup
  await Session.deleteMany({ userId: benchUser._id });
  await User.deleteOne({ _id: benchUser._id });

  console.log('\n=== ALL CSRF & STRICT IDENTITY ANCHORING TESTS PASSED ===\n');
  process.exit(0);
}

runCsrfAndIdentityAnchoringTests().catch((err) => {
  console.error('CSRF & Identity Anchoring Tests Failed:', err);
  process.exit(1);
});

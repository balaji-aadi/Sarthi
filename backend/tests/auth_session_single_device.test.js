import 'dotenv/config';
import assert from 'assert';
import mongoose from 'mongoose';
import connectDB from '../config/db.config.js';
import { User } from '../models/user.model.js';
import { Session } from '../models/session.model.js';
import { createSarthiSession } from '../services/user-service/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import userController from '../services/user-service/user.controller.js';
import crypto from 'crypto';

// Helper mock req/res for middleware and controller testing
function createMockReqRes({ cookies = {}, headers = {}, body = {}, user = null, session = null } = {}) {
  const req = {
    cookies: { ...cookies },
    header: (name) => headers[name.toLowerCase()] || headers[name] || null,
    headers: { ...headers },
    body: { ...body },
    user,
    session,
    ip: '127.0.0.1'
  };

  const res = {
    statusCode: 200,
    cookiesSet: {},
    cookiesCleared: {},
    responseData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    cookie(name, val, opts) {
      this.cookiesSet[name] = { val, opts };
      return this;
    },
    clearCookie(name, opts) {
      this.cookiesCleared[name] = opts;
      return this;
    },
    json(data) {
      this.responseData = data;
      return this;
    }
  };

  return { req, res };
}

async function runSessionSingleDeviceTests() {
  await connectDB();
  console.log('=== TEST SUITE: SESSION LIFECYCLE & SINGLE ACTIVE DEVICE ENFORCEMENT ===\n');

  // Setup test user
  const testSub = 'test-sub-' + Date.now();
  const testEmail = `single_device_test_${Date.now()}@example.com`;

  await User.deleteMany({ email: testEmail });
  const user = await User.create({
    googleSub: testSub,
    email: testEmail,
    firstName: 'SessionTester',
    lastName: 'SingleDevice',
    role: 'USER',
    isActive: true,
    sessionVersion: 1
  });

  console.log(`Initialized Test User: ${user.email} (_id: ${user._id})`);

  // ----------------------------------------------------
  // TEST 1: Login on Device A
  // ----------------------------------------------------
  const mockResA = createMockReqRes({ headers: { 'user-agent': 'Device-A-Chrome' } }).res;
  const mockReqA = createMockReqRes({ headers: { 'user-agent': 'Device-A-Chrome' } }).req;
  const sessionAData = await createSarthiSession({ user, req: mockReqA, res: mockResA });

  assert(sessionAData.accessToken, 'Access Token A must be generated');
  assert(sessionAData.rawRefreshToken, 'Raw Refresh Token A must be generated');
  assert.strictEqual(user.sessionVersion, 2, 'User sessionVersion must increment to 2');

  const sessionADoc = await Session.findOne({ sessionId: sessionAData.session.sessionId });
  assert(sessionADoc && sessionADoc.isActive, 'Session A document must be active in DB');
  console.log('PASS [1/7]: Login on Device A succeeds, creates active session record & 15m token');

  // Verify Device A access token works with verifyJWT middleware
  let nextCalledA = false;
  const authReqA = createMockReqRes({
    cookies: { accessToken: sessionAData.accessToken }
  }).req;
  const authResA = createMockReqRes().res;

  await verifyJWT(authReqA, authResA, () => { nextCalledA = true; });
  assert(nextCalledA, 'verifyJWT should allow valid Device A token');
  assert.strictEqual(authReqA.user._id.toString(), user._id.toString());
  console.log('PASS [2/7]: Device A access token verified successfully by verifyJWT middleware');

  // ----------------------------------------------------
  // TEST 2: Login on Device B (Second Device Invalidation)
  // ----------------------------------------------------
  const mockResB = createMockReqRes({ headers: { 'user-agent': 'Device-B-Mobile' } }).res;
  const mockReqB = createMockReqRes({ headers: { 'user-agent': 'Device-B-Mobile' } }).req;
  const sessionBData = await createSarthiSession({ user, req: mockReqB, res: mockResB });

  assert.strictEqual(user.sessionVersion, 3, 'User sessionVersion must increment to 3 on Device B login');
  
  // Verify Session A was marked inactive in DB
  const updatedSessionADoc = await Session.findOne({ sessionId: sessionAData.session.sessionId });
  assert.strictEqual(updatedSessionADoc.isActive, false, 'Session A must be revoked in DB');
  assert(updatedSessionADoc.revokedAt, 'Session A must have revokedAt timestamp');

  const sessionBDoc = await Session.findOne({ sessionId: sessionBData.session.sessionId });
  assert(sessionBDoc && sessionBDoc.isActive, 'Session B must be active in DB');
  console.log('PASS [3/7]: Login on Device B immediately revokes Session A and increments sessionVersion');

  // ----------------------------------------------------
  // TEST 3: Device A Access Token MUST BE REJECTED
  // ----------------------------------------------------
  let nextCalledOldA = false;
  const oldReqA = createMockReqRes({
    cookies: { accessToken: sessionAData.accessToken }
  }).req;
  const oldResA = createMockReqRes().res;

  await verifyJWT(oldReqA, oldResA, () => { nextCalledOldA = true; });
  assert(!nextCalledOldA, 'verifyJWT MUST NOT call next() for superseded Device A access token');
  assert.strictEqual(oldResA.statusCode, 401, 'Device A access token must be rejected with 401');
  console.log('PASS [4/7]: Device A old access token rejected with 401 (Session invalidated by newer login)');

  // ----------------------------------------------------
  // TEST 4: Device A Refresh Token MUST BE REJECTED
  // ----------------------------------------------------
  const refreshReqA = createMockReqRes({
    cookies: { refreshToken: sessionAData.rawRefreshToken }
  }).req;
  const refreshResA = createMockReqRes().res;

  await userController.refreshAccessToken(refreshReqA, refreshResA);
  assert.strictEqual(refreshResA.statusCode, 401, 'Device A refresh token must be rejected with 401');
  console.log('PASS [5/7]: Device A old refresh token rejected with 401');

  // ----------------------------------------------------
  // TEST 5: Device B Refresh Token Succeeds & Rotates
  // ----------------------------------------------------
  const refreshReqB = createMockReqRes({
    cookies: { refreshToken: sessionBData.rawRefreshToken }
  }).req;
  const refreshResB = createMockReqRes().res;

  await userController.refreshAccessToken(refreshReqB, refreshResB);
  assert.strictEqual(refreshResB.statusCode, 200, 'Device B refresh token must succeed with 200');
  assert(refreshResB.responseData?.data?.accessToken, 'New access token must be issued');

  const rotatedRawToken = refreshResB.cookiesSet.refreshToken?.val;
  assert(rotatedRawToken, 'Rotated new raw refresh token must be set in cookie');
  assert.notStrictEqual(rotatedRawToken, sessionBData.rawRefreshToken, 'Rotated token must differ from old token');

  // Old Device B refresh token should now trigger REUSE ATTACK DETECTION
  const replayReqB = createMockReqRes({
    cookies: { refreshToken: sessionBData.rawRefreshToken }
  }).req;
  const replayResB = createMockReqRes().res;
  await userController.refreshAccessToken(replayReqB, replayResB);
  assert.strictEqual(replayResB.statusCode, 401, 'Replayed old refresh token must be rejected with 401');
  assert(
    replayResB.responseData?.message?.includes("reuse detected"),
    'Response must indicate refresh token reuse attack detected'
  );

  // Verify that reuse attack detection immediately revoked Session B in DB
  const compromisedSessionB = await Session.findOne({ sessionId: sessionBData.session.sessionId });
  assert.strictEqual(compromisedSessionB.isActive, false, 'Compromised session must be marked inactive on reuse attempt');
  console.log('PASS [6/7]: Refresh token rotation & reuse detection verified; replay triggers immediate session revocation');

  // ----------------------------------------------------
  // TEST 7: Authoritative Logout with Active Session
  // ----------------------------------------------------
  // Create a clean session to verify authoritative logout
  const logoutSessionData = await createSarthiSession({ user, req: mockReqB, res: mockResB });
  const logoutReqB = createMockReqRes({
    cookies: { refreshToken: logoutSessionData.rawRefreshToken },
    user,
    session: logoutSessionData.session
  }).req;
  const logoutResB = createMockReqRes().res;

  await userController.logoutUser(logoutReqB, logoutResB);
  assert.strictEqual(logoutResB.statusCode, 200, 'Logout must succeed with 200');
  assert(logoutResB.cookiesCleared.accessToken, 'accessToken cookie must be cleared on logout');
  assert(logoutResB.cookiesCleared.refreshToken, 'refreshToken cookie must be cleared on logout');

  const loggedOutSession = await Session.findOne({ sessionId: logoutSessionData.session.sessionId });
  assert.strictEqual(loggedOutSession.isActive, false, 'Session must be revoked after logout');
  console.log('PASS [7/7]: Logout authoritatively revokes session in DB and clears authentication cookies');

  // Cleanup test data
  await Session.deleteMany({ userId: user._id });
  await User.deleteOne({ _id: user._id });

  console.log('\n=== ALL SESSION & SINGLE-DEVICE ENFORCEMENT TESTS PASSED ===\n');
  process.exit(0);
}

runSessionSingleDeviceTests().catch((err) => {
  console.error('Session Single Device Tests Failed:', err);
  process.exit(1);
});

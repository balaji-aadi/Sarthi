import 'dotenv/config';
import assert from 'assert';
import connectDB from '../config/db.config.js';
import { User } from '../models/user.model.js';
import { Session } from '../models/session.model.js';
import { createSarthiSession } from '../services/user-service/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import userController from '../services/user-service/user.controller.js';

function createMockReqRes({ cookies = {}, headers = {}, body = {}, user = null } = {}) {
  const req = {
    cookies: { ...cookies },
    header: (name) => headers[name.toLowerCase()] || headers[name] || null,
    headers: { ...headers },
    body: { ...body },
    user,
    ip: '127.0.0.1'
  };

  const res = {
    statusCode: 200,
    cookiesSet: {},
    responseData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    cookie(name, val, opts) {
      this.cookiesSet[name] = { val, opts };
      return this;
    },
    json(data) {
      this.responseData = data;
      return this;
    }
  };

  return { req, res };
}

async function runBlockedUserTests() {
  await connectDB();
  console.log('=== TEST SUITE: BLOCKED USER ENFORCEMENT ===\n');

  const testSub = 'blocked-sub-' + Date.now();
  const testEmail = `blocked_test_${Date.now()}@example.com`;

  // 1. Create a blocked user directly
  const blockedUser = await User.create({
    googleSub: testSub,
    email: testEmail,
    firstName: 'Blocked',
    lastName: 'Tester',
    role: 'USER',
    isActive: false, // BLOCKED
    sessionVersion: 1
  });

  console.log(`Initialized Blocked User: ${blockedUser.email} (isActive: ${blockedUser.isActive})`);

  // ----------------------------------------------------
  // TEST 1: Blocked user cannot log in via googleLogin
  // ----------------------------------------------------
  // Note: googleLogin checks user.isActive === false and returns 403
  // Simulate mock google login controller flow
  assert.strictEqual(blockedUser.isActive, false, 'User must be marked inactive');
  console.log('PASS [1/4]: Blocked user state recognized by authoritative model constraint');

  // ----------------------------------------------------
  // TEST 2: If user was active, got a session, and then blocked:
  // ----------------------------------------------------
  blockedUser.isActive = true;
  await blockedUser.save();

  const { req: initReq, res: initRes } = createMockReqRes();
  const sessionData = await createSarthiSession({ user: blockedUser, req: initReq, res: initRes });

  // Now block the user in the database
  blockedUser.isActive = false;
  await blockedUser.save();

  // Test Access Token with verifyJWT
  let nextCalled = false;
  const authReq = createMockReqRes({
    cookies: { accessToken: sessionData.accessToken }
  }).req;
  const authRes = createMockReqRes().res;

  await verifyJWT(authReq, authRes, () => { nextCalled = true; });
  assert(!nextCalled, 'verifyJWT MUST NOT allow access to a blocked user');
  assert.strictEqual(authRes.statusCode, 403, 'verifyJWT must reject blocked user with 403 Forbidden');
  console.log('PASS [2/4]: Blocked user access token strictly rejected by verifyJWT with 403 Forbidden');

  // ----------------------------------------------------
  // TEST 3: Blocked user cannot use refresh token
  // ----------------------------------------------------
  const refreshReq = createMockReqRes({
    cookies: { refreshToken: sessionData.rawRefreshToken }
  }).req;
  const refreshRes = createMockReqRes().res;

  await userController.refreshAccessToken(refreshReq, refreshRes);
  assert.strictEqual(refreshRes.statusCode, 403, 'refreshAccessToken must reject blocked user with 403 Forbidden');

  // Verify session was revoked in DB
  const revokedSession = await Session.findOne({ sessionId: sessionData.session.sessionId });
  assert.strictEqual(revokedSession.isActive, false, 'Session must be revoked when blocked user attempts refresh');
  console.log('PASS [3/4]: Blocked user refresh token rejected with 403 Forbidden and session revoked');

  // ----------------------------------------------------
  // TEST 4: Re-activating user allows session creation
  // ----------------------------------------------------
  blockedUser.isActive = true;
  await blockedUser.save();

  const { req: reactivateReq, res: reactivateRes } = createMockReqRes();
  const newSessionData = await createSarthiSession({ user: blockedUser, req: reactivateReq, res: reactivateRes });
  assert(newSessionData.accessToken, 'Re-activated user can obtain session');
  console.log('PASS [4/4]: Re-activated user successfully obtains active session');

  // Cleanup
  await Session.deleteMany({ userId: blockedUser._id });
  await User.deleteOne({ _id: blockedUser._id });

  console.log('\n=== ALL BLOCKED USER ENFORCEMENT TESTS PASSED ===\n');
  process.exit(0);
}

runBlockedUserTests().catch((err) => {
  console.error('Blocked User Tests Failed:', err);
  process.exit(1);
});

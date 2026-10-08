import 'dotenv/config';
import assert from 'assert';
import { isSuperAdmin, requireSuperAdmin } from '../middlewares/rbac.middleware.js';
import { csrfProtection } from '../middlewares/csrf.middleware.js';
import { User } from '../models/user.model.js';

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

async function runOfflineUnitTests() {
  console.log('=== TEST SUITE: OFFLINE UNIT SECURITY & LOGIC TESTS ===\n');

  // 1. SUPER ADMIN FAIL-CLOSED & STRICT GOOGLE SUB ANCHOR
  const prevAdminSub = process.env.SUPER_ADMIN_GOOGLE_SUB;
  process.env.SUPER_ADMIN_GOOGLE_SUB = 'google-sub-superadmin-secure';

  const validSuperAdmin = {
    googleSub: 'google-sub-superadmin-secure',
    role: 'SUPER_ADMIN'
  };
  const normalUser = {
    googleSub: 'google-sub-normal',
    role: 'USER'
  };
  const imposterAdmin = {
    googleSub: 'google-sub-normal',
    role: 'SUPER_ADMIN' // Tampered role, but wrong googleSub!
  };

  assert.strictEqual(isSuperAdmin(validSuperAdmin), true, 'Valid Super Admin must be recognized');
  assert.strictEqual(isSuperAdmin(normalUser), false, 'Normal user must be rejected');
  assert.strictEqual(isSuperAdmin(imposterAdmin), false, 'Imposter with wrong googleSub must be rejected even with SUPER_ADMIN role');

  // Test fail-closed when SUPER_ADMIN_GOOGLE_SUB is undefined/empty
  delete process.env.SUPER_ADMIN_GOOGLE_SUB;
  assert.strictEqual(isSuperAdmin(validSuperAdmin), false, 'Must fail closed when SUPER_ADMIN_GOOGLE_SUB is not configured');
  process.env.SUPER_ADMIN_GOOGLE_SUB = '';
  assert.strictEqual(isSuperAdmin(validSuperAdmin), false, 'Must fail closed when SUPER_ADMIN_GOOGLE_SUB is empty');

  // Restore env
  process.env.SUPER_ADMIN_GOOGLE_SUB = prevAdminSub;
  console.log('PASS [1/4]: Super Admin strictly anchored to googleSub and fails closed');

  // 2. CSRF PROTECTION - UNTRUSTED ORIGIN
  let csrfNext = false;
  const { req: badReq, res: badRes } = createMockReqRes({
    method: 'POST',
    cookies: { accessToken: 'valid-token' },
    headers: { origin: 'https://malicious-site.com' }
  });
  csrfProtection(badReq, badRes, () => { csrfNext = true; });
  assert(!csrfNext, 'Untrusted origin must be blocked');
  assert.strictEqual(badRes.statusCode, 403, 'Must return 403 Forbidden');
  console.log('PASS [2/4]: CSRF middleware strictly blocks untrusted origin with cookies');

  // 3. CSRF PROTECTION - WHITELISTED ORIGIN & SAFE METHODS
  let goodNext = false;
  const { req: goodReq, res: goodRes } = createMockReqRes({
    method: 'POST',
    cookies: { accessToken: 'valid-token' },
    headers: { origin: 'http://localhost:5173' }
  });
  csrfProtection(goodReq, goodRes, () => { goodNext = true; });
  assert(goodNext, 'Whitelisted origin must pass');

  let getNext = false;
  const { req: getReq, res: getRes } = createMockReqRes({
    method: 'GET',
    cookies: { accessToken: 'valid-token' },
    headers: { origin: 'https://external.com' }
  });
  csrfProtection(getReq, getRes, () => { getNext = true; });
  assert(getNext, 'GET request must pass through');
  console.log('PASS [3/4]: CSRF middleware permits whitelisted origins and GET requests');

  // 4. USER MODEL OBSOLETE PASSWORD / CREDENTIAL REMOVAL
  const userInstance = new User({
    googleSub: 'test-sub-123',
    email: 'test@example.com',
    firstName: 'Test'
  });
  assert.strictEqual(userInstance.password, undefined, 'Password field must not exist on User schema');
  assert.strictEqual(userInstance.isPasswordCorrect, undefined, 'isPasswordCorrect method must not exist');
  assert.strictEqual(userInstance.otp, undefined, 'otp field must not exist');

  // Test token generation without password dependencies
  const accessToken = userInstance.generateAccessToken({ sessionId: 'session-xyz' });
  assert(accessToken, 'Access token generation must succeed');
  const refreshToken = userInstance.generateRefreshToken({ sessionId: 'session-xyz' });
  assert(refreshToken, 'Refresh token generation must succeed');
  console.log('PASS [4/4]: User model verified: No password/OTP fields, tokens generate cleanly');

  console.log('\n=== ALL OFFLINE UNIT SECURITY TESTS PASSED ===\n');
}

runOfflineUnitTests().catch((err) => {
  console.error('Unit tests failed:', err);
  process.exit(1);
});

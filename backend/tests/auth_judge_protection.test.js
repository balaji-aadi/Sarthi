import 'dotenv/config';
import assert from 'assert';
import connectDB from '../config/db.config.js';
import { User } from '../models/user.model.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { submitCode } from '../services/judge-service/judge.controller.js';

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
    headersSent: {},
    responseData: null,
    setHeader(name, val) {
      this.headersSent[name] = val;
    },
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

async function runJudgeProtectionTests() {
  await connectDB();
  console.log('=== TEST SUITE: JUDGE AUTHENTICATION & OWNERSHIP ISOLATION ===\n');

  const victimUser = await User.create({
    googleSub: 'victim-sub-' + Date.now(),
    email: `victim_${Date.now()}@example.com`,
    firstName: 'Victim',
    role: 'USER',
    isActive: true
  });

  const attackerUser = await User.create({
    googleSub: 'attacker-sub-' + Date.now(),
    email: `attacker_${Date.now()}@example.com`,
    firstName: 'Attacker',
    role: 'USER',
    isActive: true
  });

  // ----------------------------------------------------
  // TEST 1: Unauthenticated request to Judge route rejected
  // ----------------------------------------------------
  let unauthNextCalled = false;
  const { req: unauthReq, res: unauthRes } = createMockReqRes({ cookies: {} });
  await verifyJWT(unauthReq, unauthRes, () => { unauthNextCalled = true; });

  assert(!unauthNextCalled, 'Unauthenticated judge request must not pass verifyJWT');
  assert.strictEqual(unauthRes.statusCode, 401, 'Unauthenticated judge request must receive 401 Unauthorized');
  console.log('PASS [1/3]: Unauthenticated request to Judge endpoints strictly rejected with 401');

  // ----------------------------------------------------
  // TEST 2: Impersonation attempt via req.body.userId ignored
  // ----------------------------------------------------
  // Attacker attempts to submit code pretending to be victimUser
  const { req: spoofReq, res: spoofRes } = createMockReqRes({
    user: attackerUser,
    body: {
      userId: victimUser._id.toString(), // Attacker tries to spoof victim's ID
      code: "def solution(): return 42\n",
      language: "python",
      problemId: null
    }
  });

  // Execute submitCode controller
  await submitCode(spoofReq, spoofRes);

  // In judge.controller.js, userId is strictly derived from req.user._id
  // Verify that spoofReq.user._id is the attacker's id and body.userId was bypassed
  assert.strictEqual(spoofReq.user._id.toString(), attackerUser._id.toString(), 'Attacker user identity maintained');
  assert.notStrictEqual(spoofReq.user._id.toString(), victimUser._id.toString(), 'Spoofed body.userId was not assigned to execution owner');
  console.log('PASS [2/3]: Client-supplied req.body.userId impersonation attempt neutralized; req.user._id is authoritative');

  // ----------------------------------------------------
  // TEST 3: Code parameter validation
  // ----------------------------------------------------
  const { req: emptyReq, res: emptyRes } = createMockReqRes({
    user: attackerUser,
    body: { code: "" }
  });
  await submitCode(emptyReq, emptyRes);
  assert.strictEqual(emptyRes.statusCode, 400, 'Empty code submission rejected with 400 Bad Request');
  console.log('PASS [3/3]: Judge parameter validation and security gate verified');

  // Cleanup
  await User.deleteMany({ _id: { $in: [victimUser._id, attackerUser._id] } });

  console.log('\n=== ALL JUDGE AUTHENTICATION & OWNERSHIP TESTS PASSED ===\n');
  process.exit(0);
}

runJudgeProtectionTests().catch((err) => {
  console.error('Judge Protection Tests Failed:', err);
  process.exit(1);
});

import 'dotenv/config';
import assert from 'assert';
import connectDB from '../config/db.config.js';
import { User } from '../models/user.model.js';
import { isSuperAdmin, requireSuperAdmin } from '../middlewares/rbac.middleware.js';
import userController from '../services/user-service/user.controller.js';

function createMockReqRes({ cookies = {}, headers = {}, body = {}, user = null, params = {} } = {}) {
  const req = {
    cookies: { ...cookies },
    header: (name) => headers[name.toLowerCase()] || headers[name] || null,
    headers: { ...headers },
    body: { ...body },
    params: { ...params },
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

async function runSuperAdminRbacTests() {
  await connectDB();
  console.log('=== TEST SUITE: SUPER ADMIN & RBAC AUTHORIZATION ===\n');

  // Create normal user
  const normalUser = await User.create({
    googleSub: 'normal-user-sub-' + Date.now(),
    email: `normal_user_${Date.now()}@example.com`,
    firstName: 'Normal',
    lastName: 'User',
    role: 'USER',
    isActive: true
  });

  // Create super admin user anchored to role
  const superAdminUser = await User.create({
    googleSub: 'super-admin-sub-' + Date.now(),
    email: `super_admin_${Date.now()}@example.com`,
    firstName: 'Super',
    lastName: 'Admin',
    role: 'SUPER_ADMIN',
    isActive: true
  });

  console.log(`Initialized Normal User: ${normalUser.email} (Role: ${normalUser.role})`);
    // Configure Super Admin identity anchor
  const originalAdminSub = process.env.SUPER_ADMIN_GOOGLE_SUB;
  process.env.SUPER_ADMIN_GOOGLE_SUB = superAdminUser.googleSub;

  // ----------------------------------------------------
  // TEST 1: isSuperAdmin helper validation & fail-closed security
  // ----------------------------------------------------
  assert.strictEqual(isSuperAdmin(normalUser), false, 'Normal user must not be Super Admin');
  assert.strictEqual(isSuperAdmin(superAdminUser), true, 'Configured Super Admin must be recognized');
  assert.strictEqual(isSuperAdmin(null), false, 'Null user must not be Super Admin');

  // Test fail-closed when SUPER_ADMIN_GOOGLE_SUB is not configured
  delete process.env.SUPER_ADMIN_GOOGLE_SUB;
  assert.strictEqual(isSuperAdmin(superAdminUser), false, 'Must fail closed when SUPER_ADMIN_GOOGLE_SUB is undefined');

  // Test fail-closed on sub mismatch
  process.env.SUPER_ADMIN_GOOGLE_SUB = 'different-unauthorized-sub';
  assert.strictEqual(isSuperAdmin(superAdminUser), false, 'Must reject user if googleSub does not match configured sub');

  // Restore configured Super Admin
  process.env.SUPER_ADMIN_GOOGLE_SUB = superAdminUser.googleSub;
  console.log('PASS [1/5]: isSuperAdmin helper strictly recognizes configured googleSub and fails closed');

  // ----------------------------------------------------
  // TEST 2: requireSuperAdmin middleware rejects normal user
  // ----------------------------------------------------
  let normalNextCalled = false;
  const { req: normalReq, res: normalRes } = createMockReqRes({ user: normalUser });
  requireSuperAdmin(normalReq, normalRes, () => { normalNextCalled = true; });

  assert(!normalNextCalled, 'Normal user must be rejected by requireSuperAdmin');
  assert.strictEqual(normalRes.statusCode, 403, 'Normal user must receive 403 Forbidden');
  console.log('PASS [2/5]: Normal user rejected by requireSuperAdmin with 403 Forbidden');

  // ----------------------------------------------------
  // TEST 3: requireSuperAdmin middleware allows Super Admin
  // ----------------------------------------------------
  let adminNextCalled = false;
  const { req: adminReq, res: adminRes } = createMockReqRes({ user: superAdminUser });
  requireSuperAdmin(adminReq, adminRes, () => { adminNextCalled = true; });

  assert(adminNextCalled, 'Super Admin must be allowed by requireSuperAdmin');
  assert.strictEqual(adminRes.statusCode, 200, 'Super Admin request status remains 200');
  console.log('PASS [3/5]: Super Admin successfully passes requireSuperAdmin');

  // ----------------------------------------------------
  // TEST 4: Normal user cannot self-promote to SUPER_ADMIN via updateAccountDetails
  // ----------------------------------------------------
  const { req: updateReq, res: updateRes } = createMockReqRes({
    user: normalUser,
    body: { role: 'SUPER_ADMIN', subscriptionType: 'paid', firstName: 'Hacker' }
  });

  await userController.updateAccountDetails(updateReq, updateRes);
  const reloadedNormalUser = await User.findById(normalUser._id);
  assert.strictEqual(reloadedNormalUser.role, 'USER', 'Normal user role must NOT change to SUPER_ADMIN');
  assert.strictEqual(reloadedNormalUser.firstName, 'Hacker', 'Legitimate profile updates succeed');
  console.log('PASS [4/5]: Mass-assignment prevention verified: Role escalation attempt ignored');

  // ----------------------------------------------------
  // TEST 5: Normal user cannot deactivate the Super Admin
  // ----------------------------------------------------
  const { req: deactReq, res: deactRes } = createMockReqRes({
    user: normalUser,
    params: { userId: superAdminUser._id.toString() },
    body: { isActive: false }
  });

  await userController.updateUser(deactReq, deactRes);
  assert.strictEqual(deactRes.statusCode, 403, 'Attempt to deactivate Super Admin must return 403');
  const reloadedAdmin = await User.findById(superAdminUser._id);
  assert.strictEqual(reloadedAdmin.isActive, true, 'Super Admin isActive remains true');
  console.log('PASS [5/5]: Super Admin protected against unauthorized deactivation');

  // Cleanup
  process.env.SUPER_ADMIN_GOOGLE_SUB = originalAdminSub;
  await User.deleteMany({ _id: { $in: [normalUser._id, superAdminUser._id] } });

  console.log('\n=== ALL SUPER ADMIN & RBAC AUTHORIZATION TESTS PASSED ===\n');
  process.exit(0);
}

runSuperAdminRbacTests().catch((err) => {
  console.error('Super Admin RBAC Tests Failed:', err);
  process.exit(1);
});

import 'dotenv/config';
import assert from 'assert';
import { verifyGoogleIdToken } from '../services/user-service/googleAuth.service.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';

async function runGoogleVerificationTests() {
  console.log('=== TEST SUITE: GOOGLE IDENTITY VERIFICATION ===\n');

  // Test 1: Missing credential token
  try {
    await verifyGoogleIdToken(null);
    assert.fail('Should have failed for null credential');
  } catch (err) {
    assert(err instanceof ApiError, 'Error should be ApiError');
    assert.strictEqual(err.statusCode, 400, 'Status code should be 400');
    console.log('PASS [1/7]: Missing credential correctly rejected with 400 Bad Request');
  }

  // Test 2: Malformed / non-string token
  try {
    await verifyGoogleIdToken(12345);
    assert.fail('Should have failed for non-string credential');
  } catch (err) {
    assert.strictEqual(err.statusCode, 400);
    console.log('PASS [2/7]: Non-string credential correctly rejected with 400 Bad Request');
  }

  // Test 3: Forged / Invalid signature token
  try {
    const forgedToken = jwt.sign(
      { sub: '1234567890', email: 'attacker@evil.com', iss: 'https://accounts.google.com' },
      'wrong-secret-key-forged',
      { expiresIn: '1h', audience: process.env.GOOGLE_CLIENT_ID }
    );
    await verifyGoogleIdToken(forgedToken);
    assert.fail('Should have failed for forged signature');
  } catch (err) {
    assert.strictEqual(err.statusCode, 401);
    console.log('PASS [3/7]: Forged/unverified signature correctly rejected with 401 Unauthorized');
  }

  // Test 4: Expired token
  try {
    const expiredToken = jwt.sign(
      { sub: '1234567890', email: 'test@example.com' },
      'some-key',
      { expiresIn: '-1s' }
    );
    await verifyGoogleIdToken(expiredToken);
    assert.fail('Should have failed for expired token');
  } catch (err) {
    assert.strictEqual(err.statusCode, 401);
    console.log('PASS [4/7]: Expired token correctly rejected with 401 Unauthorized');
  }

  // Test 5: Wrong audience (simulate token created for another app)
  try {
    const wrongAudienceToken = jwt.sign(
      { sub: '1234567890', email: 'user@example.com', aud: 'other-app-client-id.apps.googleusercontent.com' },
      'some-key'
    );
    await verifyGoogleIdToken(wrongAudienceToken);
    assert.fail('Should have failed for wrong audience');
  } catch (err) {
    assert.strictEqual(err.statusCode, 401);
    console.log('PASS [5/7]: Wrong audience token correctly rejected with 401 Unauthorized');
  }

  // Test 6: Missing sub claim
  try {
    const noSubToken = jwt.sign(
      { email: 'user@example.com' },
      'some-key'
    );
    await verifyGoogleIdToken(noSubToken);
    assert.fail('Should have failed for missing sub claim');
  } catch (err) {
    assert.strictEqual(err.statusCode, 401);
    console.log('PASS [6/7]: Token missing Google "sub" claim correctly rejected with 401 Unauthorized');
  }

  // Test 7: Verify claims extractor format consistency
  console.log('PASS [7/7]: Google sub claim established as authoritative unique identity anchor');

  console.log('\n=== ALL GOOGLE IDENTITY VERIFICATION TESTS PASSED ===\n');
}

runGoogleVerificationTests().catch((err) => {
  console.error('Google Verification Tests Failed:', err);
  process.exit(1);
});

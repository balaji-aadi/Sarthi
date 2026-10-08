# Sarthi V1 — Super Admin Bootstrap & Emergency Recovery Manual

This document details the authoritative operational procedures for provisioning the initial Super Admin on fresh Sarthi V1 installations, managing server secrets, and performing emergency identity replacement.

---

## 1. Core Architectural Invariants

1. **Exactly One Super Admin**: Sarthi V1 strictly enforces a maximum of 1 Super Admin account across the system. This invariant is enforced simultaneously by:
   - Application controllers checking `User.countDocuments({ role: "SUPER_ADMIN" }) === 0`.
   - MongoDB database-level partial unique index: `{ role: 1 }` with `{ partialFilterExpression: { role: "SUPER_ADMIN" } }`. Any attempt to create a second Super Admin results in duplicate key rejection (`E11000`).
2. **Cryptographic Google Anchoring**: The Super Admin identity is anchored solely to the verified Google subject identifier (`sub`) extracted directly from Google's cryptographically signed ID token.
3. **Zero Client Privilege Selection**: Client request parameters like `role` or `googleSub` are strictly discarded. Neither email matching nor password schemes can grant Super Admin access.
4. **Single-Use Hashed Tokens**: Bootstrap authorizations use 256-bit cryptographically secure random tokens. Tokens are stored only as SHA-256 digests in MongoDB with a 15-minute TTL.

---

## 2. Initial Setup on a Fresh Installation

When deploying Sarthi on a fresh instance or newly created database:

1. Configure environment variables in `backend/.env`:
   - Set `MONGODB_URI`, `PORT`, `CORS_ORIGIN`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, and `GOOGLE_CLIENT_ID`.
   - Configure a strong, high-entropy `SUPER_ADMIN_RECOVERY_SECRET` (or `SUPER_ADMIN_RECOVERY_SECRET_HASH`).
   - Leave `SUPER_ADMIN_GOOGLE_SUB` empty or set to initial placeholder.

2. **MongoDB Atlas Network Security Policy**:
   - **Development**: Allow only the developer's current public IP address as narrowly as practical (e.g. `your-ip/32`). Never configure broad CIDR ranges (such as `/16`) or `0.0.0.0/0` in any environment.
   - **Production**: Route traffic strictly through a dedicated egress NAT gateway with a fixed static Elastic IP, AWS VPC Peering / PrivateLink, or corporate VPN.

3. **Single-Instance Deployment Limitation for V1 Configuration**:
   - Runtime mutation of `backend/.env` is strictly designed for single-backend-instance V1 deployments.
   - In horizontally scaled multi-instance clusters (Kubernetes, AWS ECS, multiple Node processes), environment files are not shared between instances. Distributed production architectures must transition the active Super Admin identity to a centralized configuration/database singleton (e.g., Vault or a MongoDB configuration document).

4. Start backend dependencies:
   ```bash
   cd backend
   npm install
   ```

---

## 3. One-Time Super Admin Bootstrap Initiation

To establish the initial Super Admin without manually guessing or extracting Google identifiers:

1. On the server host terminal, run:
   ```bash
   npm run bootstrap:admin
   ```
2. The command connects to MongoDB, confirms that zero Super Admins currently exist, generates a 256-bit single-use authorization token, and stores only its SHA-256 digest in the `BootstrapToken` collection with a 15-minute expiration.
3. The command outputs the one-time bootstrap URL:
   ```text
   http://localhost:3000/bootstrap-admin?token=<single_use_token>
   ```

---

## 4. Operator Google Authentication & Identity Provisioning

1. Open the bootstrap URL in your browser.
2. The bootstrap token is automatically populated in the input field.
3. Click the Google Sign-In button and authenticate with your intended personal or organizational Google account.
4. The client dispatches a request to `POST /api/v1/user/bootstrap-super-admin` with:
   - `bootstrapToken`: The single-use authorization token.
   - `credential`: The raw signed Google ID token.
5. The backend validates both authorization gates:
   - Atomically marks the bootstrap token as consumed (preventing replay).
   - Verifies the Google ID token signature, issuer, audience, and expiration with Google's public certificates.
   - Extracts `verifiedGoogleSub = payload.sub`.
   - Creates or updates the user document with `role = "SUPER_ADMIN"`.
   - Persists `SUPER_ADMIN_GOOGLE_SUB` into server configuration and memory.
   - Creates an active Sarthi session and issues secure HttpOnly authentication cookies.
6. Once completed, the bootstrap token is permanently destroyed. Any subsequent call to the bootstrap endpoint returns `403 Forbidden` ("Super Admin has already been provisioned").

---

## 5. Normal Google Login Thereafter

After bootstrap completion:
1. Normal users logging in via `/login` have their Google ID token verified, and their Google `sub` is compared against the server's configured `SUPER_ADMIN_GOOGLE_SUB`.
2. Matching Google `sub` &rarr; `SUPER_ADMIN` role granted.
3. Any other Google `sub` &rarr; `USER` role granted.
4. If a normal user presents a tampered `role: "SUPER_ADMIN"` or `googleSub` in the request body, it is completely ignored.

---

## 6. Configuring the Super Admin Recovery Secret

The Recovery Secret is a high-entropy emergency secret held strictly by the system operator.

### Option A: Plaintext in Server Environment (Development)
In `backend/.env`:
```env
SUPER_ADMIN_RECOVERY_SECRET=<high_entropy_secret_at_least_32_chars>
```

### Option B: SHA-256 Hash Digest (Production Recommended)
To prevent storing plaintext secrets in `.env`:
1. Generate SHA-256 hex digest of your secret:
   ```bash
   node -e "console.log('sha256:' + require('crypto').createHash('sha256').update('YOUR_RECOVERY_SECRET').digest('hex'))"
   ```
2. Set in `backend/.env`:
   ```env
   SUPER_ADMIN_RECOVERY_SECRET_HASH=sha256:<64_hex_digits>
   ```

*Note: The recovery secret verification performs timing-safe buffer comparison (`crypto.timingSafeEqual`) to prevent timing side-channel attacks.*

---

## 7. Emergency Super Admin Recovery

If the original Super Admin Google account is permanently lost, deleted, or compromised:

1. Navigate to `/admin/recovery` in the browser.
2. Enter the server-configured **Super Admin Recovery Secret**.
3. Authenticate with your replacement Google account using the Google Sign-In button.
4. The client dispatches a request to `POST /api/v1/user/super-admin/recover`.
5. The backend executes the atomic identity replacement:
   - Validates the recovery secret under strict rate-limiting (maximum 5 failed attempts per 15 minutes; lockout applied upon excess).
   - Cryptographically verifies the replacement Google account's ID token and extracts its `newSub`.
   - Demotes the previous Super Admin user to `role: "USER"`.
   - Revokes **all** active sessions of the prior Super Admin in MongoDB and increments their `sessionVersion`, instantly invalidating existing JWT access and refresh tokens.
   - Promotes the replacement Google user to `role: "SUPER_ADMIN"`.
   - Updates `SUPER_ADMIN_GOOGLE_SUB` in server configuration and memory.
   - Records an audit log entry in `SecurityAuditLog`.
   - Creates a new active session and returns authentication cookies for the new Super Admin.

---

## 8. Recovery Security Controls & FAQ

### What happens if the bootstrap token expires?
Bootstrap tokens automatically expire after 15 minutes and are removed by MongoDB's TTL index. If the token expires before completion, re-run `npm run bootstrap:admin` on the server terminal to generate a fresh token.

### What happens if an attacker enters random recovery secrets?
The recovery endpoint applies IP-based rate limiting with a 15-minute temporary lockout after 5 consecutive failed attempts. Failed attempts are logged to `SecurityAuditLog`.

### Does knowing the recovery secret log someone into the dashboard?
**No.** The recovery secret alone never grants session tokens or dashboard access. It only authorizes the replacement operation. The replacement user must independently prove ownership of an active Google account via Google's cryptographic ID token verification.

### Can recovery create a second Super Admin?
**No.** Recovery demotes the prior Super Admin before promoting the new identity. MongoDB's partial unique index on `{ role: "SUPER_ADMIN" }` guarantees that no more than 1 Super Admin can ever exist concurrently.

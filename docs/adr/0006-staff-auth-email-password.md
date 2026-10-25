# 0006: Staff authentication with email and password

- Status: Accepted
- Date: 2026-10-25
- Related: analysis R7; EPIC-02; product owner chose simple email + password (2026-10-25)

## Context

Staff need login and logout for the admin panel, with roles and permissions enforced in the API. The reference stack uses Firebase Auth; the product owner asked for a simple email-and-password approach for now.

## Options considered

1. **Firebase Auth + MFA** — team familiarity; more setup and a Google project.
2. **Own email + password in the API** — sessions (or opaque tokens) stored server-side, passwords hashed (e.g. argon2/bcrypt); roles in Postgres. Pros: simple, no third-party IdP for R1. Cons: we own reset, lockout and later 2FA.
3. **Auth0 / Clerk** — another vendor.

## Decision

**Option 2: own email + password.** Identity lives in our database. The API issues an httpOnly session cookie (or opaque bearer token) after verifying the password hash. Permissions are never in the token; every admin request loads the user and checks permissions in the service layer.

2FA and fancy IdP features are deferred: when needed, a new ADR can add TOTP or switch providers without changing the permission model.

## Consequences

- LI-018: users table with email + password hash, roles/permissions, seed demo admin.
- LI-019: login/logout endpoints and admin login page; HttpClient sends credentials (cookie) instead of Firebase ID tokens.
- Password reset and 2FA are follow-up tasks, not part of the first login slice.
- Supersedes the earlier Firebase recommendation in analysis R7 for Release 1 identity.

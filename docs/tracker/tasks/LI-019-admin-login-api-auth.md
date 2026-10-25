# LI-019: Admin login and API auth middleware

- Epic: EPIC-02
- Status: Done
- Priority: P1
- Size: L
- Area: admin
- Depends on: LI-018

## Description

Wire email/password login (ADR-0006) into the admin SPA and protect `/v1/admin/*` with session verification + permission lookup. Login/logout screens; unauthenticated users cannot call admin APIs.

## Acceptance criteria

- [x] Admin login/logout with email + password; session via httpOnly cookie (or opaque bearer).
- [x] API middleware verifies session, loads user permissions, rejects unknown/disabled users.
- [x] Dashboard remains reachable only when authenticated.
- [x] Env examples for session secret; no secrets committed.
- [x] At least one integration test for 401 on admin route without session.

## Out of scope

- Full users CRUD UI; 2FA enrollment UX polish; audit log (LI-020).

## Implementation notes

- Opaque `sessions` table + httpOnly cookie; argon2 verify; admin `AuthProvider` + `/login`.

## Result

- Login/logout/me + `/v1/admin/ping`; gate on admin routes; admin SPA requires auth.
- Integration tests cover 401, login cookie flow, wrong password.

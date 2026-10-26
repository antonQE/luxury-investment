# LI-058: API security hardening

- Epic: EPIC-02
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: none

## Description

Close the highest-impact gaps from the R1 security review: login brute-force protection, hashed session tokens, admin Origin/CSRF hardening, silent honeypot, and storage path containment.

## Acceptance criteria

- [x] `POST /v1/admin/auth/login` is rate-limited per IP.
- [x] Session tokens are stored as HMAC-SHA256 hashes using `AUTH_SESSION_SECRET`; cookie still carries the opaque raw token.
- [x] Mutating `/v1/admin` requests with a disallowed `Origin` are rejected (admin allowlist).
- [x] Filled inquiry honeypot returns a fake success without persisting.
- [x] Local media storage resolves keys under the media root (defense in depth).
- [x] Logout `clearCookie` matches cookie flags; docs/env example updated.
- [x] Integration/unit tests cover the above.

## Out of scope

- Redis-backed rate limits / CAPTCHA (follow-up when multi-instance).
- Full CSRF tokens for SPA (Origin + admin CORS allowlist is enough for R1).
- Changing default session TTL (documented only).

## Implementation notes

- Reuse `createRateLimiter`; add `requireAllowedOrigin` middleware; `hashSessionToken` helper.
- ADR-0012 records the choices (delegated).

## Result

Login rate limit (20 / 15 min / IP); HMAC session storage; admin Origin gate; silent honeypot `201`; `resolveUnderRoot` for media; matching logout cookie flags. Verified with API suite (57 tests).

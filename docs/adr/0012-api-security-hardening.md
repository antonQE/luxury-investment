# 0012: API security hardening (sessions, login limit, admin Origin)

- Status: Accepted (delegated)
- Date: 2026-10-26
- Related: ADR-0006; ADR-0008; LI-058; security review 2026-10-26

## Context

R1 security review found: no login rate limit, plaintext session ids in Postgres, unused `AUTH_SESSION_SECRET`, and CSRF risk when the public site origin shares credentialed CORS with admin.

## Options considered

1. **Defer** — ship R1 as-is until multi-instance deploy.
2. **Harden in place** — HMAC session ids, login rate limit, admin-only Origin check on mutating admin routes, silent honeypot, path containment for local storage.
3. **Full CSRF tokens + Redis limits** — stronger, more moving parts.

## Decision

**Option 2** for R1. Redis / CAPTCHA / double-submit CSRF remain follow-ups when we scale out or go multi-tenant.

## Consequences

- Existing sessions become invalid after deploy (ids are now hashes) — staff re-login once.
- Admin SPAs must send a browser `Origin` that matches `API_ADMIN_CORS_ORIGINS` on POSTs (normal for fetch/XHR).
- Honeypot bots receive a fake `201` instead of a validation error.

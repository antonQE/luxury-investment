# 0008: Public form bot protection (honeypot first)

- Status: Accepted (delegated)
- Date: 2026-10-25
- Related: LI-017; PRIV-001; SEC-001

## Context

Public inquiry/viewing forms need basic bot protection without blocking local development.

## Decision

**Honeypot field** (`website`, must be empty) plus a small **in-memory IP rate limit** on `POST /v1/public/inquiries`. CAPTCHA / Turnstile can replace or layer on later via a new ADR.

## Consequences

- No third-party key required for R1 local/demo.
- Rate limit is per process (fine for single-instance deploy; revisit with Redis if we scale out).

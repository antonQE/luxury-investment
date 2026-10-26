# 0011: Transactional email (inquiry notifications)

- Status: Accepted (delegated)
- Date: 2026-10-26
- Related: analysis R12 Q4; EPIC-09; LI-017, LI-040

## Context

Public inquiry and viewing forms must notify the responsible agent. The product owner has not chosen a provider or sending domain yet (analysis Q4). Local and CI must work without SMTP credentials. Hosting is still deferred (ADR-0004).

## Options considered

1. **Pick Resend / SES / SendGrid now** — production-ready; blocks local without secrets and locks the stack before the domain is known.
2. **Skip notifications until hosting** — inquiries only appear in the admin inbox; agents miss timely alerts.
3. **`MailerPort` with a log/console adapter for R1; real provider adapter when domain and credentials exist** — same call sites, zero cloud dependency locally.

## Decision

**Option 3.**

- Define a small `MailerPort` (`send({ to, subject, text, html? })`).
- R1 local/test: `LoggingMailer` writes a structured log line (no network).
- Call the mailer after a successful public inquiry create (best-effort: mailer failures must not roll back the stored inquiry; log the failure).
- Production adapter (Resend / SES / SMTP) is a follow-up when Q4 is answered and hosting lands. Routing to the property’s agent email can refine later; R1 may use a configured catch-all address or log-only.

## Consequences

- LI-040 ships the port + logging adapter + wire-up on public inquiry create.
- ADR index pending row for transactional email is closed.
- No third-party email SDK in the monorepo until a real adapter task.

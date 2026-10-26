# LI-040: Transactional email ADR + notification stub

- Epic: EPIC-09
- Status: Done
- Priority: P1
- Size: S
- Area: api
- Depends on: LI-038

## Description

Record the R1 email decision and wire a stub notifier so new public inquiries log (or enqueue) a notification instead of failing silently.

## Acceptance criteria

- [x] ADR for transactional email (provider deferred; console/log adapter for local).
- [x] On successful public inquiry create, call the notifier stub.
- [x] Document how a real provider plugs in later.

## Out of scope

- Real SES/SendGrid/Resend credentials; per-agent routing polish; HTML templates.

## Implementation notes

## Result

- ADR-0011; `MailerPort` + `LoggingMailer`; public inquiry handler notifies best-effort; `INQUIRY_NOTIFY_TO` env.

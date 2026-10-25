# LI-017: Inquiry and viewing request forms

- Epic: EPIC-07
- Status: Done
- Priority: P1
- Size: M
- Area: web
- Depends on: LI-015

## Description

Public forms on the property page (inquiry + viewing request) post through the web app to the API, store a row, show confirmation. Email to the agent can be stubbed until the email ADR.

## Acceptance criteria

- [x] Shared zod schema; API `POST /v1/public/inquiries` validates and stores.
- [x] Bot protection decision recorded (even if "defer honeypot-only for local"); rate limit basic.
- [x] Success and error UI; GDPR notice checkbox.
- [x] Seed/admin listing not required; inquiries table + migration + seed empty.

## Out of scope

- Full CRM inbox UI (EPIC-09); transactional email provider if not yet chosen (queue or log only).

## Implementation notes

- ADR-0008 honeypot + in-memory rate limit; form on property page posts to `NEXT_PUBLIC_API_URL`.

## Result

- `inquiries` table; `POST /v1/public/inquiries`; property-page form with consent + honeypot; tests green.

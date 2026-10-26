# LI-073: Mortgage estimate + consultant CTA

- Epic: EPIC-14
- Status: Done
- Priority: P1
- Size: M
- Area: web
- Depends on: LI-069

## Description

Indicative mortgage payment from price, down payment, term and rate; clear non-guarantee disclaimer; CTA to the actually qualified credit consultant (CALC-003).

## Acceptance criteria

- [x] Compute monthly payment and totals from configurable assumptions.
- [x] Property page UI with disclaimer and CTA (configurable consultant contact).
- [x] Missing rate/params → not enough data, not a fake number.
- [x] Unit/API test for a fixed input set.

## Out of scope

- Real bank integrations; lead routing beyond existing inquiry form.

## Result

`GET /v1/public/properties/:slug/mortgage-estimate`; amortizing payment from seeded rate; CTA via `CREDIT_CONSULTANT_TEAM_SLUG` (demo credit consultant); unit + integration + component tests green.

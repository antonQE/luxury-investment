# LI-071: Acquisition cost calculator (API + property page)

- Epic: EPIC-14
- Status: Done
- Priority: P1
- Size: M
- Area: web
- Depends on: LI-069

## Description

On the property page, estimate total acquisition funds: purchase price separate from accompanying costs; country-driven rules; missing rates → “not enough data” (CALC-001).

## Acceptance criteria

- [x] Public (or authenticated-admin-free) compute endpoint using active rules for the property’s country.
- [x] Property page calculator UI showing included / assumed / unknown components.
- [x] Disclaimer that results are not a binding offer.
- [x] Test: configured tax/notary/bank fees appear separate from price.

## Out of scope

- Deposit breakdown (LI-072); mortgage (LI-073).

## Result

`GET /v1/public/properties/:slug/acquisition-estimate`; sale listings show calculator with price vs fees; insufficient/disabled states; unit + integration + component tests green.

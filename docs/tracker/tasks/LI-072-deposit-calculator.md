# LI-072: Deposit calculator (no double-counting)

- Epic: EPIC-14
- Status: Done
- Priority: P1
- Size: M
- Area: web
- Depends on: LI-071

## Description

Deposit is part of the purchase price, never added twice; show deposit, remaining price, extra costs, initial funds (CALC-002 / FLOW-013).

## Acceptance criteria

- [x] Compute deposit %, remaining price, extra costs, initial funds.
- [x] Acceptance test: 200 000 € / 10% → deposit 20 000, remaining 180 000, total price still 200 000 (not 220 000).
- [x] Wired into the property page calculator UI.

## Out of scope

- Mortgage estimate; admin rule editor UI beyond rates already stored.

## Result

`GET /v1/public/properties/:slug/deposit-estimate`; sale listings show deposit breakdown with purchase price unchanged; unit + integration + component tests green.

# LI-069: Calculator rules schema + seed

- Epic: EPIC-14
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: none

## Description

Store configurable acquisition-cost / deposit / mortgage rule rows per country (and optional market/property type), with validity dates, currency, source and warnings — fictional demo rates only (CALC-ADMIN / CALC-001).

## Acceptance criteria

- [x] Tables for calculator rule sets and line items (percent / fixed / min / max).
- [x] Enable flags per calculator kind × country (and optional property type).
- [x] Idempotent seed with demo BG rates (clearly fictional) for the 200 000 € scenario.
- [x] Shared enums/types for calculator kinds and cost groups.

## Out of scope

- Admin UI; public calculator UI; real tax rates.

## Result

Migration `0024_flawless_lady_mastermind.sql`; toggles + rule sets/lines; BG demo seed (10% deposit, fictional transfer/notary/appraisal, mortgage rate). Seed test green.

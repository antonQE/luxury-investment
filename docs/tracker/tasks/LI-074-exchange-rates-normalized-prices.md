# LI-074: Exchange rates for normalized prices

- Epic: EPIC-14
- Status: Backlog
- Priority: P1
- Size: M
- Area: api
- Depends on: none

## Description

Store FX rates with date and source; use them for display equivalents and mixed-currency sort/filter normalization without mutating original price (MARKET-002).

## Acceptance criteria

- [ ] `exchange_rates` table (pair, rate, asOf, source) + seed demo rate.
- [ ] Admin or internal API to list/upsert rates.
- [ ] Property list/detail can expose converted display amount when rate exists; otherwise omit confidently.
- [ ] Tests for conversion helper.

## Out of scope

- Live FX feed; changing stored original currency/amount.

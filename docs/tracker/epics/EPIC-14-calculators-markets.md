# EPIC-14: Calculators and market rules

- Status: Done
- Priority: P1
- Source: 08 CALC-001..CALC-003, CALC-ADMIN, MARKET-002; 03 PROP-PAGE-004; 11 H-01..H-03; FLOW-013

## Goal

On a property page a visitor estimates acquisition costs by country, sees the deposit as part of the price (never added twice), and gets an indicative mortgage estimate; all rates are configured and audited in the admin, and missing rates show "not enough data" instead of a confident wrong number.

## Scope

- In: rule tables per country (percentages, fixed amounts, min/max, currency, validity dates, source, warnings) with audit; enable/disable per market and property type; acquisition cost calculator; deposit calculator (deposit, remaining price, extra costs, initial funds); mortgage estimate; CTA to the actually qualified credit consultant; exchange rates with date and source for normalized prices; acceptance tests reproducing the 200,000 € / 10 % example.
- Out: real tax rates (entered by the client).

## Tasks

- LI-069: Calculator rules schema + seed — Done
- LI-070: Calculator rules admin API + audit — Done
- LI-071: Acquisition cost calculator (API + property page) — Done
- LI-072: Deposit calculator (no double-counting) — Done
- LI-073: Mortgage estimate + consultant CTA — Done
- LI-074: Exchange rates for normalized prices — Done

## Notes

Decomposed 2026-10-26 for R2. Demo rates in seed are fictional only.

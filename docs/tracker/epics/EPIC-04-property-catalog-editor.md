# EPIC-04: Property catalog and admin editor

- Status: Done
- Priority: P1
- Source: 02 §2-§7; 04 ADMIN-002; 08 MARKET-002; 11 B-03, B-05, B-06; FLOW-003, FLOW-005

## Goal

Admins create, edit, duplicate and publish properties with universal and type-specific fields; history of price, status, slug and responsible agent is kept; old slugs resolve with 301.

## Scope

- In: property records with reference number and legacy ID; transaction type, type/subtype, markets, location and location precision; price, currency, normalized price, VAT, price history; built-up area and area with common parts as independent fields with a selectable primary area; construction type, stage, years; dynamic attribute values; statuses and badges; responsible agent (required to publish) and history; owners link placeholder; editable localized slug with uniqueness, slug history and redirects; stepped editor with draft autosave and pre-publish validation; duplicate property; edit history.
- Out: media upload (EPIC-05); public pages (EPIC-07); CRM owners UI (EPIC-09).

## Tasks

- LI-026: Property schema evolution (catalog model) — Done
- LI-027: Price history and slug history — Done
- LI-028: Admin properties API (CRUD + publish) — Done
- LI-029: Admin property list and editor UI (basic) — Done
- LI-030: Duplicate property — Done

## Notes

Basic R1 scope delivered. Stepped autosave, rich-text polish, public 301 wiring for old slugs, and media remain follow-ups (EPIC-05 / later refinements).

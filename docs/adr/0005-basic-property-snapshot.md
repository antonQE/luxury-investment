# 0005: Basic property snapshot for the first public site

- Status: Accepted (delegated)
- Date: 2026-10-25
- Related: EPIC-03, EPIC-04, EPIC-07; product owner asked to continue until a working site is visible

## Context

The full catalog (admin-defined attributes, location hierarchy, slug history) is EPIC-03 and EPIC-04. The product owner asked not to stop until a public site is visible. Dummy data is approved until the migration arrives.

## Decision

Ship a **denormalized `properties` table** with the fields a listing card and a detail page need (titles, price, location labels, areas, badges, image URLs, agent contact). Public list and detail endpoints read this table. Seeded rows are fictional.

The full configurable model (attribute definitions, location IDs, translations tables) remains the target of EPIC-03 and will replace this snapshot. Columns that already match the glossary (`builtUpArea` is not on this table; there is one `area` plus a labelled primary-area string) are mapped during that epic.

## Consequences

- The public site can render listings without waiting for the taxonomy admin.
- EPIC-03/04 must migrate this table into the real model, not grow it indefinitely.
- Filters in this first version are the three markets, transaction type and property type only.

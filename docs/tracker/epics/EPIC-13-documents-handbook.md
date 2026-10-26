# EPIC-13: Document library, seller handbook and download counters

- Status: In Progress
- Priority: P1
- Source: 06 DOC-001; 09 OPS-001; 11 F-04; FLOW-010

## Goal

Admins upload and version public and private documents; the current seller handbook is published unchanged; downloads are counted per document, per version, per period and per traffic source, and counters survive new versions and archiving.

## Scope

- In (R1 basic): seller handbook as a versioned document — upload/publish current version, public download, counters (total, per version, per day).
- In (R2 rest): full document library with categories, languages, access levels, legal templates, revoke old links.
- Out: client-specific documents inside CRM (EPIC-09).

## Tasks

- LI-045: Documents schema + download events + seed
- LI-046: Public handbook download API + page
- LI-047: Admin handbook upload/version UI (basic)

## Notes

Release 1 needs only the seller handbook. Library and legal templates wait for R2.

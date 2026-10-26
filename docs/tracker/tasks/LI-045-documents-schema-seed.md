# LI-045: Documents schema + download events + seed

- Epic: EPIC-13
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-032

## Description

Tables for versioned documents (seller handbook first) and download events; idempotent seed pointing at a local demo PDF or placeholder URL.

## Acceptance criteria

- [x] Schema + migration: `documents`, `document_versions`, `download_events`.
- [x] Shared constants for document kind/access; seed with one published handbook version.
- [x] Seed test green.

## Out of scope

- Public download endpoint (LI-046); admin UI (LI-047); full library categories.

## Implementation notes

- Reuse media storage port for file bytes when possible; R1 may store `storageKey` + public URL on the version row.
- Download events: documentId, versionId, occurredAt, success boolean, optional referrer/source.

## Result

- Migration `0016`; `SELLER_HANDBOOK_SLUG`; seed module; seed test green. Demo PDF file itself lands with LI-046/047 upload.

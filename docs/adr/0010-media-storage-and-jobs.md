# 0010: Media storage interface and background jobs

- Status: Accepted (delegated)
- Date: 2026-10-26
- Related: analysis R4, R5; EPIC-05; ADR-0004 local-first

## Context

Property (and later article) media needs originals kept, web/thumb/social derivatives, private vs public visibility, and a job runner for CPU work. Hosting is still deferred (ADR-0004); GCS and Cloud Run are the long-term target from the analysis, but local development must work without cloud credentials.

## Options considered

1. **GCS + sharp in pg-boss from day one** — matches production shape; blocks local/CI without emulators or credentials.
2. **Managed CDN (Cloudinary)** — fast start; monthly cost and data lock-in (rejected in analysis).
3. **Storage port + local filesystem adapter now; GCS adapter later. Job port with in-process runner now; pg-boss when hosting lands** — keeps the same domain model and APIs.

## Decision

**Option 3.**

- `StoragePort`: `put`, `get`, `delete`, `publicUrl` / `signedUrl`. Local adapter writes under a configurable directory (`MEDIA_LOCAL_ROOT`). Public files served by the API (or static mount) in local; private files only after auth.
- Derivations with **sharp**: web sizes, thumbnail, social JPEG 1200×630. Watermark optional later.
- `JobPort`: for R1 local, run derivative jobs **in-process after upload** (same interface so pg-boss can replace the runner without rewriting handlers).
- Upload path for R1: multipart to the API (simpler than signed direct-to-storage); switch to signed GCS uploads when the GCS adapter lands.

## Consequences

- EPIC-05 implements `media_assets` (+ renditions metadata), local upload, sharp derivatives, property gallery ordering.
- No Cloudinary. No Redis/BullMQ for R1.
- Follow-up: GCS adapter + pg-boss + CDN when deployment ADR is accepted.

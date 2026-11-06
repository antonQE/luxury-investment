# LI-084: PDF and social image rendering ADR

- Epic: EPIC-15
- Status: Done
- Priority: P1
- Size: S
- Area: docs
- Depends on: none

## Description

Record how brochures, marketing-studio assets and later owner-report PDFs are rendered (analysis R6), so EPIC-15 implementation can start without re-deciding the stack.

## Acceptance criteria

- [x] ADR-0013 accepted and indexed in `docs/adr/README.md`.
- [x] EPIC-15 notes point at the ADR.
- [x] Out of scope for R3 explicitly includes AI writing assistant.

## Out of scope

- Implementing the renderer; installing Chromium in CI beyond a note.

## Result

[ADR-0013](../../adr/0013-pdf-and-image-rendering.md): Playwright HTML → PDF/PNG in the API; sharp for encode/resize. AI excluded from R3 by product owner.

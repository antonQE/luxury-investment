# 0013: PDF and social image rendering

- Status: Accepted (delegated)
- Date: 2026-11-03
- Related: analysis R6; EPIC-15; EPIC-11 owner-report PDF polish; MEDIA-005, MEDIA-006, RPT-001

## Context

R3 needs branded PDF brochures and fixed-size social images (feed, square, story, landscape) from catalog data, with element toggles and preview. The same stack should later export owner-report PDFs. `sharp` is already in the API for media renditions. Playwright is already a repo dependency for e2e.

## Options considered

1. **Headless Chromium (Playwright) HTML templates** — one HTML/CSS template system for PDF and screenshots; familiar layout model; heavier runtime and ops.
2. **@react-pdf/renderer + Satori/sharp** — lighter PDF path, second template system for images; CSS limits differ between PDF and images.
3. **External SaaS render** — less code, vendor lock-in and cost; deferred until hosting.

## Decision

**Option 1 for R3 basic:** Playwright (Chromium) in the API process for HTML → PDF and HTML → PNG/JPEG, with templates as HTML partials owned by the API. Use existing **sharp** only for resize/encode of screenshot buffers when needed. Keep the renderer behind a small port so hosting can later move it to a worker (same shape as ADR-0010 jobs).

## Consequences

- Brochures and marketing-studio exports share one template technology.
- Local/dev must have Chromium available via Playwright browsers (documented in API README when LI-084 lands).
- Direct Meta publishing stays out (EPIC-18).
- AI-generated copy is explicitly out of R3.

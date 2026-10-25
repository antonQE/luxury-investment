# LI-015: Property page enrichment

- Epic: EPIC-07
- Status: Done
- Priority: P1
- Size: M
- Area: web
- Depends on: LI-012

## Description

Upgrade the property page from the LI-010 baseline: fuller gallery UX, share/copy link, sticky mobile agent CTA, clearer facts block. Still uses the snapshot API.

## Acceptance criteria

- [x] Gallery: keyboard and next/prev; works on mobile.
- [x] Share: copy link (and simple Facebook / WhatsApp / Viber links where feasible).
- [x] Sticky mobile CTA for call / Viber / WhatsApp without covering content badly.
- [x] Price per m² from labelled primary area when area > 0.
- [x] All strings via i18n; loading/error handled.

## Out of scope

- Inquiry forms stored in API (LI-017); Google Maps embed (LI-016); print/QR.

## Implementation notes

- Keyboard arrows on focused gallery; sticky mobile agent bar; ShareActions; formatPricePerSqm.

## Result

- Gallery keyboard + counter; share copy/FB/WA/Viber; sticky mobile CTA; price/m² on facts.

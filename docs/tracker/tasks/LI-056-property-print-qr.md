# LI-056: Property print view and QR

- Epic: EPIC-07
- Status: Done
- Priority: P1
- Size: S
- Area: web
- Depends on: LI-015

## Description

Property page R1 needs a print-friendly layout and a QR code linking to the listing (deferred from LI-015).

## Acceptance criteria

- [x] Print control on the property page triggers the browser print dialog.
- [x] Print stylesheet hides site chrome, forms, share and mobile CTA; keeps title, facts, description and agent.
- [x] QR code image for the absolute listing URL is shown (and prints).
- [x] BG/EN labels; typecheck/lint pass.

## Out of scope

- PDF brochure generation (EPIC-15); custom print templates per market.

## Implementation notes

- Client `PrintButton`; `@media print` rules in `globals.css`; server-generated QR data URL via `qrcode`.

## Result

`PrintButton` + `PropertyQr` on the listing page; print CSS hides chrome/forms/share/similar; `qrcode` data URL. Smoke: `property-print` and `property-qr` on demo listing.

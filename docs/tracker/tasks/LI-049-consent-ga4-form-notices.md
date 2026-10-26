# LI-049: Consent-gated GA4 + form privacy links

- Epic: EPIC-16
- Status: Done
- Priority: P1
- Size: S
- Area: web
- Depends on: LI-048

## Description

Load Google Analytics 4 only when analytics consent is granted; ensure public forms link to the privacy page notice.

## Acceptance criteria

- [x] GA4 script loads only with analytics consent when `NEXT_PUBLIC_GA4_MEASUREMENT_ID` is set.
- [x] Inquiry and consultation forms link to `/stranici/privacy`.
- [x] Without measurement ID or without consent, no GA tags are injected.

## Out of scope

- Meta pixel; server-side consent log; admin CMP config.

## Implementation notes

## Result

- `Analytics` component gated by consent; form privacy links; `.env.example` documents GA4 id.

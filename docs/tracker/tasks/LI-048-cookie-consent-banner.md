# LI-048: Cookie consent banner + preference storage

- Epic: EPIC-16
- Status: Done
- Priority: P1
- Size: M
- Area: web
- Depends on: LI-012

## Description

Public site shows a cookie consent banner with necessary vs analytics categories; choice is stored in the browser and can be changed later.

## Acceptance criteria

- [x] Banner on first visit with Accept all / Necessary only (or equivalent).
- [x] Preference persisted (localStorage); banner does not reappear until reset.
- [x] Footer or settings control to reopen preferences; i18n BG/EN.

## Out of scope

- GA4 injection (LI-049); advertising category; CMP vendor.

## Implementation notes

## Result

- `CookieConsentBanner` + footer settings; localStorage key `li_cookie_consent_v1`.

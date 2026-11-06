# LI-095: Site public phone setting (admin)

- Epic: EPIC-06
- Status: Done
- Priority: P1
- Size: S
- Area: api
- Depends on: none

## Description

Agency contact phone shown in the public header/footer is configured by staff in admin (not hardcoded i18n).

## Acceptance criteria

- [x] Persisted site setting for public phone; seed demo value.
- [x] Admin can view and update the phone.
- [x] Public header/footer use the setting; icon hidden when empty.
- [x] `tel:` href uses digits from the stored value.

## Out of scope

- Full site-settings CMS; multi-locale phone formats; click-to-call analytics.

## Implementation notes

- ADR-0014 key-value `site_settings`; key `public_phone`.
- Admin `/settings`; public `GET /v1/public/site-settings`.

## Result

Admin-editable public phone drives header icon + footer link.

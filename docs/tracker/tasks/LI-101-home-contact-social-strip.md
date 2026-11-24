# LI-101: Home contact + social strip

- Epic: EPIC-06
- Status: Done
- Priority: P1
- Size: S
- Area: web, api, admin
- Depends on: LI-095

## Description

Owner feedback: the home page needs a place for agency phone, email, Facebook, Instagram and TikTok.

## Acceptance criteria

- [x] Site settings store optional Facebook / Instagram / TikTok URLs (plus existing phone & email).
- [x] Admin Settings can edit the three social URLs.
- [x] Home page shows a contact strip with phone, email and social links; empty values are hidden.
- [x] Seed includes demo phone/email and real agency Facebook/Instagram URLs; TikTok empty until known.

## Out of scope

- Footer social icons polish; analytics on social clicks; TikTok account discovery.

## Result

Configurable contact strip on the home page driven by `site_settings`.

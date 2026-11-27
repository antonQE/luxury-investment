# LI-127: Public input focus — underline only, no box outline

- Epic: EPIC-06
- Status: Review
- Priority: P2
- Size: S
- Area: web
- Depends on: none
- Source: [06-web-input-focus-underline.md](../../requirements/06-web-input-focus-underline.md) (change request, product owner, 2026-11-27)

## Description

When a visitor focuses any filter or form field on the public site, a full rectangle outline appears around the control and looks ugly. Focus should only strengthen the field’s main bottom line (underline), not draw a box around the whole field.

## Plain-language summary (BG)

На публичния сайт, когато кликнете или стигнете с клавиатура до филтър или поле, вече няма да се появява квадратен бордър около цялото поле. Ще се подчертава само долната линия на полето. Важи за всички полета на сайта (търсене, запитвания, контакт и др.).

## Acceptance criteria

- [x] Focusing any public-site text input, select or textarea does **not** show a full rectangular outline/box around the field.
- [x] Focus still visibly strengthens the field’s main underline (bottom edge), so keyboard users can tell which field is active.
- [x] Applies site-wide on the public web: search filters (home + `/properties/`) and all public forms (inquiry, consultation, search-request, contact, landing CTA, cookie/consent fields if any).
- [x] Links and buttons keep a clear keyboard focus cue (do not remove focus indication from non-field controls).
- [x] Admin panel appearance is unchanged.

## Assumptions

- Scope = all public-site fields (confirmed).
- Desired look = underline highlight only (confirmed).
- Keep accessible focus for keyboard users via the stronger underline (and existing cues on links/buttons).

## Out of scope

- Admin panel inputs
- Changing field layout, labels or validation behaviour
- Redesigning non-underline (boxed) fields into a new visual system beyond removing the ugly focus box and using underline emphasis where fields already use underline; for boxed fields, suppress the offset outline and use a tasteful border-color focus without a double box if they are not underline-style

## Handoff

1. `web` subagent: implement, following `web-page` skill (globals / shared field styles + SearchForm and form components as needed).
2. `test` subagent: verify every acceptance criterion; add/update a focused unit or component check if useful; manual/browser smoke on home search + one form.

## Screenshots and links

- Home search: `http://localhost:3000/`
- Listings filters: `http://localhost:3000/properties/`
- Example form: `http://localhost:3000/contact/` or property inquiry

## Result

Implemented in `apps/web/src/app/globals.css` (after the global `:focus-visible` rule): `input` (except checkbox, radio, button, submit, reset, file, range, hidden), `select` and `textarea` on `:focus` / `:focus-visible` get `outline: none`, `border-color: brass` and `box-shadow: 0 1px 0 0 brass`. Links, buttons, checkboxes and radios keep the global 1px brass outline. `docs/guides/public-site.md` Forms section updated. The admin app is untouched (only `apps/web` and docs changed).

Verification (2026-11-27, dev server on `localhost:3000`, computed styles after focusing each field, plus screenshots):

- Home search selects: outline `none`, bottom border and 1px shadow brass.
- `/properties/` filters (3 selects, search, city, district, bedrooms, price/area ranges): outline `none`, brass underline.
- `/sell-with-us/` consultation form and a property inquiry form (name, email, phone, textarea): outline `none`; the boxed fields get a brass border plus a 1px brass line beneath, with no offset outline and no double box.
- Checkbox and radio inputs, the search button and links still show `outline: 1px solid` brass.
- Contact page has no form fields; the cookie banner has none; `SearchRequestForm` and `LandingCtaForm` use the same global rule and field markup as the forms checked above.

Tests: added `apps/web/test/focus-styles.test.ts` (4 cases that guard the CSS contract: the global outline stays, the field rules drop the outline, brass border and underline, the exclusion list stays a negated list). The web suite passes (23 files, 54 tests); typecheck, ESLint and Prettier are clean.

Notes: for boxed fields the whole 1px border turns brass (allowed by "Out of scope"); only underline-style fields show a pure underline. There is a pre-existing Next dev hydration warning in `PropertyBadge` on the home page, unrelated to this task.

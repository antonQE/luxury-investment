# LI-097: Move legal services into primary nav + reorder menu

- Epic: EPIC-06
- Status: Done
- Priority: P1
- Size: S
- Area: web
- Depends on: none

## Description

Owner feedback: “Адвокатски услуги” leaves the Investments dropdown and becomes a top-level primary nav item. Reorder the whole primary menu to the agreed sequence.

## Acceptance criteria

- [x] Legal services is a top-level nav item linking to `/advokatski-uslugi`.
- [x] It is no longer a child of Investments.
- [x] Primary nav order: home, properties, sell with us, legal services, documents, investments, services, articles, team, about, contact.

## Out of scope

- Content changes on the legal services page; further owner-feedback items.

## Implementation notes

- Single source: `apps/web/src/components/layout/nav.ts` (DesktopNav, MobileNav, SiteFooter).

## Result

PRIMARY_NAV reordered; legal services promoted; Investments dropdown keeps overview + businesses only.

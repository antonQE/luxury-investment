# 0014: Site settings as key-value store

- Status: Accepted (delegated)
- Date: 2026-11-06
- Related: LI-095; EPIC-06 shell contact phone

## Context

The public header/footer phone was hardcoded. Staff need to change the agency contact number without a deploy.

## Options considered

1. Reuse first office phone — ambiguous with multiple offices; office CRUD has no edit UI yet.
2. Key-value `site_settings` table — small, extensible for later email/social keys.
3. Full settings CMS — oversized for one field.

## Decision

Use a `site_settings` key-value table (`key` PK, `value` text). First key: `public_phone`. Public read + admin read/update under content permissions.

## Consequences

- Header/footer load phone from API.
- Future keys (e.g. `public_email`) can reuse the same table without a new ADR unless shape changes.

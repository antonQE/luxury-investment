# LI-018: Auth ADR acceptance and users/roles schema

- Epic: EPIC-02
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: ADR-0006 accepted

## Description

ADR-0006 is accepted (email + password). Add Postgres tables for users (email, password hash), roles, permissions and a seed main admin (local only). No login UI yet.

## Acceptance criteria

- [x] ADR-0006 status Accepted (or a superseding ADR if another option was chosen).
- [x] Drizzle schema + migration for users/roles/permissions (basic templates from the spec).
- [x] Idempotent seed of role templates and one demo admin user (no real secrets).
- [x] Shared permission keys in `packages/shared` if needed by both apps.

## Out of scope

- Login UI and API auth middleware (LI-019).

## Implementation notes

- Schema in `modules/users/repo/users.schema.ts`; permission keys in `packages/shared`.
- Argon2 password hashes via `@node-rs/argon2`; demo admin only in local seed.

## Result

- Migration `0002` for users/roles/permissions/role_permissions; argon2 hashes.
- Shared `PERMISSION_KEYS` / `ROLE_PERMISSIONS`; seed demo `admin@example.com` / `DemoAdmin!234`.
- Integration tests cover seed idempotency and password verify.

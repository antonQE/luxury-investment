# LI-020: Audit log foundation

- Epic: EPIC-02
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-019

## Description

Append-only audit log table and a small helper used by admin write paths; first usage on user/role changes (or a stub write from login for smoke).

## Acceptance criteria

- [x] Migration for audit entries (actor, action, resource, metadata, createdAt).
- [x] Service helper that writers call inside transactions.
- [x] At least one admin action writes an audit row; readable via a minimal admin endpoint or test.

## Out of scope

- Full audit UI; every domain event (those land with each epic).

## Implementation notes

- `AuditService.record` on login; `GET /v1/admin/audit` (needs `audit:read`).

## Result

- `audit_entries` migration; login writes `auth.login`; admin list endpoint + tests.

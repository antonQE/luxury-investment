# EPIC-02: Identity, roles, permissions and audit log

- Status: Backlog
- Priority: P1
- Source: 09 ROLE-001, SEC-001; 04 ADMIN-001; 11 D-01, I-01; FLOW-015

## Goal

Staff log in to the admin panel; every API request is authorized on the server by action and resource, including field-level restrictions; significant actions are written to an audit log.

## Scope

- In: staff login and logout, 2FA, session revocation when access is removed; users; role templates (main admin, manager, agent, marketing/editor, external partner, viewer) with per-user overrides; permission checks in the API service layer; field-level restriction helpers (commissions, finance, internal notes, exact address); audit log for price, status, responsible agent, permissions, exports, calculator rules, user changes; admin screens for users and roles; minimal admin dashboard shell.
- Out: CRM data (EPIC-09); public visitor accounts (not planned, see analysis A2).

## Tasks

Decomposed when the epic starts. First task: ADR for staff authentication (analysis R7).

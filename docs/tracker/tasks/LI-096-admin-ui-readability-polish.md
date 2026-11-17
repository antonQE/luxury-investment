# LI-096: Admin UI readability polish

- Epic: EPIC-02
- Status: Done
- Priority: P2
- Size: M
- Area: admin
- Depends on: none

## Description

Make the admin panel easier to work with: collapsible sidebar, clearer form fields and buttons, more readable tables, Chakra native selects, status badges, and consistent page headers/layout.

## Acceptance criteria

- [x] Sidebar can collapse/expand; preference persists in localStorage.
- [x] Inputs, textareas and selects read clearly as editable controls.
- [x] Primary / outline / danger buttons are visually distinct.
- [x] Tables show clearer headers, borders and row hover.
- [x] Status/stage values use badges where shown in lists.
- [x] Native `<select>` usages replaced with shared AdminSelect (Chakra NativeSelect).
- [x] Page headers/forms use shared layout primitives consistently.

## Out of scope

- New UI library; searchable comboboxes; public web redesign; new product filters.

## Implementation notes

- Theme tokens/recipes in `apps/admin/src/config/theme.ts`.
- Shared UI: PageHeader, Field, AdminSelect, StatusBadge, Panel; `dangerVariant` helper for typed danger buttons.
- AppShell collapse; page pass across admin screens.

## Result

Admin theme + shared primitives + collapsible sidebar; pages use PageHeader/Panel/Field/AdminSelect/StatusBadge. Typecheck and admin unit tests pass.

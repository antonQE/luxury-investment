---
name: admin-page
description: >-
  Recipe for adding or extending a screen in the admin panel (apps/admin): endpoint
  client, page, route, sidebar entry, i18n, data-testids, states and tests. Use when
  asked to add an admin page, list, form, table, tab or section.
---

# Add an admin screen

Project workflow (tracker, ADRs, commits): `.cursor/skills/luxury-investment-workflow/SKILL.md`.
Copy from the closest existing page instead of starting blank:

| Need | Reference |
|---|---|
| List + create form + inline row edits | `apps/admin/src/pages/Deals/DealsList.tsx` |
| Read-only dashboard with KPI cards, range select, tooltips | `apps/admin/src/pages/Analytics/AnalyticsPage.tsx` |
| Full edit form with many fields | `apps/admin/src/pages/Team/TeamList.tsx` |
| Section with tabs (nested routes) | `apps/admin/src/pages/Tasks/TasksSectionNav.tsx`, `pages/Documents/DocumentsSectionNav.tsx` |

## Checklist

```
- [ ] API exists? If not, do .cursor/skills/api-endpoint/SKILL.md first
- [ ] Endpoint client: src/api/endpoints/<resource>.ts
- [ ] Page: src/pages/<Feature>/<PageName>.tsx
- [ ] Route path in src/constants/routes.ts, lazy route in src/App.tsx
- [ ] Sidebar item in src/components/layout/AppShell.tsx (+ icon in nav-icons.tsx)
- [ ] i18n keys in src/i18n/locales/bg.json AND en.json
- [ ] data-testid on page root, inputs, buttons, table, rows
- [ ] Loading / error / empty states
- [ ] Tests: unit for helpers, component test for behaviour, e2e smoke
- [ ] docs/guides/admin-panel.md + tracker task updated
```

## 1. Endpoint client

```ts
// src/api/endpoints/widgets.ts
import { apiClient } from '@/api/clients';

export interface AdminWidget { id: string; name: string }

export const widgetKeys = {
  list: () => ['admin', 'widgets'] as const,
};

export async function fetchAdminWidgets(): Promise<AdminWidget[]> {
  const { data } = await apiClient.get<{ data: AdminWidget[] }>('/v1/admin/widgets');
  return data.data;
}
```

Use types from `@luxury-investment/shared` when the API already exports them.

## 2. Page skeleton

- Root: `<VStack align="stretch" gap={6} data-testid="widgets-admin-page">` + `<PageHeader title=... lead=... />`.
- Sections in `<Panel>`; form fields in `<Field label=... required>`; selects with `AdminSelect` (`clearable={false}` for values that must never be empty).
- `useQuery` for reads, `useMutation` for writes; on success `queryClient.invalidateQueries({ queryKey: widgetKeys.list() })`; on error show `ApiError` message inline.
- States: `isPending` -> `<Spinner />`, `isError` -> `<Text color="status.down">`, empty array -> `<Text color="text.muted">`.
- Tooltips: Chakra `Tooltip.Root` / `Tooltip.Trigger asChild` / `Portal` / `Tooltip.Positioner` / `Tooltip.Content` (see `MetricInfoTip` in `AnalyticsPage.tsx`).
- Permission-gated UI only where an API permission exists: `useAuth().user?.permissions.includes('finance:read')`.
- Extract pure logic (defaults, parsing, formatting) into exported functions for unit tests.

## 3. Route and navigation

```ts
// src/constants/routes.ts
WIDGETS: '/widgets',
// src/App.tsx
const WidgetsList = lazy(() => import('@/pages/Widgets/WidgetsList'));
<Route path={ROUTES.WIDGETS} element={<WidgetsList />} />
// src/components/layout/AppShell.tsx navItems
{ to: ROUTES.WIDGETS, label: t('nav.widgets'), testId: 'nav-widgets' },
```

Renamed paths keep the old one as `<Navigate replace>` (see `MARKETING_LEGACY`).

## 4. Tests

- Pure helpers: `src/pages/Widgets/<helper>.test.ts`.
- Component: `WidgetsList.component.test.tsx` with `vi.mock('@/api/endpoints/widgets')`, mocked `react-i18next`, `ChakraProvider` + `QueryClientProvider` (pattern: `pages/Deals/DealsList.component.test.tsx`).
- e2e: add testids to `apps/e2e/src/pages/admin-shell.elements.ts`, smoke spec in `apps/e2e/src/admin/` (see `.cursor/skills/e2e-test/SKILL.md`).

## 5. Verify

```bash
npm run typecheck -w @luxury-investment/admin
npm test -w @luxury-investment/admin
E2E_REUSE_SERVER=1 npm run test:e2e -- src/admin
```

---
name: e2e-test
description: >-
  Recipe for writing and running Playwright end-to-end tests in apps/e2e for the
  public site and the admin panel. Use when adding or fixing an e2e spec, page
  object, data-testid map, or when e2e fails locally or in CI.
---

# Write a Playwright e2e test

Config: `apps/e2e/playwright.config.ts`. Projects: `public` (web on :3000), `admin-setup` + `admin` (admin on :5173, logged in via stored session). The API runs on :4000.

## Where things go

| Item | Location |
|---|---|
| Public spec | `apps/e2e/src/public/<flow>.spec.ts` |
| Admin spec | `apps/e2e/src/admin/<area>.spec.ts` |
| testid map | `apps/e2e/src/pages/<page>.elements.ts` (frozen `as const` object) |
| Page object (actions) | `apps/e2e/src/pages/<page>.page.ts` |
| Admin login | `apps/e2e/src/admin/auth.setup.ts` (do not log in again inside specs) |
| Demo credentials | `apps/e2e/src/fixtures/credentials.ts` |

## Rules

- One happy path per critical flow; edge cases belong to unit/component/API tests.
- Locate by `getByTestId` with ids from the elements map; add the `data-testid` to the app if it is missing.
- Unique data per run: `` `E2E Contact ${String(Date.now())}` `` (numbers in template literals must be wrapped in `String()`).
- No `waitForTimeout`. Wait for visible state (`toBeVisible`, `toHaveValue`) or for the request: `Promise.all([page.waitForResponse(...), action])`.
- Scope assertions to the row/section you created (`table.locator('tr', { hasText: name })`), not `.first()` on shared data.
- Select options with `selectOption`; for selects filled from the API, first wait until `option` at index 1 is attached.
- Public specs that show the cookie banner call `ConsentPage.acceptAllIfVisible()` first.
- Specs must pass in parallel and in any order; never depend on data created by another spec.

## Example

```ts
test('deals create with agent and change stage', async ({ page }) => {
  await page.goto('/deals');
  await expect(page.getByTestId(adminShellElements.dealsPage)).toBeVisible();
  const price = `199${String(Date.now()).slice(-5)}.00`;
  // ...fill form, submit...
  const row = page.getByTestId(adminShellElements.dealsTable).locator('tr', { hasText: price });
  const stage = row.locator('[data-testid^="deal-stage-"]');
  await Promise.all([
    page.waitForResponse((r) => r.request().method() === 'PATCH' && r.url().includes('/v1/admin/deals/') && r.ok()),
    stage.selectOption('notary'),
  ]);
  await expect(stage).toHaveValue('notary');
});
```

## Run

```bash
npm run db:up && npm run db:migrate && npm run db:seed   # once, or after schema changes
E2E_REUSE_SERVER=1 npm run test:e2e                      # reuse running dev servers (fast)
E2E_REUSE_SERVER=1 npm run test:e2e -- src/admin/crm.spec.ts
npm run test:e2e                                         # let Playwright start the servers
npm run test:e2e:ui                                      # debug interactively
```

## When it fails

1. Read `apps/e2e/test-results/<test>/error-context.md` and the screenshot next to it.
2. Check that the servers run the latest code (restart dev servers after migrations or env changes).
3. Login failures: run `npm run db:seed`, then delete `apps/e2e/playwright/.auth/admin.json`.
4. Flaky value assertions on controlled selects: wait for the PATCH/POST response, then assert.

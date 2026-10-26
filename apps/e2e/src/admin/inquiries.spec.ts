import { expect, test } from '@playwright/test';

import { adminShellElements } from '../pages/admin-shell.elements.ts';

test('admin inquiries inbox shows seeded rows', async ({ page }) => {
  await page.goto('/inquiries');
  await expect(page.getByTestId(adminShellElements.inquiriesPage)).toBeVisible();
  await expect(page.getByTestId(adminShellElements.inquiriesTable)).toBeVisible();
});

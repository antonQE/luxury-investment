import { expect, test } from '@playwright/test';

import { adminShellElements } from '../pages/admin-shell.elements.ts';

test('admin properties list smoke', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByTestId(adminShellElements.shell)).toBeVisible();
  await page.getByTestId(adminShellElements.navProperties).click();
  await expect(page.getByTestId(adminShellElements.propertiesPage)).toBeVisible();
});

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test as setup } from '@playwright/test';

import { DEMO_ADMIN } from '../fixtures/credentials.ts';
import { adminLoginElements } from '../pages/admin-login.elements.ts';

const authFile = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../playwright/.auth/admin.json',
);

setup('authenticate admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId(adminLoginElements.email).fill(DEMO_ADMIN.email);
  await page.getByTestId(adminLoginElements.password).fill(DEMO_ADMIN.password);
  await page.getByTestId(adminLoginElements.submit).click();
  await expect(page.getByTestId(adminLoginElements.dashboard)).toBeVisible();
  await page.context().storageState({ path: authFile });
});

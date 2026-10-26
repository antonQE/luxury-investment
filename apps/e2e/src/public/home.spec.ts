import { test } from '@playwright/test';

import { ConsentPage } from '../pages/consent.page.ts';
import { HomePage } from '../pages/home.page.ts';

test('home loads brand, hero search and markets', async ({ page }) => {
  const home = new HomePage(page);
  const consent = new ConsentPage(page);
  await home.goto('/');
  await consent.acceptAllIfVisible();
  await home.expectBrandShell();
});

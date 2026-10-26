import { expect, test } from '@playwright/test';

import { ConsentPage } from '../pages/consent.page.ts';
import { homeElements } from '../pages/home.elements.ts';

test('EN locale shell and hreflang smoke', async ({ page }) => {
  const consent = new ConsentPage(page);
  await page.goto('/en');
  await consent.acceptAllIfVisible();
  await expect(page.getByTestId(homeElements.logo)).toBeVisible();
  await expect(page.getByTestId(homeElements.hero)).toBeVisible();

  const hreflang = page.locator('link[rel="alternate"][hreflang]');
  await expect(hreflang.first()).toBeAttached();
  await expect(page.locator('link[rel="alternate"][hreflang="bg"]')).toBeAttached();
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toBeAttached();
});

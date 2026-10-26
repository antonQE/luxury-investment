import { test } from '@playwright/test';

import { ConsentPage } from '../pages/consent.page.ts';

test('cookie consent accept all then reopen from footer', async ({ page, context }) => {
  await context.clearCookies();
  await page.goto('/');
  await page.evaluate('localStorage.clear()');
  await page.reload();

  const consent = new ConsentPage(page);
  await consent.acceptAll();
  await consent.reopenFromFooter();
});

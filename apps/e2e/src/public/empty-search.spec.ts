import { test } from '@playwright/test';

import { ConsentPage } from '../pages/consent.page.ts';
import { ListingsPage } from '../pages/listings.page.ts';

test('nonsense filters show empty state and search-request form', async ({ page }) => {
  const listings = new ListingsPage(page);
  const consent = new ConsentPage(page);
  await listings.goto('q=zzzxqwnonsense999&city=AtlantisCityXYZ');
  await consent.acceptAllIfVisible();
  await listings.expectEmptyState();
});

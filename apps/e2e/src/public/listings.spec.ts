import { test } from '@playwright/test';

import { ConsentPage } from '../pages/consent.page.ts';
import { ListingsPage } from '../pages/listings.page.ts';
import { propertyElements } from '../pages/property.elements.ts';

test('listings filter updates URL and opens a property card', async ({ page }) => {
  const listings = new ListingsPage(page);
  const consent = new ConsentPage(page);
  await listings.goto();
  await consent.acceptAllIfVisible();
  await listings.filterByCity('София');
  await listings.expectUrlContains('city=%D0%A1%D0%BE%D1%84%D0%B8%D1%8F');
  await listings.openFirstCard();
  await page.getByTestId(propertyElements.page).waitFor();
});

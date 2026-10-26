import { test } from '@playwright/test';

import { ConsentPage } from '../pages/consent.page.ts';
import { SellWithUsPage } from '../pages/sell-with-us.page.ts';

test('sell with us consultation form happy path', async ({ page }) => {
  const sell = new SellWithUsPage(page);
  const consent = new ConsentPage(page);
  await sell.goto();
  await consent.acceptAllIfVisible();
  await sell.submitConsultation({
    name: 'Seller Demo',
    email: 'seller.e2e@example.com',
    phone: '+359888000222',
    message: 'I want a valuation',
  });
});

import { test } from '@playwright/test';

import { ConsentPage } from '../pages/consent.page.ts';
import { PropertyPage } from '../pages/property.page.ts';

test('property page shows gallery, share and accepts inquiry', async ({ page }) => {
  const property = new PropertyPage(page);
  const consent = new ConsentPage(page);
  await property.goto('demo-tristaen-malinova-dolina');
  await consent.acceptAllIfVisible();
  await property.expectShell();
  await property.submitInquiry({
    name: 'E2E Visitor',
    email: 'e2e.visitor@example.com',
    phone: '+359888000111',
    message: 'E2E inquiry from Playwright',
  });
});

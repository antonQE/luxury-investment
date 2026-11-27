import { expect, test } from '@playwright/test';

import { ConsentPage } from '../pages/consent.page.ts';
import { PropertyPage } from '../pages/property.page.ts';

const API_URL = process.env.E2E_API_URL ?? 'http://localhost:4000';

test('property page shows gallery, share and accepts inquiry', async ({ page, request }) => {
  // Public detail URLs are `/properties/{id}/` (LI-126); resolve the demo listing's id.
  const response = await request.get(
    `${API_URL}/v1/public/properties/demo-tristaen-malinova-dolina`,
  );
  const { id } = ((await response.json()) as { data: { id: string } }).data;

  const property = new PropertyPage(page);
  const consent = new ConsentPage(page);
  await property.goto(id);
  await expect(page).toHaveURL(new RegExp(`/properties/${id}/?$`));
  await consent.acceptAllIfVisible();
  await property.expectShell();
  await property.submitInquiry({
    name: 'E2E Visitor',
    email: 'e2e.visitor@example.com',
    phone: '+359888000111',
    message: 'E2E inquiry from Playwright',
  });
});

import { expect, test } from '@playwright/test';

import { adminShellElements } from '../pages/admin-shell.elements.ts';

test('contacts list and create smoke', async ({ page }) => {
  await page.goto('/contacts');
  await expect(page.getByTestId(adminShellElements.contactsPage)).toBeVisible();
  await expect(page.getByTestId(adminShellElements.contactsTable)).toBeVisible();

  const name = `E2E Contact ${String(Date.now())}`;
  await page.getByTestId('contact-display-name').fill(name);
  await page.getByTestId('contact-email').fill(`e2e.${String(Date.now())}@example.com`);
  await page.getByTestId('contact-save-submit').click();
  await expect(page.getByTestId(adminShellElements.contactsTable)).toContainText(name);
});

test('viewings calendar create smoke', async ({ page }) => {
  await page.goto('/viewings');
  await expect(page.getByTestId(adminShellElements.viewingsPage)).toBeVisible();

  const property = page.getByTestId('viewing-property');
  await expect(property.locator('option').nth(1)).toBeAttached({ timeout: 20_000 });
  await property.selectOption({ index: 1 });

  const contact = page.getByTestId('viewing-contact');
  await expect(contact.locator('option').nth(1)).toBeAttached();
  await contact.selectOption({ index: 1 });

  await page.getByTestId('viewing-create-submit').click();
  await expect(page.getByTestId('viewings-calendar-grid')).toBeVisible();
  await expect(page.locator('[data-testid^="viewing-row-"]').first()).toBeVisible({
    timeout: 20_000,
  });
});

test('deals create with agent and change stage', async ({ page }) => {
  await page.goto('/deals');
  await expect(page.getByTestId(adminShellElements.dealsPage)).toBeVisible();
  await expect(page.getByTestId(adminShellElements.dealsTable)).toBeVisible();

  const property = page.getByTestId('deal-property');
  await expect(property.locator('option').nth(1)).toBeAttached({ timeout: 20_000 });
  await property.selectOption({ index: 1 });

  const buyer = page.getByTestId('deal-buyer');
  await expect(buyer.locator('option').nth(1)).toBeAttached();
  await buyer.selectOption({ index: 1 });

  const agent = page.getByTestId('deal-agent');
  await expect(agent).not.toHaveValue('');

  const price = `199${String(Date.now()).slice(-5)}.00`;
  await page.getByTestId('deal-agreed-price').fill(price);
  await page.getByTestId('deal-notes').fill('E2E deal');
  await page.getByTestId('deal-create-submit').click();

  const table = page.getByTestId(adminShellElements.dealsTable);
  await expect(table).toContainText(price);

  const dealRow = table.locator('tr', { hasText: price });
  const stageSelect = dealRow.locator('[data-testid^="deal-stage-"]');
  await Promise.all([
    page.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' && res.url().includes('/v1/admin/deals/') && res.ok(),
    ),
    stageSelect.selectOption('notary'),
  ]);
  await expect(stageSelect).toHaveValue('notary');
});

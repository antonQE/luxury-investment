import { expect, test } from '@playwright/test';

import { adminShellElements } from '../pages/admin-shell.elements.ts';

test('tasks section tabs and legacy redirects', async ({ page }) => {
  await page.goto('/tasks');
  await expect(page).toHaveURL(/\/tasks\/marketing$/);
  await expect(page.getByTestId(adminShellElements.marketingPage)).toBeVisible();
  await expect(page.getByTestId(adminShellElements.tasksSectionNav)).toBeVisible();

  await page.getByTestId('tasks-tab-studio').click();
  await expect(page).toHaveURL(/\/tasks\/studio$/);
  await expect(page.getByTestId(adminShellElements.studioPage)).toBeVisible();

  await page.getByTestId('tasks-tab-crm').click();
  await expect(page).toHaveURL(/\/tasks\/crm$/);
  await expect(page.getByTestId(adminShellElements.crmTasksPage)).toBeVisible();

  await page.goto('/marketing');
  await expect(page).toHaveURL(/\/tasks\/marketing$/);

  await page.goto('/studio');
  await expect(page).toHaveURL(/\/tasks\/studio$/);

  await page.goto('/crm-tasks');
  await expect(page).toHaveURL(/\/tasks\/crm$/);
});

test('analytics page loads', async ({ page }) => {
  await page.goto('/analytics');
  await expect(page.getByTestId(adminShellElements.analyticsPage)).toBeVisible();
  await expect(
    page.getByTestId('analytics-pages-table').or(page.getByText(/няма прегледи|No page views/i)),
  ).toBeVisible({ timeout: 20_000 });
});

test('documents and handbook section tabs', async ({ page }) => {
  await page.goto('/documents');
  await expect(page.getByTestId(adminShellElements.documentsPage)).toBeVisible();
  await expect(page.getByTestId(adminShellElements.documentsSectionNav)).toBeVisible();

  await page.getByTestId('documents-tab-handbook').click();
  await expect(page).toHaveURL(/\/documents\/handbook$/);
  await expect(page.getByTestId(adminShellElements.handbookPage)).toBeVisible();

  await page.getByTestId('documents-tab-library').click();
  await expect(page).toHaveURL(/\/documents$/);
  await expect(page.getByTestId(adminShellElements.documentsPage)).toBeVisible();
});

import { expect, test } from '@playwright/test';

import { ConsentPage } from '../pages/consent.page.ts';
import { homeElements } from '../pages/home.elements.ts';
import { mobileShellElements } from '../pages/mobile-shell.elements.ts';
import { MobileShellPage } from '../pages/mobile-shell.page.ts';
import { propertyElements } from '../pages/property.elements.ts';

const API_URL = process.env.E2E_API_URL ?? 'http://localhost:4000';

test.beforeEach((_fixtures, testInfo) => {
  test.skip(testInfo.project.name !== 'public-mobile', 'mobile chrome only');
});

test('mobile hamburger opens and reaches properties', async ({ page }) => {
  const consent = new ConsentPage(page);
  const mobile = new MobileShellPage(page);
  await page.goto('/');
  await consent.acceptAllIfVisible();
  await expect(page.getByTestId(homeElements.brandLogo)).toBeVisible();
  await mobile.goViaNav('properties');
  await expect(page).toHaveURL(/\/properties\/?$/);
  await expect(page.getByTestId('page-hero')).toBeVisible();
});

test('mobile nav reaches about, team and contact', async ({ page }) => {
  const consent = new ConsentPage(page);
  const mobile = new MobileShellPage(page);
  await page.goto('/');
  await consent.acceptAllIfVisible();

  await mobile.goViaNav('about');
  await expect(page).toHaveURL(/\/about\/?$/);

  await mobile.goViaNav('team');
  await expect(page).toHaveURL(/\/team\/?$/);
  await expect(page.getByTestId('team-page')).toBeVisible();

  await mobile.goViaNav('contact');
  await expect(page).toHaveURL(/\/contact\/?$/);
  await expect(page.getByTestId('contact-page')).toBeVisible();
});

test('mobile nav investments submenu opens overview', async ({ page }) => {
  const consent = new ConsentPage(page);
  const mobile = new MobileShellPage(page);
  await page.goto('/');
  await consent.acceptAllIfVisible();
  await mobile.openNav();
  await page.getByTestId('mobile-nav-investments').click();
  await page.getByTestId('mobile-nav-investmentsOverview').click();
  await expect(page).toHaveURL(/\/investments\/?$/);
});

test('property page shows mobile agent bar actions', async ({ page, request }) => {
  const list = await request.get(`${API_URL}/v1/public/properties?limit=48&lang=bg`);
  expect(list.ok()).toBe(true);
  const items = ((await list.json()) as { data: { id: string }[] }).data;
  let propertyId: string | null = null;
  for (const { id } of items) {
    const detail = await request.get(`${API_URL}/v1/public/properties/by-id/${id}`);
    if (!detail.ok()) continue;
    const body = (await detail.json()) as { data: { agentId: string | null; agentPhone: string } };
    if (body.data.agentPhone.trim() !== '') {
      propertyId = id;
      break;
    }
  }
  test.skip(propertyId === null, 'no listing with agent phone for mobile bar');
  if (propertyId === null) return;

  const consent = new ConsentPage(page);
  const mobile = new MobileShellPage(page);
  await page.goto(`/properties/${propertyId}/`);
  await consent.acceptAllIfVisible();
  await expect(page.getByTestId(propertyElements.page)).toBeVisible();
  await mobile.expectAgentBarVisible();
  await expect(page.getByTestId(mobileShellElements.agentCall)).toHaveAttribute('href', /^tel:/);
});

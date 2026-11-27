import { expect, test } from '@playwright/test';

import { ConsentPage } from '../pages/consent.page.ts';
import { homeElements } from '../pages/home.elements.ts';

const SECTIONS = [
  '/sell-with-us/',
  '/properties/',
  '/about/',
  '/team/',
  '/articles/',
  '/services/',
  '/documents/',
  '/legal-services/',
  '/investments/',
  '/investments/businesses/',
  '/contact/',
];

for (const prefix of ['', '/en']) {
  test(`English section URLs open in ${prefix === '' ? 'BG' : 'EN'} locale`, async ({ page }) => {
    for (const section of SECTIONS) {
      const response = await page.goto(`${prefix}${section}`);
      expect(response?.status(), `${prefix}${section}`).toBe(200);
      await expect(page.getByTestId(homeElements.logo), `${prefix}${section}`).toBeVisible();
    }
  });
}

test('old transliteration section URL is not served (no redirect required)', async ({ page }) => {
  const response = await page.goto('/prodai-s-nas/');
  expect(response?.status()).toBe(404);
});

test('main navigation links point to English section paths', async ({ page }, testInfo) => {
  const consent = new ConsentPage(page);
  await page.goto('/');
  await consent.acceptAllIfVisible();

  // On phone, open the hamburger so mobile nav links are in the DOM and asserted.
  if (testInfo.project.name === 'public-mobile') {
    await page.getByTestId('mobile-nav-toggle').click({ force: true });
    await expect(page.getByTestId('mobile-nav')).toBeVisible();
  }

  const hrefs: string[] = [];
  for (const link of await page.locator('header a[href]').all()) {
    const href = await link.getAttribute('href');
    if (href !== null) hrefs.push(new URL(href, 'http://localhost').pathname);
  }
  expect(hrefs).toContain('/properties/');
  expect(hrefs).toContain('/sell-with-us/');
  for (const old of ['/obiavi/', '/prodai-s-nas/', '/ekip/', '/za-nas/', '/stati/']) {
    expect(hrefs).not.toContain(old);
  }
});

import { type APIRequestContext, expect, type Locator, test } from '@playwright/test';

import { ConsentPage } from '../pages/consent.page.ts';
import { propertyElements } from '../pages/property.elements.ts';

const API_URL = process.env.E2E_API_URL ?? 'http://localhost:4000';
const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

async function collectHrefs(locator: Locator): Promise<string[]> {
  const hrefs: string[] = [];
  for (const link of await locator.all()) hrefs.push((await link.getAttribute('href')) ?? '');
  return hrefs;
}

interface Ids {
  property: string;
  article: string;
  team: string;
  page: string;
  privacy: string;
  landing: string;
}

async function getData<T>(request: APIRequestContext, path: string): Promise<T> {
  const response = await request.get(`${API_URL}/v1/public${path}`);
  expect(response.ok(), path).toBe(true);
  return ((await response.json()) as { data: T }).data;
}

async function resolveIds(request: APIRequestContext): Promise<Ids> {
  const [property, articles, team, privacy, landing] = await Promise.all([
    getData<{ id: string }>(request, '/properties/demo-tristaen-malinova-dolina'),
    getData<{ id: string }[]>(request, '/articles?lang=bg'),
    getData<{ id: string; slug: string }[]>(request, '/team?lang=bg'),
    getData<{ id: string }>(request, '/pages/privacy?lang=bg'),
    getData<{ id: string }>(request, '/landings/za-prodavachi?lang=bg'),
  ]);
  const article = articles[0];
  const member = team[0];
  if (article === undefined || member === undefined) throw new Error('seed content missing');
  return {
    property: property.id,
    article: article.id,
    team: member.id,
    page: privacy.id,
    privacy: privacy.id,
    landing: landing.id,
  };
}

for (const prefix of ['', '/en']) {
  const label = prefix === '' ? 'BG' : 'EN';

  test.describe(`detail pages by id (${label})`, () => {
    test('property, article, team, CMS page and campaign open at /{section}/{id}/', async ({
      page,
      request,
    }) => {
      const ids = await resolveIds(request);
      const cases = [
        { path: `/properties/${ids.property}/`, testId: propertyElements.page },
        { path: `/articles/${ids.article}/`, testId: 'article-page' },
        { path: `/team/${ids.team}/`, testId: 'team-member-page' },
        { path: `/pages/${ids.page}/`, testId: 'cms-page' },
        { path: `/campaigns/${ids.landing}/`, testId: 'landing-page' },
      ];
      for (const { path, testId } of cases) {
        const response = await page.goto(`${prefix}${path}`);
        expect(response?.status(), `${prefix}${path}`).toBe(200);
        await expect(page.getByTestId(testId), `${prefix}${path}`).toBeVisible();
        await expect(page.getByTestId('not-found'), `${prefix}${path}`).toHaveCount(0);
      }
    });

    test('unknown id shows the not-found page for every detail section', async ({ page }) => {
      for (const section of ['properties', 'articles', 'team', 'pages', 'campaigns']) {
        await page.goto(`${prefix}/${section}/${UNKNOWN_ID}/`);
        await expect(page.getByTestId('not-found'), `${prefix}/${section}`).toBeVisible();
      }
    });
  });
}

test('old slug detail URLs are not resolved (no redirect required)', async ({ page, request }) => {
  const ids = await resolveIds(request);
  expect(ids.property).toBeTruthy();
  await page.goto('/properties/demo-tristaen-malinova-dolina/');
  await expect(page.getByTestId('not-found')).toBeVisible();
  await expect(page).toHaveURL(/\/properties\/demo-tristaen-malinova-dolina\/?$/);
});

test('listing cards link to /properties/{id}', async ({ page, request }) => {
  const ids = await resolveIds(request);
  const consent = new ConsentPage(page);
  await page.goto('/properties/');
  await consent.acceptAllIfVisible();
  const hrefs = await collectHrefs(page.locator('[data-testid^="property-card-"] a[href]'));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) expect(href).toMatch(/^\/properties\/[0-9a-f-]{36}\/?$/);
  expect(hrefs.some((href) => href.includes(ids.property))).toBe(true);
});

test('article and team lists link to id-based detail pages', async ({ page }) => {
  const consent = new ConsentPage(page);
  await page.goto('/articles/');
  await consent.acceptAllIfVisible();
  const articleHrefs = await collectHrefs(page.locator('a[data-testid^="article-card-"]'));
  expect(articleHrefs.length).toBeGreaterThan(0);
  for (const href of articleHrefs) expect(href).toMatch(/^\/articles\/[0-9a-f-]{36}\/?$/);

  await page.goto('/team/');
  const teamHrefs = await collectHrefs(page.locator('a[data-testid^="team-card-"]'));
  expect(teamHrefs.length).toBeGreaterThan(0);
  for (const href of teamHrefs) expect(href).toMatch(/^\/team\/[0-9a-f-]{36}\/?$/);
});

test('footer privacy link opens the CMS page by id', async ({ page, request }) => {
  const ids = await resolveIds(request);
  const consent = new ConsentPage(page);
  await page.goto('/');
  await consent.acceptAllIfVisible();
  const privacy = page.getByTestId('footer-privacy');
  await expect(privacy).toHaveAttribute('href', new RegExp(`/pages/${ids.privacy}/?$`));
  await privacy.click();
  await expect(page).toHaveURL(new RegExp(`/pages/${ids.privacy}/?$`));
  await expect(page.getByTestId('cms-page')).toBeVisible();
});

async function findPropertyWithAgent(
  request: APIRequestContext,
): Promise<{ id: string; agentId: string } | null> {
  const list = await getData<{ id: string }[]>(request, '/properties?limit=48&lang=bg');
  for (const { id } of list) {
    const detail = await getData<{ agentId: string | null }>(request, `/properties/by-id/${id}`);
    if (detail.agentId !== null) return { id, agentId: detail.agentId };
  }
  return null;
}

test('property page links the agent to /team/{id} (desktop and mobile bar)', async ({
  page,
  request,
}) => {
  const withAgent = await findPropertyWithAgent(request);
  test.skip(withAgent === null, 'no published listing with a public agent in this dataset');
  if (withAgent === null) return;

  const consent = new ConsentPage(page);
  await page.goto(`/properties/${withAgent.id}/`);
  await consent.acceptAllIfVisible();
  const mobileBar = page.getByTestId('mobile-agent-profile-link');
  await expect(mobileBar).toHaveAttribute('href', new RegExp(`/team/${withAgent.agentId}/?$`));
  await expect(mobileBar.getAttribute('href')).resolves.not.toContain('undefined');

  const link = page.getByTestId('agent-profile-link');
  await expect(link).toHaveAttribute('href', new RegExp(`/team/${withAgent.agentId}/?$`));
  await link.click();
  await expect(page).toHaveURL(new RegExp(`/team/${withAgent.agentId}/?$`));
  await expect(page.getByTestId('team-member-page')).toBeVisible();
});

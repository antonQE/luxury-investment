import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PRIMARY_NAV } from '../src/components/layout/nav';

vi.mock('server-only', () => ({}));

const { fetchProperties } = vi.hoisted(() => ({ fetchProperties: vi.fn() }));
vi.mock('@/lib/api/catalog', () => ({ fetchProperties }));
const { fetchLegalPageIds } = vi.hoisted(() => ({ fetchLegalPageIds: vi.fn() }));
vi.mock('@/lib/api/content', () => ({ fetchLegalPageIds }));
vi.mock('@/lib/config/env', () => ({ serverEnv: () => ({ SITE_URL: 'https://example.test' }) }));

import sitemap from '../src/app/sitemap';

const SITE = 'https://example.test';
const PROPERTY_ID = '11111111-1111-4111-8111-111111111111';
const PRIVACY_ID = '22222222-2222-4222-8222-222222222222';
const TERMS_ID = '33333333-3333-4333-8333-333333333333';

const ENGLISH_SECTIONS = [
  '/properties/',
  '/about/',
  '/team/',
  '/articles/',
  '/sell-with-us/',
  '/services/',
  '/contact/',
  '/investments/',
  '/investments/businesses/',
  '/legal-services/',
  '/documents/',
];

const OLD_SEGMENTS = [
  'obiavi',
  'prodai-s-nas',
  'ekip',
  'za-nas',
  'stati',
  'uslugi',
  'dokumenti',
  'investicii',
  'biznesi',
  'advokatski-uslugi',
  'stranici',
  'kampanii',
];

describe('sitemap (LI-125 English section paths)', () => {
  beforeEach(() => {
    fetchProperties.mockReset();
    fetchLegalPageIds.mockReset();
    fetchLegalPageIds.mockResolvedValue({ privacy: PRIVACY_ID, terms: TERMS_ID });
    fetchProperties.mockResolvedValue({
      data: [{ id: PROPERTY_ID, slug: 'demo-flat', publishedAt: '2026-01-01T00:00:00.000Z' }],
      total: 1,
      limit: 48,
      offset: 0,
    });
  });

  it('lists every English section path for BG (unprefixed) and EN (/en/)', async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    for (const path of ENGLISH_SECTIONS) {
      expect(urls, `bg ${path}`).toContain(`${SITE}${path}`);
      expect(urls, `en ${path}`).toContain(`${SITE}/en${path}`);
    }
    expect(urls).toContain(`${SITE}/pages/${PRIVACY_ID}/`);
    expect(urls).toContain(`${SITE}/en/pages/${TERMS_ID}/`);
  });

  it('uses /properties/{id}/ for property detail URLs (LI-126)', async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls).toContain(`${SITE}/properties/${PROPERTY_ID}/`);
    expect(urls).toContain(`${SITE}/en/properties/${PROPERTY_ID}/`);
    expect(urls.some((url) => url.includes('demo-flat'))).toBe(false);
  });

  it('contains no old transliteration segments', async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    for (const url of urls) {
      const segments = new URL(url).pathname.split('/').filter(Boolean);
      for (const old of OLD_SEGMENTS) {
        expect(segments, url).not.toContain(old);
      }
    }
  });

  it('still lists static sections when the API is down', async () => {
    fetchProperties.mockRejectedValue(new Error('503'));
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls).toContain(`${SITE}/sell-with-us/`);
    expect(urls).toContain(`${SITE}/en/properties/`);
  });
});

describe('section routes and navigation (LI-125)', () => {
  const appDir = fileURLToPath(new URL('../src/app/[locale]/', import.meta.url));

  it('has an App Router folder for every English section and none for the old ones', () => {
    for (const path of ENGLISH_SECTIONS.filter((p) => p !== '/contact/')) {
      expect(existsSync(`${appDir}${path.slice(1)}page.tsx`), path).toBe(true);
    }
    for (const old of [
      'obiavi',
      'prodai-s-nas',
      'ekip',
      'za-nas',
      'stati',
      'uslugi',
      'dokumenti',
      'investicii',
      'advokatski-uslugi',
      'stranici',
      'kampanii',
    ]) {
      expect(existsSync(`${appDir}${old}`), old).toBe(false);
    }
  });

  it('primary navigation links only to English section paths that have a page', () => {
    const hrefs: string[] = [];
    for (const item of PRIMARY_NAV) {
      if ('href' in item) hrefs.push(item.href);
      if ('children' in item) for (const child of item.children) hrefs.push(child.href);
    }
    expect(hrefs).toContain('/sell-with-us');
    expect(hrefs).toContain('/properties');
    for (const href of hrefs) {
      if (href === '/') continue;
      expect(existsSync(`${appDir}${href.slice(1)}/page.tsx`), href).toBe(true);
    }
  });
});

import { describe, expect, it } from 'vitest';

import { absoluteUrl, hreflangLanguages, localePath, normalizePath } from '../src/lib/seo/paths';

describe('seo paths', () => {
  it('normalizes paths with trailing slash', () => {
    expect(normalizePath('/')).toBe('/');
    expect(normalizePath('/obiavi/')).toBe('/obiavi/');
    expect(normalizePath('obiavi/foo')).toBe('/obiavi/foo/');
  });

  it('prefixes English only', () => {
    expect(localePath('bg', '/')).toBe('/');
    expect(localePath('bg', '/obiavi')).toBe('/obiavi/');
    expect(localePath('en', '/')).toBe('/en/');
    expect(localePath('en', '/obiavi/demo')).toBe('/en/obiavi/demo/');
  });

  it('builds absolute URLs and hreflang map', () => {
    const site = 'https://luxuryinvestment.bg';
    expect(absoluteUrl(site, 'bg', '/za-nas')).toBe('https://luxuryinvestment.bg/za-nas/');
    expect(absoluteUrl(site, 'en', '/za-nas')).toBe('https://luxuryinvestment.bg/en/za-nas/');
    expect(hreflangLanguages(site, '/obiavi')).toEqual({
      bg: 'https://luxuryinvestment.bg/obiavi/',
      en: 'https://luxuryinvestment.bg/en/obiavi/',
      'x-default': 'https://luxuryinvestment.bg/obiavi/',
    });
  });
});

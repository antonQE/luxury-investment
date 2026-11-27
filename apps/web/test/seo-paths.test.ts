import { describe, expect, it } from 'vitest';

import { absoluteUrl, hreflangLanguages, localePath, normalizePath } from '../src/lib/seo/paths';

describe('seo paths', () => {
  it('normalizes paths with trailing slash', () => {
    expect(normalizePath('/')).toBe('/');
    expect(normalizePath('/properties/')).toBe('/properties/');
    expect(normalizePath('properties/foo')).toBe('/properties/foo/');
  });

  it('prefixes English only', () => {
    expect(localePath('bg', '/')).toBe('/');
    expect(localePath('bg', '/properties')).toBe('/properties/');
    expect(localePath('en', '/')).toBe('/en/');
    expect(localePath('en', '/properties/demo')).toBe('/en/properties/demo/');
  });

  it('builds absolute URLs and hreflang map', () => {
    const site = 'https://luxuryinvestment.bg';
    expect(absoluteUrl(site, 'bg', '/about')).toBe('https://luxuryinvestment.bg/about/');
    expect(absoluteUrl(site, 'en', '/about')).toBe('https://luxuryinvestment.bg/en/about/');
    expect(hreflangLanguages(site, '/properties')).toEqual({
      bg: 'https://luxuryinvestment.bg/properties/',
      en: 'https://luxuryinvestment.bg/en/properties/',
      'x-default': 'https://luxuryinvestment.bg/properties/',
    });
  });
});

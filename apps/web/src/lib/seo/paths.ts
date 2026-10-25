import { DEFAULT_LOCALE, type Locale, LOCALES } from '@luxury-investment/shared';

/** Normalize to a leading-slash path with trailing slash (matches `trailingSlash: true`). */
export function normalizePath(path: string): string {
  if (path === '' || path === '/') return '/';
  const withSlash = path.startsWith('/') ? path : `/${path}`;
  const trimmed = withSlash.replace(/\/+$/, '') || '/';
  return trimmed === '/' ? '/' : `${trimmed}/`;
}

/** Locale-prefixed path: BG unprefixed, EN under `/en`. */
export function localePath(locale: Locale, path: string): string {
  const normalized = normalizePath(path);
  if (locale === DEFAULT_LOCALE) return normalized;
  return normalized === '/' ? '/en/' : `/en${normalized}`;
}

export function absoluteUrl(siteUrl: string, locale: Locale, path: string): string {
  const base = siteUrl.replace(/\/+$/, '');
  return `${base}${localePath(locale, path)}`;
}

/** hreflang map including `x-default` → Bulgarian. */
export function hreflangLanguages(siteUrl: string, path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = absoluteUrl(siteUrl, locale, path);
  }
  languages['x-default'] = absoluteUrl(siteUrl, DEFAULT_LOCALE, path);
  return languages;
}

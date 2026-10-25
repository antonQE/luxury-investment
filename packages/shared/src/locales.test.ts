import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, LOCALES, localeSchema } from './locales.ts';

describe('localeSchema', () => {
  it.each(LOCALES)('accepts %s', (locale) => {
    expect(localeSchema.parse(locale)).toBe(locale);
  });

  it.each(['de', 'BG', '', 'bg-BG'])('rejects %j', (value) => {
    expect(localeSchema.safeParse(value).success).toBe(false);
  });

  it('uses Bulgarian as the default locale', () => {
    expect(DEFAULT_LOCALE).toBe('bg');
    expect(LOCALES).toContain(DEFAULT_LOCALE);
  });
});

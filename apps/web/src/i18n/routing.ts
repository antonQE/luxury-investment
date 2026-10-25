import { DEFAULT_LOCALE, LOCALES } from '@luxury-investment/shared';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  // Bulgarian without a prefix, English under /en/, exactly like the current site.
  localePrefix: 'as-needed',
  // Never redirect by cookie or Accept-Language: "/" must always be Bulgarian for visitors and bots.
  localeDetection: false,
});

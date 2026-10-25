import { notFound } from 'next/navigation';
import * as rootParams from 'next/root-params';
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

export default getRequestConfig(async ({ locale: override }) => {
  // Route Handlers and Server Actions cannot read root params yet; they pass the locale explicitly.
  const requested = override ?? (await rootParams.locale());
  if (!hasLocale(routing.locales, requested)) notFound();

  const messages = (await import(`../messages/${requested}.json`)) as { default: IntlMessages };
  return { locale: requested, messages: messages.default };
});

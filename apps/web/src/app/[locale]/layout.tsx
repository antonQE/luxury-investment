import '../globals.css';

import type { Metadata } from 'next';
import { Source_Sans_3, Source_Serif_4 } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { Analytics } from '@/components/consent/Analytics';
import { CookieConsentBanner } from '@/components/consent/CookieConsentBanner';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { routing } from '@/i18n/routing';
import { serverEnv } from '@/lib/config/env';

const display = Source_Serif_4({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600'],
  variable: '--font-display',
});

const body = Source_Sans_3({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '600'],
  variable: '--font-body',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Meta');
  return {
    metadataBase: new URL(serverEnv().SITE_URL),
    title: { default: t('defaultTitle'), template: `%s | ${t('siteName')}` },
    description: t('defaultDescription'),
  };
}

export default async function LocaleLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <NextIntlClientProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
          <CookieConsentBanner />
          <Analytics measurementId={serverEnv().NEXT_PUBLIC_GA4_MEASUREMENT_ID} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

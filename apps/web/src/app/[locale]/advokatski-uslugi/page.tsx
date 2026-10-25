import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Investments');
  const locale = await getLocale();
  return buildPageMetadata({
    locale,
    path: '/advokatski-uslugi',
    title: t('legalTitle'),
    description: t('legalLead'),
  });
}

export default async function LegalServicesPage() {
  const t = await getTranslations('Investments');

  return (
    <main
      className="mx-auto max-w-3xl px-6 py-16 animate-fade-up"
      data-testid="legal-services-page"
    >
      <h1 className="font-serif text-4xl">{t('legalTitle')}</h1>
      <p className="mt-4 text-lg text-ink-soft">{t('legalLead')}</p>
    </main>
  );
}

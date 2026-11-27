import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { PageHero } from '@/components/ui/PageHero';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Investments');
  const locale = await getLocale();
  return buildPageMetadata({
    locale,
    path: '/legal-services',
    title: t('legalTitle'),
    description: t('legalLead'),
  });
}

export default async function LegalServicesPage() {
  const t = await getTranslations('Investments');
  const meta = await getTranslations('Meta');

  return (
    <main data-testid="legal-services-page">
      <PageHero eyebrow={meta('siteName')} title={t('legalTitle')} lead={t('legalLead')} />
      <div className="h-24 md:h-40" aria-hidden />
    </main>
  );
}

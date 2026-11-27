import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { PageHero } from '@/components/ui/PageHero';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Investments');
  const locale = await getLocale();
  return buildPageMetadata({
    locale,
    path: '/investments/businesses',
    title: t('businessesTitle'),
    description: t('businessesLead'),
  });
}

export default async function BusinessesPage() {
  const t = await getTranslations('Investments');
  const meta = await getTranslations('Meta');

  return (
    <main data-testid="businesses-page">
      <PageHero
        eyebrow={meta('siteName')}
        title={t('businessesTitle')}
        lead={t('businessesLead')}
      />
      <div className="h-24 md:h-40" aria-hidden />
    </main>
  );
}

import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('About');
  const locale = await getLocale();
  return buildPageMetadata({
    locale,
    path: '/about',
    title: t('title'),
    description: t('lead'),
  });
}

export default async function AboutPage() {
  const t = await getTranslations('About');
  const meta = await getTranslations('Meta');

  return (
    <main data-testid="about-page">
      <PageHero eyebrow={meta('siteName')} title={t('title')} lead={t('lead')} />
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <Reveal className="max-w-3xl border-l border-brass pl-8 md:pl-12">
          <p className="font-serif text-xl leading-relaxed text-ink md:text-[1.65rem] md:leading-[1.6]">
            {t('body')}
          </p>
        </Reveal>
      </div>
    </main>
  );
}

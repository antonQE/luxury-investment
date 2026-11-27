import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { Link } from '@/i18n/navigation';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Investments');
  const locale = await getLocale();
  return buildPageMetadata({
    locale,
    path: '/investments',
    title: t('title'),
    description: t('lead'),
  });
}

export default async function InvestmentsPage() {
  const t = await getTranslations('Investments');
  const nav = await getTranslations('Nav');
  const meta = await getTranslations('Meta');

  return (
    <main data-testid="investments-page">
      <PageHero eyebrow={meta('siteName')} title={t('title')} lead={t('lead')} />
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <Reveal className="max-w-3xl">
          <p className="text-lg leading-relaxed text-ink-soft">{t('body')}</p>
        </Reveal>
        <Reveal delay={120} className="mt-14 max-w-3xl border-t border-line">
          <Link
            href="/investments/businesses"
            className="ruled-row group flex items-center justify-between border-b border-line py-7 font-serif text-2xl transition-colors duration-500 hover:text-brass-dark md:text-3xl"
            data-testid="investments-link-businesses"
          >
            {nav('businesses')}
            <span
              className="text-base text-brass transition-transform duration-500 group-hover:translate-x-2"
              aria-hidden
            >
              →
            </span>
          </Link>
        </Reveal>
      </div>
    </main>
  );
}

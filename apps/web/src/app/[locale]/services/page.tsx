import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { buildPageMetadata } from '@/lib/seo/metadata';

const SERVICE_KEYS = ['finance', 'legal', 'analysis', 'invest', 'manage'] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Services');
  const locale = await getLocale();
  return buildPageMetadata({
    locale,
    path: '/services',
    title: t('title'),
    description: t('lead'),
  });
}

export default async function ServicesPage() {
  const t = await getTranslations('Services');
  const meta = await getTranslations('Meta');

  return (
    <main data-testid="services-page">
      <PageHero eyebrow={meta('siteName')} title={t('title')} lead={t('lead')} />
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <ul className="border-t border-line">
          {SERVICE_KEYS.map((key, index) => (
            <Reveal as="li" key={key} delay={index * 70}>
              <div className="ruled-row group flex items-baseline gap-6 border-b border-line py-8 transition-[padding] duration-500 hover:pl-3 md:gap-12 md:py-10">
                <span className="font-serif text-sm tracking-[0.2em] text-brass">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="font-serif text-2xl transition-colors duration-500 group-hover:text-brass-dark md:text-4xl">
                  {t(`items.${key}`)}
                </h2>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </main>
  );
}

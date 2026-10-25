import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { buildPageMetadata } from '@/lib/seo/metadata';

const SERVICE_KEYS = ['finance', 'legal', 'analysis', 'invest', 'manage'] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Services');
  const locale = await getLocale();
  return buildPageMetadata({
    locale,
    path: '/uslugi',
    title: t('title'),
    description: t('lead'),
  });
}

export default async function ServicesPage() {
  const t = await getTranslations('Services');

  return (
    <main className="mx-auto max-w-5xl px-6 py-16" data-testid="services-page">
      <h1 className="font-serif text-4xl">{t('title')}</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-soft">{t('lead')}</p>
      <ul className="mt-10 grid gap-4 md:grid-cols-2">
        {SERVICE_KEYS.map((key) => (
          <li key={key} className="border border-line bg-paper p-6">
            <h2 className="font-serif text-2xl">{t(`items.${key}`)}</h2>
          </li>
        ))}
      </ul>
    </main>
  );
}

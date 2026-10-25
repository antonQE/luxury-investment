import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Investments');
  const locale = await getLocale();
  return buildPageMetadata({
    locale,
    path: '/investicii',
    title: t('title'),
    description: t('lead'),
  });
}

export default async function InvestmentsPage() {
  const t = await getTranslations('Investments');
  const nav = await getTranslations('Nav');

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 animate-fade-up" data-testid="investments-page">
      <h1 className="font-serif text-4xl">{t('title')}</h1>
      <p className="mt-4 text-lg text-ink-soft">{t('lead')}</p>
      <p className="mt-6 leading-relaxed">{t('body')}</p>
      <ul className="mt-10 flex flex-col gap-3 text-sm">
        <li>
          <Link
            href="/investicii/biznesi"
            className="text-brass-dark transition hover:text-brass"
            data-testid="investments-link-businesses"
          >
            {nav('businesses')}
          </Link>
        </li>
        <li>
          <Link
            href="/advokatski-uslugi"
            className="text-brass-dark transition hover:text-brass"
            data-testid="investments-link-legal"
          >
            {nav('legalServices')}
          </Link>
        </li>
      </ul>
    </main>
  );
}

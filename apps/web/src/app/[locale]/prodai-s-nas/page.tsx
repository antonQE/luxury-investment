import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { ConsultationForm } from '@/components/content/ConsultationForm';
import { fetchPage } from '@/lib/api/content';
import { serverEnv } from '@/lib/config/env';
import { buildPageMetadata } from '@/lib/seo/metadata';

const SLUG = 'prodai-s-nas';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('SellWithUs');
  const locale = await getLocale();
  try {
    const page = await fetchPage(locale, SLUG);
    return buildPageMetadata({
      locale,
      path: '/prodai-s-nas',
      title: page.title,
      description: page.body.slice(0, 160),
    });
  } catch {
    return buildPageMetadata({
      locale,
      path: '/prodai-s-nas',
      title: t('title'),
      description: t('lead'),
    });
  }
}

export default async function SellWithUsPage() {
  const t = await getTranslations('SellWithUs');
  const locale = await getLocale();
  const handbookUrl = `${serverEnv().API_URL}/v1/public/documents/seller-handbook?source=sell-with-us`;

  let title = t('title');
  let body = t('body');
  try {
    const page = await fetchPage(locale, SLUG);
    title = page.title;
    body = page.body;
  } catch {
    // CMS copy is optional at build time (API may be down in CI); keep i18n defaults.
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16" data-testid="sell-with-us-page">
      <h1 className="font-serif text-4xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-soft">{t('lead')}</p>
      <div className="mt-8 space-y-4 leading-relaxed whitespace-pre-line">{body}</div>

      <p className="mt-8">
        <a
          href={handbookUrl}
          className="inline-flex border border-brass bg-brass px-5 py-2 text-sm tracking-wide text-void uppercase transition hover:bg-brass-dark"
          data-testid="handbook-download"
        >
          {t('downloadHandbook')}
        </a>
      </p>

      <ol className="mt-12 grid gap-6 sm:grid-cols-2">
        {(['prepare', 'market', 'viewings', 'sale'] as const).map((step, index) => (
          <li key={step} className="border border-line bg-paper p-5">
            <p className="text-xs tracking-[0.2em] uppercase text-brass">
              {String(index + 1).padStart(2, '0')}
            </p>
            <h2 className="mt-2 font-serif text-2xl">{t(`steps.${step}.title`)}</h2>
            <p className="mt-2 text-sm text-ink-soft">{t(`steps.${step}.body`)}</p>
          </li>
        ))}
      </ol>

      <section className="mt-16 max-w-xl" data-testid="sell-with-us-form">
        <h2 className="font-serif text-3xl">{t('formTitle')}</h2>
        <p className="mt-2 text-ink-soft">{t('formLead')}</p>
        <div className="mt-6">
          <ConsultationForm />
        </div>
      </section>
    </main>
  );
}

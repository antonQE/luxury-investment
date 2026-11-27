import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { ConsultationForm } from '@/components/content/ConsultationForm';
import { PlainTextBody } from '@/components/content/PlainTextBody';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
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
      path: '/sell-with-us',
      title: page.title,
      description: page.body.slice(0, 160),
    });
  } catch {
    return buildPageMetadata({
      locale,
      path: '/sell-with-us',
      title: t('title'),
      description: t('lead'),
    });
  }
}

export default async function SellWithUsPage() {
  const t = await getTranslations('SellWithUs');
  const meta = await getTranslations('Meta');
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
    <main data-testid="sell-with-us-page">
      <PageHero eyebrow={meta('siteName')} title={title} lead={t('lead')}>
        <a
          href={handbookUrl}
          className="inline-flex border border-brass bg-brass px-6 py-3 text-xs tracking-[0.2em] text-void uppercase transition duration-300 hover:bg-stone"
          data-testid="handbook-download"
        >
          {t('downloadHandbook')}
        </a>
      </PageHero>

      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <Reveal className="max-w-3xl">
          <PlainTextBody
            text={body}
            className="space-y-5 text-lg leading-relaxed text-ink-soft"
            testId="sell-with-us-body"
          />
        </Reveal>

        <ol className="mt-20 grid gap-x-14 gap-y-12 border-t border-line pt-14 sm:grid-cols-2">
          {(['prepare', 'market', 'viewings', 'sale'] as const).map((step, index) => (
            <Reveal as="li" key={step} delay={(index % 2) * 110}>
              <p className="font-serif text-sm tracking-[0.2em] text-brass">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h2 className="mt-3 font-serif text-2xl md:text-3xl">{t(`steps.${step}.title`)}</h2>
              <p className="mt-3 text-ink-soft">{t(`steps.${step}.body`)}</p>
            </Reveal>
          ))}
        </ol>
      </div>

      <section
        className="border-t border-line bg-paper/60 px-6 py-20 md:py-28"
        data-testid="sell-with-us-form"
      >
        <Reveal className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <p className="flex items-center gap-3 text-[11px] tracking-[0.24em] uppercase text-brass">
              <span className="h-px w-8 bg-brass" aria-hidden />
              {meta('siteName')}
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-[2.5rem]">{t('formTitle')}</h2>
            <p className="mt-3 text-ink-soft">{t('formLead')}</p>
            <div className="mt-8">
              <ConsultationForm />
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}

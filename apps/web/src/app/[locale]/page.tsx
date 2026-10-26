import { MARKETS, type PublicPartner } from '@luxury-investment/shared';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { PropertyGrid } from '@/components/property/PropertyGrid';
import { SearchForm } from '@/components/search/SearchForm';
import { Link } from '@/i18n/navigation';
import { fetchProperties } from '@/lib/api/catalog';
import { fetchPartners } from '@/lib/api/team';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Meta');
  const locale = await getLocale();
  return buildPageMetadata({
    locale,
    path: '/',
    title: t('defaultTitle'),
    description: t('defaultDescription'),
  });
}

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=80';

export default async function HomePage() {
  const t = await getTranslations('Home');
  const markets = await getTranslations('Markets');
  const locale = await getLocale();

  let newest;
  let loadError = false;
  let partners: PublicPartner[] = [];
  try {
    newest = await fetchProperties(locale, { limit: '6' });
  } catch {
    newest = { data: [], total: 0, offset: 0, limit: 6 };
    loadError = true;
  }
  try {
    partners = await fetchPartners(locale);
  } catch {
    /* keep empty */
  }

  return (
    <main>
      <section
        className="relative isolate min-h-[88vh] overflow-hidden text-stone"
        data-testid="home-hero"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- full-bleed hero atmosphere */}
        <img src={HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-void/75 via-void/70 to-void/90" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-6 pb-16 pt-28 md:pb-24 md:pt-32">
          <p className="animate-fade-up font-serif text-3xl tracking-[0.04em] text-stone md:text-5xl">
            Luxury Investment
          </p>
          <h1
            className="animate-fade-up mt-5 max-w-2xl font-serif text-2xl leading-snug text-stone/90 md:text-3xl md:leading-snug"
            style={{ animationDelay: '80ms' }}
          >
            {t('title')}
          </h1>
          <p
            className="animate-fade-up mt-4 max-w-xl text-base text-stone/65 md:text-lg"
            style={{ animationDelay: '140ms' }}
          >
            {t('lead')}
          </p>
          <div className="animate-fade-up mt-12 max-w-4xl" style={{ animationDelay: '220ms' }}>
            <SearchForm variant="hero" />
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-6 py-20 animate-fade-up"
        style={{ animationDelay: '60ms' }}
        data-testid="home-markets"
      >
        <p className="text-[11px] tracking-[0.22em] uppercase text-brass">{t('marketsTitle')}</p>
        <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-12">
          {MARKETS.map((market, index) => (
            <Link
              key={market}
              href={`/obiavi?market=${market}`}
              className="group block border-t border-line pt-6 transition hover:border-brass"
              style={{ animationDelay: `${String(100 + index * 60)}ms` }}
              data-testid={`market-${market}`}
            >
              <h2 className="font-serif text-3xl transition group-hover:text-brass-dark">
                {markets(market)}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {markets(`${market}Lead`)}
              </p>
              <span className="mt-5 inline-block text-xs tracking-[0.18em] uppercase text-brass opacity-0 transition group-hover:opacity-100">
                {t('viewAll')} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24" data-testid="home-newest">
        <div className="mb-10 flex items-end justify-between gap-4 border-b border-line pb-6">
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase text-brass">{t('newestTitle')}</p>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl">{t('newestLead')}</h2>
          </div>
          <Link
            href="/obiavi"
            className="shrink-0 text-xs tracking-[0.18em] uppercase text-brass-dark transition hover:text-brass"
            data-testid="home-view-all"
          >
            {t('viewAll')}
          </Link>
        </div>
        {loadError ? (
          <p className="text-ink-soft" data-testid="home-error">
            {t('error')}
          </p>
        ) : (
          <PropertyGrid items={newest.data} />
        )}
      </section>

      {partners.length > 0 ? (
        <section
          className="border-t border-line bg-paper/60 px-6 py-20 backdrop-blur-sm"
          data-testid="home-partners"
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-[11px] tracking-[0.22em] uppercase text-brass">
              {t('partnersTitle')}
            </p>
            <h2 className="mt-2 font-serif text-3xl">{t('partnersLead')}</h2>
            <ul className="mt-12 flex flex-wrap items-center gap-x-12 gap-y-8">
              {partners.map((partner) => (
                <li key={partner.id}>
                  <a
                    href={partner.websiteUrl ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block grayscale transition hover:grayscale-0 hover:opacity-100 opacity-70"
                    data-testid={`partner-${partner.slug}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- partner logos are remote URLs */}
                    <img
                      src={partner.logoUrl}
                      alt={partner.name}
                      className="h-10 w-auto max-w-[140px] object-contain"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  );
}

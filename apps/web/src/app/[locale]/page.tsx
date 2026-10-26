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
        className="animate-fade-up bg-void px-6 py-20 text-stone md:py-28"
        data-testid="home-hero"
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-xs tracking-[0.3em] uppercase text-brass">{t('eyebrow')}</p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight md:text-6xl md:leading-[1.1]">
            {t('title')}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-stone/75">{t('lead')}</p>
          <div className="mt-10 max-w-4xl">
            <p className="mb-3 text-xs tracking-[0.2em] uppercase text-stone/60">
              {t('searchTitle')}
            </p>
            <SearchForm />
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-6 py-16 animate-fade-up"
        style={{ animationDelay: '120ms' }}
        data-testid="home-markets"
      >
        <h2 className="font-serif text-3xl">{t('marketsTitle')}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {MARKETS.map((market) => (
            <Link
              key={market}
              href={`/obiavi?market=${market}`}
              className="border border-line bg-paper p-6 transition hover:border-brass"
              data-testid={`market-${market}`}
            >
              <h3 className="font-serif text-2xl">{markets(market)}</h3>
              <p className="mt-2 text-sm text-ink-soft">{markets(`${market}Lead`)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20" data-testid="home-newest">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl">{t('newestTitle')}</h2>
            <p className="mt-2 text-sm text-ink-soft">{t('newestLead')}</p>
          </div>
          <Link
            href="/obiavi"
            className="text-sm tracking-wide uppercase text-brass-dark transition hover:text-brass"
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
        <section className="border-t border-line bg-paper px-6 py-16" data-testid="home-partners">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-serif text-3xl">{t('partnersTitle')}</h2>
            <p className="mt-2 text-sm text-ink-soft">{t('partnersLead')}</p>
            <ul className="mt-10 flex flex-wrap items-center gap-8">
              {partners.map((partner) => (
                <li key={partner.id}>
                  <a
                    href={partner.websiteUrl ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block opacity-80 transition hover:opacity-100"
                    data-testid={`partner-${partner.slug}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- partner logos are remote URLs */}
                    <img
                      src={partner.logoUrl}
                      alt={partner.name}
                      className="h-12 w-auto max-w-[160px] object-contain"
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

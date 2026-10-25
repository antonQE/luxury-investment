import { MARKETS } from '@luxury-investment/shared';
import { getLocale, getTranslations } from 'next-intl/server';

import { PropertyGrid } from '@/components/property/PropertyGrid';
import { SearchForm } from '@/components/search/SearchForm';
import { Link } from '@/i18n/navigation';
import { fetchProperties } from '@/lib/api/catalog';

export default async function HomePage() {
  const t = await getTranslations('Home');
  const markets = await getTranslations('Markets');
  const locale = await getLocale();

  let newest;
  let loadError = false;
  try {
    newest = await fetchProperties(locale, { limit: '6' });
  } catch {
    newest = { data: [], total: 0, offset: 0, limit: 6 };
    loadError = true;
  }

  return (
    <main>
      <section className="bg-ink px-6 py-20 text-cream md:py-28" data-testid="home-hero">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs tracking-[0.3em] uppercase text-gold">{t('eyebrow')}</p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight md:text-6xl">
            {t('title')}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-cream/75">{t('lead')}</p>
          <div className="mt-10 max-w-4xl">
            <p className="mb-3 text-xs tracking-[0.2em] uppercase text-cream/60">
              {t('searchTitle')}
            </p>
            <SearchForm />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16" data-testid="home-markets">
        <h2 className="font-serif text-3xl">{t('marketsTitle')}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {MARKETS.map((market) => (
            <Link
              key={market}
              href={`/obiavi?market=${market}`}
              className="border border-cream-dark bg-paper p-6 transition hover:border-gold"
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
            className="text-sm tracking-wide uppercase text-gold-dark hover:text-gold"
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
    </main>
  );
}

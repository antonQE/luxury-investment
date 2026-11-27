import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { PropertyGrid } from '@/components/property/PropertyGrid';
import { SearchForm } from '@/components/search/SearchForm';
import { SearchRequestForm } from '@/components/search/SearchRequestForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { Link } from '@/i18n/navigation';
import { type CatalogFilters, fetchProperties } from '@/lib/api/catalog';
import { buildPageMetadata } from '@/lib/seo/metadata';

interface ListingsPageProps {
  searchParams: Promise<CatalogFilters>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Listings');
  const meta = await getTranslations('Meta');
  const locale = await getLocale();
  return buildPageMetadata({
    locale,
    path: '/properties',
    title: t('title'),
    description: meta('defaultDescription'),
  });
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const filters = await searchParams;
  const t = await getTranslations('Listings');
  const meta = await getTranslations('Meta');
  const locale = await getLocale();

  let result;
  let loadError = false;
  try {
    result = await fetchProperties(locale, filters);
  } catch {
    result = { data: [], total: 0, offset: 0, limit: 12 };
    loadError = true;
  }

  const prevOffset = Math.max(0, result.offset - result.limit);
  const nextOffset = result.offset + result.limit;
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(filters).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1] !== '',
      ),
    ),
  );

  function hrefFor(offset: number) {
    const next = new URLSearchParams(query);
    if (offset === 0) next.delete('offset');
    else next.set('offset', String(offset));
    const encoded = next.toString();
    return encoded === '' ? '/properties' : `/properties?${encoded}`;
  }

  const filterSummary = new URLSearchParams(
    Object.fromEntries(
      Object.entries(filters).filter(
        (entry): entry is [string, string] =>
          typeof entry[1] === 'string' &&
          entry[1] !== '' &&
          entry[0] !== 'offset' &&
          entry[0] !== 'limit',
      ),
    ),
  ).toString();

  return (
    <main className="w-full" data-testid="listings-page">
      <PageHero
        eyebrow={meta('siteName')}
        title={t('title')}
        lead={t('lead', { count: result.total })}
        leadTestId="listings-count"
      />
      <div className="mx-auto max-w-6xl px-6 pb-24">
        <Reveal className="relative z-10 -mt-12 md:-mt-14">
          <SearchForm values={filters} testId="listings-search" />
        </Reveal>
        <div className="mt-16">
          {loadError ? (
            <p data-testid="listings-error">{t('error')}</p>
          ) : result.data.length === 0 ? (
            <EmptyState
              title={t('empty')}
              hint={t('emptyHint')}
              testId="listings-empty"
              action={
                <Link
                  href="/properties"
                  className="inline-block text-xs tracking-[0.18em] uppercase text-brass-dark transition hover:text-brass"
                >
                  {t('retry')}
                </Link>
              }
            >
              <SearchRequestForm filterSummary={filterSummary} />
            </EmptyState>
          ) : (
            <PropertyGrid items={result.data} />
          )}
        </div>
        {result.total > result.limit ? (
          <nav
            className="mt-16 flex justify-between border-t border-line pt-6 text-xs tracking-[0.18em] uppercase"
            data-testid="listings-pagination"
          >
            {result.offset > 0 ? (
              <Link
                href={hrefFor(prevOffset)}
                className="text-brass-dark transition hover:text-brass"
                data-testid="listings-prev"
              >
                {t('prev')}
              </Link>
            ) : (
              <span />
            )}
            {nextOffset < result.total ? (
              <Link
                href={hrefFor(nextOffset)}
                className="text-brass-dark transition hover:text-brass"
                data-testid="listings-next"
              >
                {t('next')}
              </Link>
            ) : null}
          </nav>
        ) : null}
      </div>
    </main>
  );
}

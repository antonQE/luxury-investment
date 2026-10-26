import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { PropertyGrid } from '@/components/property/PropertyGrid';
import { SearchForm } from '@/components/search/SearchForm';
import { SearchRequestForm } from '@/components/search/SearchRequestForm';
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
    path: '/obiavi',
    title: t('title'),
    description: meta('defaultDescription'),
  });
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const filters = await searchParams;
  const t = await getTranslations('Listings');
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
    return encoded === '' ? '/obiavi' : `/obiavi?${encoded}`;
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
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="font-serif text-4xl">{t('title')}</h1>
      <p className="mt-2 text-sm text-ink-soft" data-testid="listings-count">
        {t('lead', { count: result.total })}
      </p>
      <div className="mt-8">
        <SearchForm values={filters} testId="listings-search" />
      </div>
      <div className="mt-10">
        {loadError ? (
          <p data-testid="listings-error">{t('error')}</p>
        ) : result.data.length === 0 ? (
          <div className="mx-auto max-w-xl bg-paper p-10 text-center" data-testid="listings-empty">
            <p>{t('empty')}</p>
            <p className="mt-2 text-sm text-ink-soft">{t('emptyHint')}</p>
            <Link href="/obiavi" className="mt-4 inline-block text-gold-dark">
              {t('retry')}
            </Link>
            <SearchRequestForm filterSummary={filterSummary} />
          </div>
        ) : (
          <PropertyGrid items={result.data} />
        )}
      </div>
      {result.total > result.limit ? (
        <nav className="mt-10 flex justify-between text-sm" data-testid="listings-pagination">
          {result.offset > 0 ? (
            <Link href={hrefFor(prevOffset)} data-testid="listings-prev">
              {t('prev')}
            </Link>
          ) : (
            <span />
          )}
          {nextOffset < result.total ? (
            <Link href={hrefFor(nextOffset)} data-testid="listings-next">
              {t('next')}
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}

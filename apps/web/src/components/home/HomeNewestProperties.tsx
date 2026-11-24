'use client';

import type { Locale, Paginated, PublicPropertyListItem } from '@luxury-investment/shared';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import { PropertyCard } from '@/components/property/PropertyCard';
import { Link } from '@/i18n/navigation';

const PAGE_SIZE = 8;

async function fetchNewestPage(
  locale: Locale,
  offset: number,
  limit: number,
): Promise<Paginated<PublicPropertyListItem>> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const url = new URL('/v1/public/properties', base);
  url.searchParams.set('lang', locale);
  url.searchParams.set('offset', String(offset));
  url.searchParams.set('limit', String(limit));

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`properties_failed_${String(response.status)}`);
  }
  return (await response.json()) as Paginated<PublicPropertyListItem>;
}

export function HomeNewestProperties({
  initialItems,
  total,
}: {
  initialItems: PublicPropertyListItem[];
  total: number;
}) {
  const t = useTranslations('Home');
  const propertyT = useTranslations('Property');
  const searchT = useTranslations('Search');
  const locale = useLocale();
  const [items, setItems] = useState(initialItems);
  const [knownTotal, setKnownTotal] = useState(total);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const hasMore = items.length < knownTotal;

  function loadMore() {
    setError(null);
    startTransition(async () => {
      try {
        const offset = items.length;
        const page = await fetchNewestPage(locale, offset, PAGE_SIZE);
        if (page.data.length === 0) {
          setKnownTotal(offset);
          return;
        }
        setKnownTotal(page.total);
        setItems((current) => {
          const seen = new Set(current.map((row) => row.id));
          const next = page.data.filter((row) => !seen.has(row.id));
          return [...current, ...next];
        });
      } catch {
        setError(t('loadMoreError'));
      }
    });
  }

  const labels = {
    bedrooms: (count: number) => propertyT('bedrooms', { count }),
    perMonth: propertyT('perMonth'),
    badge: (key: string) => propertyT(key as 'badge_new' | 'badge_exclusive' | 'badge_investment'),
    transaction: (key: string) => searchT(key as 'sale' | 'rent'),
    propertyType: (key: string) => searchT(key as Parameters<typeof searchT>[0]),
  };

  return (
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

      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5"
        data-testid="property-grid"
      >
        {items.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            locale={locale}
            labels={labels}
            compact
          />
        ))}
      </div>

      {error !== null ? (
        <p className="mt-8 text-center text-sm text-ink-soft" data-testid="home-load-more-error">
          {error}
        </p>
      ) : null}

      {hasMore ? (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            className="cursor-pointer border border-ink bg-ink px-8 py-3 text-xs tracking-[0.18em] uppercase text-stone transition hover:border-brass hover:bg-brass-dark"
            onClick={loadMore}
            disabled={pending}
            data-testid="home-load-more"
          >
            {pending ? t('loadMorePending') : t('loadMore')}
          </button>
        </div>
      ) : null}
    </section>
  );
}

export const HOME_NEWEST_PAGE_SIZE = PAGE_SIZE;

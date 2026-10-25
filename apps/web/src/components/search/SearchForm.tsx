'use client';

import { MARKETS, PROPERTY_TYPES, TRANSACTION_TYPES } from '@luxury-investment/shared';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/i18n/navigation';

export interface SearchFormValues {
  transactionType?: string;
  propertyType?: string;
  market?: string;
}

export function SearchForm({
  values = {},
  testId = 'search-form',
}: {
  values?: SearchFormValues;
  testId?: string;
}) {
  const t = useTranslations('Search');
  const markets = useTranslations('Markets');
  const router = useRouter();

  function onSubmit(event: { preventDefault: () => void; currentTarget: HTMLFormElement }) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = new URLSearchParams();
    for (const key of ['transactionType', 'propertyType', 'market'] as const) {
      const value = data.get(key);
      if (typeof value === 'string' && value !== '') query.set(key, value);
    }
    const suffix = query.toString();
    router.push(suffix === '' ? '/obiavi' : `/obiavi?${suffix}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded-sm bg-paper/95 p-4 shadow-lg md:grid-cols-4"
      data-testid={testId}
    >
      <label className="grid gap-1 text-xs tracking-wide uppercase text-ink-soft">
        {t('transaction')}
        <select
          name="transactionType"
          defaultValue={values.transactionType ?? ''}
          className="border border-cream-dark bg-paper px-3 py-2 text-sm text-ink"
          data-testid="filter-transaction"
        >
          <option value="">{t('any')}</option>
          {TRANSACTION_TYPES.map((value) => (
            <option key={value} value={value}>
              {t(value)}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-xs tracking-wide uppercase text-ink-soft">
        {t('type')}
        <select
          name="propertyType"
          defaultValue={values.propertyType ?? ''}
          className="border border-cream-dark bg-paper px-3 py-2 text-sm text-ink"
          data-testid="filter-type"
        >
          <option value="">{t('any')}</option>
          {PROPERTY_TYPES.map((value) => (
            <option key={value} value={value}>
              {t(value)}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-xs tracking-wide uppercase text-ink-soft">
        {t('market')}
        <select
          name="market"
          defaultValue={values.market ?? ''}
          className="border border-cream-dark bg-paper px-3 py-2 text-sm text-ink"
          data-testid="filter-market"
        >
          <option value="">{t('any')}</option>
          {MARKETS.map((value) => (
            <option key={value} value={value}>
              {markets(value)}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="self-end bg-ink px-4 py-2 text-sm tracking-[0.15em] uppercase text-cream hover:bg-gold-dark"
        data-testid="search-submit"
      >
        {t('submit')}
      </button>
    </form>
  );
}

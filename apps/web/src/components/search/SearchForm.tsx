'use client';

import { MARKETS, PROPERTY_TYPES, TRANSACTION_TYPES } from '@luxury-investment/shared';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/i18n/navigation';

export interface SearchFormValues {
  transactionType?: string;
  propertyType?: string;
  market?: string;
  city?: string;
  district?: string;
  bedroomsMin?: string;
  priceMin?: string;
  priceMax?: string;
  areaMin?: string;
  areaMax?: string;
  q?: string;
}

const TEXT_KEYS = [
  'transactionType',
  'propertyType',
  'market',
  'city',
  'district',
  'bedroomsMin',
  'priceMin',
  'priceMax',
  'areaMin',
  'areaMax',
  'q',
] as const;

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
    for (const key of TEXT_KEYS) {
      const value = data.get(key);
      if (typeof value === 'string' && value.trim() !== '') query.set(key, value.trim());
    }
    const suffix = query.toString();
    router.push(suffix === '' ? '/obiavi' : `/obiavi?${suffix}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 border border-line bg-paper p-4 md:grid-cols-4"
      data-testid={testId}
    >
      <label className="grid gap-1 text-xs tracking-wide uppercase text-ink-soft">
        {t('transaction')}
        <select
          name="transactionType"
          defaultValue={values.transactionType ?? ''}
          className="border border-line bg-paper px-3 py-2 text-sm text-ink"
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
          className="border border-line bg-paper px-3 py-2 text-sm text-ink"
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
          className="border border-line bg-paper px-3 py-2 text-sm text-ink"
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
      <label className="grid gap-1 text-xs tracking-wide uppercase text-ink-soft">
        {t('q')}
        <input
          name="q"
          type="search"
          defaultValue={values.q ?? ''}
          placeholder={t('qPlaceholder')}
          className="border border-line bg-paper px-3 py-2 text-sm text-ink"
          data-testid="filter-q"
        />
      </label>
      <label className="grid gap-1 text-xs tracking-wide uppercase text-ink-soft">
        {t('city')}
        <input
          name="city"
          defaultValue={values.city ?? ''}
          className="border border-line bg-paper px-3 py-2 text-sm text-ink"
          data-testid="filter-city"
        />
      </label>
      <label className="grid gap-1 text-xs tracking-wide uppercase text-ink-soft">
        {t('district')}
        <input
          name="district"
          defaultValue={values.district ?? ''}
          className="border border-line bg-paper px-3 py-2 text-sm text-ink"
          data-testid="filter-district"
        />
      </label>
      <label className="grid gap-1 text-xs tracking-wide uppercase text-ink-soft">
        {t('bedroomsMin')}
        <input
          name="bedroomsMin"
          type="number"
          min={0}
          max={20}
          step={1}
          defaultValue={values.bedroomsMin ?? ''}
          className="border border-line bg-paper px-3 py-2 text-sm text-ink"
          data-testid="filter-bedrooms-min"
        />
      </label>
      <label className="grid gap-1 text-xs tracking-wide uppercase text-ink-soft">
        {t('priceMin')}
        <input
          name="priceMin"
          type="number"
          min={0}
          step={1}
          defaultValue={values.priceMin ?? ''}
          className="border border-line bg-paper px-3 py-2 text-sm text-ink"
          data-testid="filter-price-min"
        />
      </label>
      <label className="grid gap-1 text-xs tracking-wide uppercase text-ink-soft">
        {t('priceMax')}
        <input
          name="priceMax"
          type="number"
          min={0}
          step={1}
          defaultValue={values.priceMax ?? ''}
          className="border border-line bg-paper px-3 py-2 text-sm text-ink"
          data-testid="filter-price-max"
        />
      </label>
      <label className="grid gap-1 text-xs tracking-wide uppercase text-ink-soft">
        {t('areaMin')}
        <input
          name="areaMin"
          type="number"
          min={0}
          step={1}
          defaultValue={values.areaMin ?? ''}
          className="border border-line bg-paper px-3 py-2 text-sm text-ink"
          data-testid="filter-area-min"
        />
      </label>
      <label className="grid gap-1 text-xs tracking-wide uppercase text-ink-soft">
        {t('areaMax')}
        <input
          name="areaMax"
          type="number"
          min={0}
          step={1}
          defaultValue={values.areaMax ?? ''}
          className="border border-line bg-paper px-3 py-2 text-sm text-ink"
          data-testid="filter-area-max"
        />
      </label>
      <button
        type="submit"
        className="self-end bg-ink px-4 py-2 text-sm tracking-[0.15em] uppercase text-stone transition hover:bg-brass-dark"
        data-testid="search-submit"
      >
        {t('submit')}
      </button>
    </form>
  );
}

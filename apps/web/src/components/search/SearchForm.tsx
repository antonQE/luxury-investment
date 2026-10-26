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
  variant = 'default',
}: {
  values?: SearchFormValues;
  testId?: string;
  variant?: 'default' | 'hero';
}) {
  const t = useTranslations('Search');
  const markets = useTranslations('Markets');
  const router = useRouter();
  const isHero = variant === 'hero';

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

  const labelClass = isHero
    ? 'grid gap-1.5 text-[11px] tracking-[0.18em] uppercase text-stone/55'
    : 'grid gap-1.5 text-[11px] tracking-[0.18em] uppercase text-ink-soft';
  const fieldClass = isHero
    ? 'border-0 border-b border-stone/25 bg-transparent px-0 py-2.5 text-sm text-stone outline-none transition focus:border-brass'
    : 'border-0 border-b border-line bg-transparent px-0 py-2.5 text-sm text-ink outline-none transition focus:border-brass';

  return (
    <form
      onSubmit={onSubmit}
      className={
        isHero
          ? 'grid gap-5 md:grid-cols-4 md:items-end'
          : 'grid gap-5 border border-line/80 bg-paper/80 p-5 backdrop-blur-sm md:grid-cols-4'
      }
      data-testid={testId}
    >
      <label className={labelClass}>
        {t('transaction')}
        <select
          name="transactionType"
          defaultValue={values.transactionType ?? ''}
          className={fieldClass}
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
      <label className={labelClass}>
        {t('type')}
        <select
          name="propertyType"
          defaultValue={values.propertyType ?? ''}
          className={fieldClass}
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
      <label className={labelClass}>
        {t('market')}
        <select
          name="market"
          defaultValue={values.market ?? ''}
          className={fieldClass}
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
      {isHero ? (
        <button
          type="submit"
          className="self-end bg-brass px-6 py-3 text-sm tracking-[0.18em] uppercase text-void transition hover:bg-brass-dark"
          data-testid="search-submit"
        >
          {t('submit')}
        </button>
      ) : (
        <>
          <label className={labelClass}>
            {t('q')}
            <input
              name="q"
              type="search"
              defaultValue={values.q ?? ''}
              placeholder={t('qPlaceholder')}
              className={fieldClass}
              data-testid="filter-q"
            />
          </label>
          <label className={labelClass}>
            {t('city')}
            <input
              name="city"
              defaultValue={values.city ?? ''}
              className={fieldClass}
              data-testid="filter-city"
            />
          </label>
          <label className={labelClass}>
            {t('district')}
            <input
              name="district"
              defaultValue={values.district ?? ''}
              className={fieldClass}
              data-testid="filter-district"
            />
          </label>
          <label className={labelClass}>
            {t('bedroomsMin')}
            <input
              name="bedroomsMin"
              type="number"
              min={0}
              max={20}
              step={1}
              defaultValue={values.bedroomsMin ?? ''}
              className={fieldClass}
              data-testid="filter-bedrooms-min"
            />
          </label>
          <label className={labelClass}>
            {t('priceMin')}
            <input
              name="priceMin"
              type="number"
              min={0}
              step={1}
              defaultValue={values.priceMin ?? ''}
              className={fieldClass}
              data-testid="filter-price-min"
            />
          </label>
          <label className={labelClass}>
            {t('priceMax')}
            <input
              name="priceMax"
              type="number"
              min={0}
              step={1}
              defaultValue={values.priceMax ?? ''}
              className={fieldClass}
              data-testid="filter-price-max"
            />
          </label>
          <label className={labelClass}>
            {t('areaMin')}
            <input
              name="areaMin"
              type="number"
              min={0}
              step={1}
              defaultValue={values.areaMin ?? ''}
              className={fieldClass}
              data-testid="filter-area-min"
            />
          </label>
          <label className={labelClass}>
            {t('areaMax')}
            <input
              name="areaMax"
              type="number"
              min={0}
              step={1}
              defaultValue={values.areaMax ?? ''}
              className={fieldClass}
              data-testid="filter-area-max"
            />
          </label>
          <button
            type="submit"
            className="self-end bg-ink px-6 py-3 text-sm tracking-[0.18em] uppercase text-stone transition hover:bg-brass-dark"
            data-testid="search-submit"
          >
            {t('submit')}
          </button>
        </>
      )}
    </form>
  );
}

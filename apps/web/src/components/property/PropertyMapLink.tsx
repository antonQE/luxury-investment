import { getTranslations } from 'next-intl/server';

import { mapsSearchUrl } from '@/lib/maps';

export async function PropertyMapLink({
  mapQuery,
  locationPrecision,
}: {
  mapQuery: string;
  locationPrecision: 'approximate' | 'exact';
}) {
  const t = await getTranslations('Property');
  if (mapQuery.trim() === '') return null;

  return (
    <p className="mt-4 text-sm" data-testid="property-map">
      <a
        href={mapsSearchUrl(mapQuery)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brass-dark transition hover:text-brass"
        data-testid="property-map-link"
      >
        {t('openMap')}
      </a>
      {locationPrecision === 'approximate' ? (
        <span className="mt-1 block text-xs text-ink-soft">{t('mapApproximate')}</span>
      ) : null}
    </p>
  );
}

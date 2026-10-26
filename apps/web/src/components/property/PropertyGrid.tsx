import type { PublicPropertyListItem } from '@luxury-investment/shared';
import { getLocale, getTranslations } from 'next-intl/server';

import { PropertyCard } from './PropertyCard';

export async function PropertyGrid({ items }: { items: PublicPropertyListItem[] }) {
  const t = await getTranslations('Property');
  const search = await getTranslations('Search');
  const locale = await getLocale();

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="property-grid">
      {items.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          locale={locale}
          labels={{
            bedrooms: (count) => t('bedrooms', { count }),
            perMonth: t('perMonth'),
            badge: (key) => t(key as 'badge_new' | 'badge_exclusive' | 'badge_investment'),
            transaction: (key) => search(key as 'sale' | 'rent'),
            propertyType: (key) =>
              search(key as 'apartment' | 'house' | 'plot' | 'office' | 'hotel'),
          }}
        />
      ))}
    </div>
  );
}

import type { PublicPropertyListItem } from '@luxury-investment/shared';
import { getLocale, getTranslations } from 'next-intl/server';

import { Reveal } from '@/components/ui/Reveal';

import { PropertyCard } from './PropertyCard';

export async function PropertyGrid({ items }: { items: PublicPropertyListItem[] }) {
  const t = await getTranslations('Property');
  const search = await getTranslations('Search');
  const locale = await getLocale();

  return (
    <div
      className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="property-grid"
    >
      {items.map((property, index) => (
        <Reveal key={property.id} delay={(index % 3) * 100} className="h-full">
          <PropertyCard
            property={property}
            locale={locale}
            labels={{
              bedrooms: (count) => t('bedrooms', { count }),
              perMonth: t('perMonth'),
              badge: (key) => t(key as 'badge_new' | 'badge_exclusive' | 'badge_investment'),
              transaction: (key) => search(key as 'sale' | 'rent'),
              propertyType: (key) => search(key as Parameters<typeof search>[0]),
            }}
          />
        </Reveal>
      ))}
    </div>
  );
}

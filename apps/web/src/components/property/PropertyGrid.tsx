import type { PublicProperty } from '@luxury-investment/shared';

import { PropertyCard } from './PropertyCard';

export function PropertyGrid({ items }: { items: PublicProperty[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="property-grid">
      {items.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}

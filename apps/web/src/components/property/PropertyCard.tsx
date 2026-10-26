import type { Locale, PublicPropertyListItem } from '@luxury-investment/shared';

import { PropertyBadge } from '@/components/ui/PropertyBadge';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { Link } from '@/i18n/navigation';
import { formatArea, formatPrice, locationLabel } from '@/lib/format';
import { badgeMessageKey } from '@/lib/labels';

export interface PropertyCardLabels {
  bedrooms: (count: number) => string;
  perMonth: string;
  badge: (key: string) => string;
  transaction: (key: string) => string;
  propertyType: (key: string) => string;
}

export function PropertyCard({
  property,
  locale,
  labels,
}: {
  property: PublicPropertyListItem;
  locale: Locale;
  labels: PropertyCardLabels;
}) {
  const image = property.coverUrl;

  return (
    <article
      className="group flex flex-col overflow-hidden transition duration-500 ease-out hover:-translate-y-1"
      data-testid={`property-card-${property.slug}`}
    >
      <Link
        href={`/obiavi/${property.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-line"
      >
        {image === null ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-ink-soft">
            {property.title}
          </div>
        ) : (
          <RemoteImage
            src={image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/35 via-transparent to-transparent opacity-80" />
        {property.badges.length > 0 ? (
          <ul className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {property.badges.map((badge) => {
              const key = badgeMessageKey(badge);
              return (
                <PropertyBadge
                  key={badge}
                  badge={badge}
                  label={key === undefined ? badge : labels.badge(key)}
                />
              );
            })}
          </ul>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 pt-5">
        <p className="text-[11px] tracking-[0.2em] uppercase text-brass">
          {labels.transaction(property.transactionType)} ·{' '}
          {labels.propertyType(property.propertyType)}
        </p>
        <h3 className="font-serif text-xl leading-snug text-ink md:text-[1.35rem]">
          <Link href={`/obiavi/${property.slug}`} className="transition hover:text-brass-dark">
            {property.title}
          </Link>
        </h3>
        <p className="text-sm text-ink-soft">{locationLabel(property)}</p>
        <p className="mt-auto pt-4 font-serif text-2xl tracking-tight text-ink">
          {formatPrice(locale, property)}
          {property.transactionType === 'rent' ? (
            <span className="ml-1 font-sans text-sm text-ink-soft">{labels.perMonth}</span>
          ) : null}
        </p>
        <p className="text-sm text-ink-soft">
          {formatArea(locale, property.area)}
          {property.bedrooms !== null ? ` · ${labels.bedrooms(property.bedrooms)}` : null}
        </p>
      </div>
    </article>
  );
}

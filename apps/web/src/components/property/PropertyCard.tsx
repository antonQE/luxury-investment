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
  compact = false,
}: {
  property: PublicPropertyListItem;
  locale: Locale;
  labels: PropertyCardLabels;
  compact?: boolean;
}) {
  const image = property.coverUrl;

  return (
    <article
      className={
        compact
          ? 'group flex h-full flex-col bg-stone-deep p-3 shadow-[0_1px_0_rgba(20,22,28,0.04)] transition duration-500 ease-out hover:-translate-y-1 hover:bg-stone-deeper hover:shadow-[0_14px_30px_rgba(20,22,28,0.07)]'
          : 'group flex flex-col overflow-hidden transition duration-500 ease-out hover:-translate-y-1'
      }
      data-testid={`property-card-${property.slug}`}
    >
      <Link
        href={`/obiavi/${property.slug}`}
        className={`relative block overflow-hidden bg-line ${compact ? 'aspect-[3/2]' : 'aspect-[4/3]'}`}
      >
        {image === null ? (
          <div
            className={`flex h-full items-center justify-center px-3 text-center text-ink-soft ${compact ? 'text-xs' : 'text-sm'}`}
          >
            {property.title}
          </div>
        ) : (
          <RemoteImage
            src={image}
            alt=""
            fill
            sizes={
              compact
                ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            }
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/35 via-transparent to-transparent opacity-80 transition duration-500 group-hover:opacity-95" />
        {property.badges.length > 0 ? (
          <ul
            className={`absolute flex flex-wrap ${compact ? 'top-2 left-2 gap-1' : 'top-3 left-3 gap-1.5'}`}
          >
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
      <div
        className={
          compact
            ? 'flex flex-1 flex-col gap-1.5 px-1 pt-3.5 pb-1'
            : 'flex flex-1 flex-col gap-2 pt-5'
        }
      >
        <p
          className={`tracking-[0.2em] uppercase text-brass ${compact ? 'text-[10px]' : 'text-[11px]'}`}
        >
          {labels.transaction(property.transactionType)} ·{' '}
          {labels.propertyType(property.propertyType)}
        </p>
        <h3
          className={`font-serif leading-snug text-ink ${compact ? 'text-base' : 'text-xl md:text-[1.35rem]'}`}
        >
          <Link href={`/obiavi/${property.slug}`} className="transition hover:text-brass-dark">
            {property.title}
          </Link>
        </h3>
        <p className={compact ? 'text-xs text-ink-soft' : 'text-sm text-ink-soft'}>
          {locationLabel(property)}
        </p>
        <div className={compact ? 'mt-auto pt-3' : 'mt-auto pt-4'}>
          <p
            className={`font-serif tracking-tight text-ink transition group-hover:text-brass-dark ${compact ? 'text-lg' : 'text-2xl'}`}
          >
            {formatPrice(locale, property)}
            {property.transactionType === 'rent' ? (
              <span className={`ml-1 font-sans text-ink-soft ${compact ? 'text-xs' : 'text-sm'}`}>
                {labels.perMonth}
              </span>
            ) : null}
          </p>
          <p className={compact ? 'mt-1 text-xs text-ink-soft' : 'text-sm text-ink-soft'}>
            {formatArea(locale, property.area)}
            {property.bedrooms !== null ? ` · ${labels.bedrooms(property.bedrooms)}` : null}
          </p>
        </div>
      </div>
    </article>
  );
}

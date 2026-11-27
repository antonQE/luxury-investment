import type { Locale, PublicPropertyListItem } from '@luxury-investment/shared';

import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
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
          : 'ruled-row group flex h-full flex-col bg-paper p-4 shadow-[0_1px_0_rgba(20,22,28,0.05)] transition duration-700 ease-out hover:-translate-y-1.5 hover:shadow-[0_30px_50px_-28px_rgba(20,22,28,0.4)]'
      }
      data-testid={`property-card-${property.slug}`}
    >
      <Link
        href={`/properties/${property.id}`}
        className={`relative block overflow-hidden bg-line ${compact ? 'aspect-[3/2]' : 'aspect-[4/3]'}`}
        aria-label={property.title}
      >
        {image === null ? (
          <MediaPlaceholder testId={`property-card-placeholder-${property.slug}`} />
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
            className={`object-cover transition ease-out ${compact ? 'duration-700 group-hover:scale-[1.04]' : 'duration-[1400ms] group-hover:scale-[1.06]'}`}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/30 via-transparent to-transparent opacity-70 transition duration-700 group-hover:opacity-100" />
        {property.badges.length > 0 ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-void/70 via-void/30 to-transparent" />
        ) : null}
        {property.badges.length > 0 ? (
          <ul
            className={`absolute flex flex-wrap ${compact ? 'top-3 left-3 gap-x-4 gap-y-1.5' : 'top-4 left-4 gap-x-5 gap-y-2'}`}
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
            : 'flex flex-1 flex-col gap-2 px-1 pt-6 pb-1'
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
          <Link
            href={`/properties/${property.id}`}
            className="transition-colors duration-500 hover:text-brass-dark"
          >
            {property.title}
          </Link>
        </h3>
        <p className={compact ? 'text-xs text-ink-soft' : 'text-sm text-ink-soft'}>
          {locationLabel(property)}
        </p>
        <div className={`mt-auto ${compact ? 'pt-3' : 'pt-4'}`}>
          <div className={compact ? '' : 'border-t border-line/70 pt-4'}>
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
      </div>
    </article>
  );
}

import type { PublicProperty } from '@luxury-investment/shared';
import { getLocale, getTranslations } from 'next-intl/server';

import { PropertyBadge } from '@/components/ui/PropertyBadge';
import { Link } from '@/i18n/navigation';
import { formatArea, formatPrice, locationLabel } from '@/lib/format';
import { badgeMessageKey } from '@/lib/labels';

export async function PropertyCard({ property }: { property: PublicProperty }) {
  const t = await getTranslations('Property');
  const search = await getTranslations('Search');
  const locale = await getLocale();
  const image = property.imageUrls[0];

  return (
    <article
      className="group flex flex-col overflow-hidden transition duration-500 ease-out hover:-translate-y-1"
      data-testid={`property-card-${property.slug}`}
    >
      <Link
        href={`/obiavi/${property.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-line"
      >
        {image === undefined ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-ink-soft">
            {property.title}
          </div>
        ) : (
          // External listing photos; next/image domains are wired in next.config.ts.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
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
                  label={key === undefined ? badge : t(key)}
                />
              );
            })}
          </ul>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 pt-5">
        <p className="text-[11px] tracking-[0.2em] uppercase text-brass">
          {search(property.transactionType)} · {search(property.propertyType)}
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
            <span className="ml-1 font-sans text-sm text-ink-soft">{t('perMonth')}</span>
          ) : null}
        </p>
        <p className="text-sm text-ink-soft">
          {formatArea(locale, property.area)}
          {property.bedrooms !== null ? ` · ${t('bedrooms', { count: property.bedrooms })}` : null}
        </p>
      </div>
    </article>
  );
}

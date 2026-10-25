import type { PublicProperty } from '@luxury-investment/shared';
import { getLocale, getTranslations } from 'next-intl/server';

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
      className="group flex flex-col overflow-hidden bg-paper shadow-sm"
      data-testid={`property-card-${property.slug}`}
    >
      <Link
        href={`/obiavi/${property.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-cream-dark"
      >
        {image === undefined ? (
          <div className="flex h-full items-center justify-center text-sm text-ink-soft">
            {property.title}
          </div>
        ) : (
          // External demo photos; next/image is wired in next.config.ts.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        <ul className="absolute top-3 left-3 flex flex-wrap gap-1">
          {property.badges.map((badge) => {
            const key = badgeMessageKey(badge);
            return (
              <li
                key={badge}
                className="bg-ink/80 px-2 py-1 text-[10px] tracking-[0.15em] uppercase text-cream"
              >
                {key === undefined ? badge : t(key)}
              </li>
            );
          })}
        </ul>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs tracking-[0.2em] uppercase text-gold">
          {search(property.transactionType)} · {search(property.propertyType)}
        </p>
        <h3 className="font-serif text-xl leading-snug">
          <Link href={`/obiavi/${property.slug}`} className="hover:text-gold-dark">
            {property.title}
          </Link>
        </h3>
        <p className="text-sm text-ink-soft">{locationLabel(property)}</p>
        <p className="mt-auto pt-3 font-serif text-2xl text-ink">
          {formatPrice(locale, property)}
          {property.transactionType === 'rent' ? (
            <span className="ml-1 text-sm font-sans text-ink-soft">{t('perMonth')}</span>
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

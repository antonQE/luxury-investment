import type { PublicProperty } from '@luxury-investment/shared';

/** Thin RealEstateListing JSON-LD for property pages (R1 baseline). */
export function propertyJsonLd(property: PublicProperty, pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.excerpt,
    url: pageUrl,
    datePosted: property.publishedAt,
    image: property.imageUrls.slice(0, 5),
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: property.currency,
    },
  };
}

import type { PublicProperty } from '@luxury-investment/shared';

export function formatPrice(
  locale: string,
  property: Pick<PublicProperty, 'price' | 'currency'>,
): string {
  return new Intl.NumberFormat(locale === 'bg' ? 'bg-BG' : 'en-GB', {
    style: 'currency',
    currency: property.currency,
    maximumFractionDigits: 0,
  }).format(property.price);
}

export function formatArea(locale: string, area: number): string {
  const formatted = new Intl.NumberFormat(locale === 'bg' ? 'bg-BG' : 'en-GB', {
    maximumFractionDigits: 1,
  }).format(area);
  return `${formatted} m²`;
}

export function locationLabel(
  property: Pick<PublicProperty, 'city' | 'district' | 'country'>,
): string {
  return [property.district, property.city, property.country].filter(Boolean).join(', ');
}

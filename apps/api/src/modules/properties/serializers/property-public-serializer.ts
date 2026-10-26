import type {
  Locale,
  PriceEquivalent,
  PublicProperty,
  PublicPropertyListItem,
} from '@luxury-investment/shared';
import { marketSchema, propertyTypeSchema, transactionTypeSchema } from '@luxury-investment/shared';

import type { PropertyRow } from '../repo/property-repo.ts';

function resolvePrimaryArea(row: PropertyRow): number {
  if (row.primaryArea === 'with_common' && row.areaWithCommonParts !== null) {
    return Number(row.areaWithCommonParts);
  }
  if (row.builtUpArea !== null) {
    return Number(row.builtUpArea);
  }
  return Number(row.area);
}

function primaryAreaLabels(row: PropertyRow, isBg: boolean): string {
  if (row.primaryArea === 'with_common') {
    return isBg ? 'Площ с общи части' : 'Area with common parts';
  }
  if (row.primaryAreaLabelBg.length > 0 || row.primaryAreaLabelEn.length > 0) {
    return isBg ? row.primaryAreaLabelBg : row.primaryAreaLabelEn;
  }
  return isBg ? 'Застроена площ' : 'Built-up area';
}

export function serializePropertyListItem(
  row: PropertyRow,
  locale: Locale,
  options?: { priceEquivalent?: PriceEquivalent | null },
): PublicPropertyListItem {
  const isBg = locale === 'bg';
  const publishedAt = row.publishedAt;
  const cover = row.imageUrls[0];
  return {
    id: row.id,
    referenceNumber: row.referenceNumber,
    slug: row.slug,
    title: isBg ? row.titleBg : row.titleEn,
    excerpt: isBg ? row.excerptBg : row.excerptEn,
    transactionType: transactionTypeSchema.parse(row.transactionType),
    propertyType: propertyTypeSchema.parse(row.propertyType),
    market: marketSchema.parse(row.market),
    country: row.country,
    city: row.city,
    district: row.district,
    price: Number(row.price),
    currency: row.currency,
    priceEquivalent: options?.priceEquivalent ?? null,
    vatLabel: row.vatLabel,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    area: resolvePrimaryArea(row),
    primaryAreaLabel: primaryAreaLabels(row, isBg),
    constructionStage: row.constructionStage,
    badges: row.badges,
    coverUrl: cover === undefined || cover === '' ? null : cover,
    agentName: row.agentName,
    publishedAt: (publishedAt ?? row.createdAt).toISOString(),
  };
}

export function serializeProperty(
  row: PropertyRow,
  locale: Locale,
  options?: { imageUrls?: string[]; priceEquivalent?: PriceEquivalent | null },
): PublicProperty {
  const isBg = locale === 'bg';
  const publishedAt = row.publishedAt;
  return {
    id: row.id,
    referenceNumber: row.referenceNumber,
    slug: row.slug,
    title: isBg ? row.titleBg : row.titleEn,
    excerpt: isBg ? row.excerptBg : row.excerptEn,
    description: isBg ? row.descriptionBg : row.descriptionEn,
    transactionType: transactionTypeSchema.parse(row.transactionType),
    propertyType: propertyTypeSchema.parse(row.propertyType),
    market: marketSchema.parse(row.market),
    country: row.country,
    city: row.city,
    district: row.district,
    locationPrecision: 'approximate',
    mapQuery: [row.district, row.city, row.country].filter(Boolean).join(', '),
    price: Number(row.price),
    currency: row.currency,
    priceEquivalent: options?.priceEquivalent ?? null,
    vatLabel: row.vatLabel,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    area: resolvePrimaryArea(row),
    primaryAreaLabel: primaryAreaLabels(row, isBg),
    constructionStage: row.constructionStage,
    badges: row.badges,
    imageUrls: options?.imageUrls ?? row.imageUrls,
    agentName: row.agentName,
    agentPhone: row.agentPhone,
    publishedAt: (publishedAt ?? row.createdAt).toISOString(),
  };
}

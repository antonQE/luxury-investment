import type { Locale, PublicProperty } from '@luxury-investment/shared';
import { marketSchema, propertyTypeSchema, transactionTypeSchema } from '@luxury-investment/shared';

import type { PropertyRow } from '../repo/property-repo.ts';

export function serializeProperty(row: PropertyRow, locale: Locale): PublicProperty {
  const isBg = locale === 'bg';
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
    price: Number(row.price),
    currency: row.currency,
    vatLabel: row.vatLabel,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    area: Number(row.area),
    primaryAreaLabel: isBg ? row.primaryAreaLabelBg : row.primaryAreaLabelEn,
    constructionStage: row.constructionStage,
    badges: row.badges,
    imageUrls: row.imageUrls,
    agentName: row.agentName,
    agentPhone: row.agentPhone,
    publishedAt: row.publishedAt.toISOString(),
  };
}

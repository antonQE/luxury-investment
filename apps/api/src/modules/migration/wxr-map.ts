import type { Market, PropertyType, TransactionType } from '@luxury-investment/shared';

import { stripHtml, type WxrDocument, type WxrItem } from './wxr-parse.ts';

export interface MappedProperty {
  referenceNumber: string;
  slug: string;
  titleBg: string;
  titleEn: string;
  excerptBg: string;
  excerptEn: string;
  descriptionBg: string;
  descriptionEn: string;
  transactionType: TransactionType;
  propertyType: PropertyType;
  market: Market;
  country: string;
  city: string;
  district: string | null;
  price: string;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: string;
  primaryAreaLabelBg: string;
  primaryAreaLabelEn: string;
  badges: string[];
  imageUrls: string[];
  agentName: string;
  agentPhone: string;
  listingStatus: 'draft' | 'published' | 'archived';
  publishedAt: Date | null;
  wpPostId: string;
  warnings: string[];
}

export interface MappedAgent {
  slug: string;
  nameBg: string;
  nameEn: string;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  roleBg: string;
  roleEn: string;
  bioBg: string;
  bioEn: string;
  wpPostId: string;
  warnings: string[];
}

export interface MappedArticle {
  slug: string;
  titleBg: string;
  titleEn: string;
  excerptBg: string;
  excerptEn: string;
  bodyBg: string;
  bodyEn: string;
  coverUrl: string | null;
  authorName: string | null;
  status: 'draft' | 'published';
  publishedAt: Date | null;
  warnings: string[];
}

export interface MappingReport {
  properties: MappedProperty[];
  agents: MappedAgent[];
  articles: MappedArticle[];
  skipped: { postType: string; postId: string; reason: string }[];
  unmappedTaxonomies: { domain: string; name: string; count: number }[];
  summary: {
    propertiesPublished: number;
    propertiesDraft: number;
    agents: number;
    articles: number;
    attachments: number;
    warnings: number;
  };
}

const TYPE_MAP: Record<string, PropertyType> = {
  Апартаменти: 'apartment',
  Къщи: 'house',
  Вила: 'house',
  'Етаж от къща': 'house',
  'Къща за гости': 'house',
  Парцели: 'plot',
  Офис: 'office',
  Магазин: 'office',
  Гараж: 'office',
  Хотел: 'hotel',
  'Бизнес имот': 'hotel',
  Заведения: 'hotel',
  Автосервиз: 'hotel',
  Рибарник: 'plot',
};

const BADGE_MAP: Record<string, string> = {
  'Нова оферта': 'new',
  Ексклузив: 'exclusive',
  'Инвестиционен имот': 'investment',
};

const BLACK_SEA_CITIES = new Set([
  'Бургас',
  'Варна',
  'Обзор',
  'Поморие',
  'Несебър',
  'Слънчев бряг',
  'Айтос',
  'с. Лозенец (Бургас)',
  'с. Тънково',
  'с. Равда',
  'Банско',
]);

function categoryName(item: WxrItem, domain: string): string | null {
  return item.categories.find((c) => c.domain === domain)?.name ?? null;
}

function parseNumber(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const cleaned = raw.replace(/\s+/g, '').replace(',', '.');
  if (cleaned === '' || cleaned === '0') return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

function parsePrice(raw: string | undefined): { price: string; warnings: string[] } {
  const warnings: string[] = [];
  const value = parseNumber(raw);
  if (value === null) {
    warnings.push('missing_or_zero_price');
    return { price: '0.00', warnings };
  }
  return { price: value.toFixed(2), warnings };
}

function mapMarket(city: string): Market {
  if (city === 'Дубай' || /dubai/i.test(city)) return 'dubai_abroad';
  if (BLACK_SEA_CITIES.has(city)) return 'black_sea';
  if (/greece|греция|cyprus|кипър|polychrono|nea /i.test(city)) return 'dubai_abroad';
  return 'sofia';
}

function mapCountry(city: string, market: Market): string {
  if (market === 'dubai_abroad') {
    if (/dubai|дубай/i.test(city)) return 'ОАЕ';
    if (/greece|греция|polychrono|nea /i.test(city)) return 'Гърция';
    if (/cyprus|кипър/i.test(city)) return 'Кипър';
    return 'Abroad';
  }
  return 'България';
}

function resolveImages(item: WxrItem, attachments: Map<string, string>): string[] {
  const raw = item.meta.image_to_attach ?? '';
  const urls: string[] = [];
  for (const id of raw.split(',')) {
    const trimmed = id.trim();
    if (trimmed === '') continue;
    const url = attachments.get(trimmed);
    if (url !== undefined) urls.push(url);
  }
  const thumb = item.meta._thumbnail_id;
  if (thumb !== undefined && urls.length === 0) {
    const url = attachments.get(thumb);
    if (url !== undefined) urls.push(url);
  }
  return urls;
}

function slugOrFallback(slug: string, postId: string): string {
  const cleaned = slug.trim().toLowerCase();
  return cleaned === '' ? `wp-${postId}` : cleaned;
}

/** First non-empty trimmed string, otherwise `fallback`. */
function pickText(...candidates: (string | undefined | null)[]): string {
  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) continue;
    const trimmed = candidate.trim();
    if (trimmed !== '') return trimmed;
  }
  return '';
}

function excerptFrom(item: WxrItem, description: string): string {
  const fromMeta = stripHtml(item.excerpt);
  if (fromMeta !== '') return fromMeta.slice(0, 280);
  return description.slice(0, 280);
}

export function mapWxrDocument(doc: WxrDocument): MappingReport {
  const attachments = new Map<string, string>();
  for (const item of doc.items) {
    if (item.postType === 'attachment' && item.attachmentUrl !== null) {
      attachments.set(item.postId, item.attachmentUrl);
    }
  }

  const agentsById = new Map<string, WxrItem>();
  for (const item of doc.items) {
    if (item.postType === 'estate_agent') agentsById.set(item.postId, item);
  }

  const taxonomyHits = new Map<string, number>();
  const skipped: MappingReport['skipped'] = [];
  const properties: MappedProperty[] = [];
  const agents: MappedAgent[] = [];
  const articles: MappedArticle[] = [];

  for (const item of doc.items) {
    if (item.postType === 'estate_agent') {
      if (item.status !== 'publish') {
        skipped.push({
          postType: item.postType,
          postId: item.postId,
          reason: `status:${item.status}`,
        });
        continue;
      }
      const warnings: string[] = [];
      const phoneRaw = pickText(item.meta.agent_mobile, item.meta.agent_phone);
      const phone = phoneRaw === '' ? null : phoneRaw;
      const emailRaw = pickText(item.meta.agent_email);
      const email = emailRaw === '' ? null : emailRaw;
      if (phone === null) warnings.push('missing_phone');
      const thumb = item.meta._thumbnail_id;
      const name = pickText(item.title, `Agent ${item.postId}`);
      const bio = pickText(stripHtml(item.content), name);
      agents.push({
        slug: slugOrFallback(item.slug, item.postId),
        nameBg: name,
        nameEn: name,
        email,
        phone,
        photoUrl: thumb !== undefined ? (attachments.get(thumb) ?? null) : null,
        roleBg: pickText(item.meta.agent_position, 'Брокер'),
        roleEn: pickText(item.meta.agent_position, 'Agent'),
        bioBg: bio,
        bioEn: bio,
        wpPostId: item.postId,
        warnings,
      });
      continue;
    }

    if (item.postType === 'post') {
      if (item.status !== 'publish') {
        skipped.push({
          postType: item.postType,
          postId: item.postId,
          reason: `status:${item.status}`,
        });
        continue;
      }
      const body = stripHtml(item.content);
      const title = pickText(item.title, `Article ${item.postId}`);
      const bodyText = pickText(body, title);
      articles.push({
        slug: slugOrFallback(item.slug, item.postId),
        titleBg: title,
        titleEn: title,
        excerptBg: excerptFrom(item, bodyText),
        excerptEn: excerptFrom(item, bodyText),
        bodyBg: bodyText,
        bodyEn: bodyText,
        coverUrl:
          item.meta._thumbnail_id !== undefined
            ? (attachments.get(item.meta._thumbnail_id) ?? null)
            : null,
        authorName: null,
        status: 'published',
        publishedAt: item.postDateGmt ? new Date(`${item.postDateGmt}Z`) : null,
        warnings: ['en_needs_review'],
      });
      continue;
    }

    if (item.postType !== 'estate_property') continue;

    if (item.status === 'trash') {
      skipped.push({ postType: item.postType, postId: item.postId, reason: 'trash' });
      continue;
    }

    const warnings: string[] = [];
    const action = categoryName(item, 'property_action_category');
    const typeName = categoryName(item, 'property_category');
    const city = categoryName(item, 'property_city') ?? 'София';
    const district = categoryName(item, 'property_area');

    if (action !== null) {
      taxonomyHits.set(`action:${action}`, (taxonomyHits.get(`action:${action}`) ?? 0) + 1);
    }
    if (typeName !== null) {
      taxonomyHits.set(`type:${typeName}`, (taxonomyHits.get(`type:${typeName}`) ?? 0) + 1);
    }

    let transactionType: TransactionType = 'sale';
    if (action === 'Под наем') transactionType = 'rent';
    else if (action !== 'Продажби' && action !== null) {
      warnings.push(`unmapped_action:${action}`);
    }

    let propertyType: PropertyType = 'apartment';
    if (typeName !== null && TYPE_MAP[typeName] !== undefined) {
      propertyType = TYPE_MAP[typeName];
    } else if (typeName !== null) {
      warnings.push(`unmapped_type:${typeName}`);
      taxonomyHits.set(
        `unmapped_type:${typeName}`,
        (taxonomyHits.get(`unmapped_type:${typeName}`) ?? 0) + 1,
      );
    }

    const badges: string[] = [];
    for (const cat of item.categories.filter((c) => c.domain === 'property_status')) {
      const mapped = BADGE_MAP[cat.name];
      if (mapped !== undefined) badges.push(mapped);
      else warnings.push(`unmapped_badge:${cat.name}`);
    }

    const { price, warnings: priceWarnings } = parsePrice(item.meta.property_price);
    warnings.push(...priceWarnings);

    const bedrooms = parseNumber(item.meta.property_bedrooms);
    const bathrooms = parseNumber(item.meta.property_bathrooms);
    const areaValue = parseNumber(item.meta.property_size);
    if (areaValue === null) warnings.push('missing_or_zero_area');

    const market = mapMarket(city);
    const title = pickText(item.title, `Property ${item.postId}`);
    const description = pickText(stripHtml(item.content), title);

    const agentId = pickText(item.meta.property_agent);
    const agentItem = agentId === '' ? undefined : agentsById.get(agentId);
    const agentName = pickText(agentItem?.title, 'Luxury Investment');
    const agentPhone = pickText(
      agentItem?.meta.agent_mobile,
      agentItem?.meta.agent_phone,
      '+359 000 000 000',
    );
    if (agentItem === undefined) warnings.push('missing_agent');

    const listingStatus: MappedProperty['listingStatus'] =
      item.status === 'publish' ? 'published' : 'draft';
    if (listingStatus === 'draft') warnings.push('imported_as_draft');
    warnings.push('en_needs_review');

    const imageUrls = resolveImages(item, attachments);
    if (imageUrls.length === 0) warnings.push('missing_images');

    properties.push({
      referenceNumber: `WP-${item.postId}`,
      slug: slugOrFallback(item.slug, item.postId),
      titleBg: title,
      titleEn: title,
      excerptBg: excerptFrom(item, description),
      excerptEn: excerptFrom(item, description),
      descriptionBg: description,
      descriptionEn: description,
      transactionType,
      propertyType,
      market,
      country: mapCountry(city, market),
      city,
      district,
      price,
      currency: 'EUR',
      bedrooms: bedrooms === null ? null : Math.trunc(bedrooms),
      bathrooms: bathrooms === null ? null : Math.trunc(bathrooms),
      area: (areaValue ?? 0).toFixed(2),
      primaryAreaLabelBg: 'Застроена площ',
      primaryAreaLabelEn: 'Built-up area',
      badges: [...new Set(badges)],
      imageUrls,
      agentName,
      agentPhone,
      listingStatus,
      publishedAt:
        listingStatus === 'published' && item.postDateGmt ? new Date(`${item.postDateGmt}Z`) : null,
      wpPostId: item.postId,
      warnings,
    });
  }

  const unmappedTaxonomies = [...taxonomyHits.entries()]
    .filter(([key]) => key.startsWith('unmapped_'))
    .map(([key, count]) => {
      const [, domain, ...rest] = key.split(':');
      return { domain: domain ?? 'unknown', name: rest.join(':'), count };
    });

  const warningCount =
    properties.reduce((n, p) => n + p.warnings.length, 0) +
    agents.reduce((n, a) => n + a.warnings.length, 0) +
    articles.reduce((n, a) => n + a.warnings.length, 0);

  return {
    properties,
    agents,
    articles,
    skipped,
    unmappedTaxonomies,
    summary: {
      propertiesPublished: properties.filter((p) => p.listingStatus === 'published').length,
      propertiesDraft: properties.filter((p) => p.listingStatus === 'draft').length,
      agents: agents.length,
      articles: articles.length,
      attachments: attachments.size,
      warnings: warningCount,
    },
  };
}

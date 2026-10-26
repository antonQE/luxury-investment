import { eq } from 'drizzle-orm';

import type { Database } from '../../infrastructure/db/client.ts';
import { articles, properties, teamMembers, translations } from '../../infrastructure/db/schema.ts';
import type { MappedAgent, MappedArticle, MappedProperty, MappingReport } from './wxr-map.ts';

async function writeTranslation(
  db: Database,
  entityType: string,
  entityId: string,
  field: string,
  locale: string,
  value: string,
) {
  await db
    .insert(translations)
    .values({ entityType, entityId, locale, field, value })
    .onConflictDoUpdate({
      target: [
        translations.entityType,
        translations.entityId,
        translations.locale,
        translations.field,
      ],
      set: { value },
    });
}

async function upsertProperty(db: Database, row: MappedProperty): Promise<'inserted' | 'updated'> {
  const existing = await db
    .select({ id: properties.id })
    .from(properties)
    .where(eq(properties.referenceNumber, row.referenceNumber))
    .limit(1);

  const values = {
    referenceNumber: row.referenceNumber,
    slug: row.slug,
    titleBg: row.titleBg,
    titleEn: row.titleEn,
    excerptBg: row.excerptBg,
    excerptEn: row.excerptEn,
    descriptionBg: row.descriptionBg,
    descriptionEn: row.descriptionEn,
    transactionType: row.transactionType,
    propertyType: row.propertyType,
    market: row.market,
    country: row.country,
    city: row.city,
    district: row.district,
    price: row.price,
    currency: row.currency,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    area: row.area,
    primaryAreaLabelBg: row.primaryAreaLabelBg,
    primaryAreaLabelEn: row.primaryAreaLabelEn,
    badges: row.badges,
    imageUrls: row.imageUrls,
    agentName: row.agentName,
    agentPhone: row.agentPhone,
    listingStatus: row.listingStatus,
    publishedAt: row.publishedAt,
    updatedAt: new Date(),
  };

  if (existing[0] !== undefined) {
    await db.update(properties).set(values).where(eq(properties.id, existing[0].id));
    return 'updated';
  }

  await db.insert(properties).values(values);
  return 'inserted';
}

async function upsertAgent(db: Database, row: MappedAgent): Promise<'inserted' | 'updated'> {
  const existing = await db
    .select({ id: teamMembers.id })
    .from(teamMembers)
    .where(eq(teamMembers.slug, row.slug))
    .limit(1);

  const values = {
    slug: row.slug,
    kind: 'agent',
    email: row.email,
    phone: row.phone,
    photoUrl: row.photoUrl,
    markets: [] as string[],
    languages: ['bg', 'en'],
    isPublic: true,
    updatedAt: new Date(),
  };

  let id: string;
  if (existing[0] !== undefined) {
    await db.update(teamMembers).set(values).where(eq(teamMembers.id, existing[0].id));
    id = existing[0].id;
    await writeTranslation(db, 'team_member', id, 'name', 'bg', row.nameBg);
    await writeTranslation(db, 'team_member', id, 'name', 'en', row.nameEn);
    await writeTranslation(db, 'team_member', id, 'role', 'bg', row.roleBg);
    await writeTranslation(db, 'team_member', id, 'role', 'en', row.roleEn);
    await writeTranslation(db, 'team_member', id, 'bio', 'bg', row.bioBg);
    await writeTranslation(db, 'team_member', id, 'bio', 'en', row.bioEn);
    return 'updated';
  }

  const [inserted] = await db.insert(teamMembers).values(values).returning({ id: teamMembers.id });
  if (inserted === undefined) throw new Error(`Failed to insert agent ${row.slug}`);
  id = inserted.id;
  await writeTranslation(db, 'team_member', id, 'name', 'bg', row.nameBg);
  await writeTranslation(db, 'team_member', id, 'name', 'en', row.nameEn);
  await writeTranslation(db, 'team_member', id, 'role', 'bg', row.roleBg);
  await writeTranslation(db, 'team_member', id, 'role', 'en', row.roleEn);
  await writeTranslation(db, 'team_member', id, 'bio', 'bg', row.bioBg);
  await writeTranslation(db, 'team_member', id, 'bio', 'en', row.bioEn);
  return 'inserted';
}

async function upsertArticle(db: Database, row: MappedArticle): Promise<'inserted' | 'updated'> {
  const existing = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.slug, row.slug))
    .limit(1);

  const values = {
    slug: row.slug,
    status: row.status,
    coverUrl: row.coverUrl,
    authorName: row.authorName,
    publishedAt: row.publishedAt,
    updatedAt: new Date(),
  };

  let id: string;
  if (existing[0] !== undefined) {
    await db.update(articles).set(values).where(eq(articles.id, existing[0].id));
    id = existing[0].id;
  } else {
    const [inserted] = await db.insert(articles).values(values).returning({ id: articles.id });
    if (inserted === undefined) throw new Error(`Failed to insert article ${row.slug}`);
    id = inserted.id;
  }

  await writeTranslation(db, 'article', id, 'title', 'bg', row.titleBg);
  await writeTranslation(db, 'article', id, 'title', 'en', row.titleEn);
  await writeTranslation(db, 'article', id, 'excerpt', 'bg', row.excerptBg);
  await writeTranslation(db, 'article', id, 'excerpt', 'en', row.excerptEn);
  await writeTranslation(db, 'article', id, 'body', 'bg', row.bodyBg);
  await writeTranslation(db, 'article', id, 'body', 'en', row.bodyEn);
  return existing[0] !== undefined ? 'updated' : 'inserted';
}

export interface ImportResult {
  properties: { inserted: number; updated: number };
  agents: { inserted: number; updated: number };
  articles: { inserted: number; updated: number };
}

export async function applyWxrImport(
  db: Database,
  report: MappingReport,
  options: { limit?: number } = {},
): Promise<ImportResult> {
  const limit = options.limit;
  const props = limit === undefined ? report.properties : report.properties.slice(0, limit);
  const result: ImportResult = {
    properties: { inserted: 0, updated: 0 },
    agents: { inserted: 0, updated: 0 },
    articles: { inserted: 0, updated: 0 },
  };

  for (const agent of report.agents) {
    const outcome = await upsertAgent(db, agent);
    result.agents[outcome] += 1;
  }

  for (const property of props) {
    const outcome = await upsertProperty(db, property);
    result.properties[outcome] += 1;
  }

  for (const article of report.articles) {
    const outcome = await upsertArticle(db, article);
    result.articles[outcome] += 1;
  }

  return result;
}

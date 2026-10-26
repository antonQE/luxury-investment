import { and, asc, count, desc, eq, ne, type SQL } from 'drizzle-orm';

import { AppError } from '../../../errors/app-error.ts';
import type { Database } from '../../../infrastructure/db/client.ts';
import { properties } from '../../../infrastructure/db/schema.ts';
import type { PropertyRow } from '../repo/property-repo.ts';
import type { PropertyHistoryService } from './property-history-service.ts';

export interface AdminPropertyListQuery {
  offset: number;
  limit: number;
  listingStatus?: string;
  includeArchived?: boolean;
}

export interface PropertyWriteInput {
  referenceNumber?: string;
  slug?: string;
  titleBg: string;
  titleEn: string;
  excerptBg: string;
  excerptEn: string;
  descriptionBg: string;
  descriptionEn: string;
  transactionType: string;
  propertyType: string;
  market: string;
  country: string;
  city: string;
  district?: string | null;
  locationId?: string | null;
  price: string;
  currency: string;
  vatLabel?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area: string;
  builtUpArea?: string | null;
  areaWithCommonParts?: string | null;
  primaryArea?: string;
  primaryAreaLabelBg: string;
  primaryAreaLabelEn: string;
  constructionStage?: string | null;
  badges?: string[];
  attributeValues?: Record<string, unknown>;
  imageUrls: string[];
  agentName: string;
  agentPhone: string;
  responsibleAgentUserId?: string | null;
}

function resolveArea(input: PropertyWriteInput): string {
  if (input.primaryArea === 'with_common' && input.areaWithCommonParts) {
    return input.areaWithCommonParts;
  }
  if (input.builtUpArea) return input.builtUpArea;
  return input.area;
}

export class PropertyAdminService {
  readonly #db: Database;
  readonly #history: PropertyHistoryService;

  constructor(db: Database, history: PropertyHistoryService) {
    this.#db = db;
    this.#history = history;
  }

  async list(query: AdminPropertyListQuery): Promise<{ items: PropertyRow[]; total: number }> {
    const clauses: SQL[] = [];
    if (query.listingStatus !== undefined) {
      clauses.push(eq(properties.listingStatus, query.listingStatus));
    } else if (query.includeArchived !== true) {
      clauses.push(ne(properties.listingStatus, 'archived'));
    }
    const where = clauses.length > 0 ? and(...clauses) : undefined;
    const [items, totals] = await Promise.all([
      this.#db
        .select()
        .from(properties)
        .where(where)
        .orderBy(desc(properties.updatedAt), asc(properties.referenceNumber))
        .limit(query.limit)
        .offset(query.offset),
      this.#db.select({ total: count() }).from(properties).where(where),
    ]);
    return { items, total: totals[0]?.total ?? 0 };
  }

  async getById(id: string): Promise<PropertyRow> {
    const [row] = await this.#db.select().from(properties).where(eq(properties.id, id)).limit(1);
    if (row === undefined) throw new AppError('NOT_FOUND');
    return row;
  }

  async create(input: PropertyWriteInput, actorUserId?: string): Promise<PropertyRow> {
    const area = resolveArea(input);
    const [inserted] = await this.#db
      .insert(properties)
      .values({
        referenceNumber: input.referenceNumber ?? `DRAFT-${crypto.randomUUID().slice(0, 8)}`,
        slug: input.slug ?? `draft-${crypto.randomUUID().slice(0, 8)}`,
        titleBg: input.titleBg,
        titleEn: input.titleEn,
        excerptBg: input.excerptBg,
        excerptEn: input.excerptEn,
        descriptionBg: input.descriptionBg,
        descriptionEn: input.descriptionEn,
        transactionType: input.transactionType,
        propertyType: input.propertyType,
        market: input.market,
        country: input.country,
        city: input.city,
        district: input.district ?? null,
        locationId: input.locationId ?? null,
        price: input.price,
        currency: input.currency,
        vatLabel: input.vatLabel ?? null,
        bedrooms: input.bedrooms ?? null,
        bathrooms: input.bathrooms ?? null,
        area,
        builtUpArea: input.builtUpArea ?? null,
        areaWithCommonParts: input.areaWithCommonParts ?? null,
        primaryArea: input.primaryArea ?? 'built_up',
        primaryAreaLabelBg: input.primaryAreaLabelBg,
        primaryAreaLabelEn: input.primaryAreaLabelEn,
        constructionStage: input.constructionStage ?? null,
        badges: input.badges ?? [],
        attributeValues: input.attributeValues ?? {},
        imageUrls: input.imageUrls,
        agentName: input.agentName,
        agentPhone: input.agentPhone,
        responsibleAgentUserId: input.responsibleAgentUserId ?? null,
        listingStatus: 'draft',
        publishedAt: null,
      })
      .returning();
    if (inserted === undefined) throw new AppError('INTERNAL');

    await this.#history.recordPriceChange({
      propertyId: inserted.id,
      price: inserted.price,
      currency: inserted.currency,
      changedByUserId: actorUserId,
      note: 'initial',
    });
    return inserted;
  }

  async update(
    id: string,
    input: Partial<PropertyWriteInput>,
    actorUserId?: string,
  ): Promise<PropertyRow> {
    const existing = await this.getById(id);
    const next: PropertyWriteInput = {
      referenceNumber: input.referenceNumber ?? existing.referenceNumber,
      slug: input.slug ?? existing.slug,
      titleBg: input.titleBg ?? existing.titleBg,
      titleEn: input.titleEn ?? existing.titleEn,
      excerptBg: input.excerptBg ?? existing.excerptBg,
      excerptEn: input.excerptEn ?? existing.excerptEn,
      descriptionBg: input.descriptionBg ?? existing.descriptionBg,
      descriptionEn: input.descriptionEn ?? existing.descriptionEn,
      transactionType: input.transactionType ?? existing.transactionType,
      propertyType: input.propertyType ?? existing.propertyType,
      market: input.market ?? existing.market,
      country: input.country ?? existing.country,
      city: input.city ?? existing.city,
      district: input.district === undefined ? existing.district : input.district,
      locationId: input.locationId === undefined ? existing.locationId : input.locationId,
      price: input.price ?? existing.price,
      currency: input.currency ?? existing.currency,
      vatLabel: input.vatLabel === undefined ? existing.vatLabel : input.vatLabel,
      bedrooms: input.bedrooms === undefined ? existing.bedrooms : input.bedrooms,
      bathrooms: input.bathrooms === undefined ? existing.bathrooms : input.bathrooms,
      area: input.area ?? existing.area,
      builtUpArea: input.builtUpArea === undefined ? existing.builtUpArea : input.builtUpArea,
      areaWithCommonParts:
        input.areaWithCommonParts === undefined
          ? existing.areaWithCommonParts
          : input.areaWithCommonParts,
      primaryArea: input.primaryArea ?? existing.primaryArea,
      primaryAreaLabelBg: input.primaryAreaLabelBg ?? existing.primaryAreaLabelBg,
      primaryAreaLabelEn: input.primaryAreaLabelEn ?? existing.primaryAreaLabelEn,
      constructionStage:
        input.constructionStage === undefined
          ? existing.constructionStage
          : input.constructionStage,
      badges: input.badges ?? existing.badges,
      attributeValues: input.attributeValues ?? existing.attributeValues,
      imageUrls: input.imageUrls ?? existing.imageUrls,
      agentName: input.agentName ?? existing.agentName,
      agentPhone: input.agentPhone ?? existing.agentPhone,
      responsibleAgentUserId:
        input.responsibleAgentUserId === undefined
          ? existing.responsibleAgentUserId
          : input.responsibleAgentUserId,
    };

    const area = resolveArea(next);
    const [updated] = await this.#db
      .update(properties)
      .set({
        referenceNumber: next.referenceNumber,
        slug: next.slug,
        titleBg: next.titleBg,
        titleEn: next.titleEn,
        excerptBg: next.excerptBg,
        excerptEn: next.excerptEn,
        descriptionBg: next.descriptionBg,
        descriptionEn: next.descriptionEn,
        transactionType: next.transactionType,
        propertyType: next.propertyType,
        market: next.market,
        country: next.country,
        city: next.city,
        district: next.district ?? null,
        locationId: next.locationId ?? null,
        price: next.price,
        currency: next.currency,
        vatLabel: next.vatLabel ?? null,
        bedrooms: next.bedrooms ?? null,
        bathrooms: next.bathrooms ?? null,
        area,
        builtUpArea: next.builtUpArea ?? null,
        areaWithCommonParts: next.areaWithCommonParts ?? null,
        primaryArea: next.primaryArea ?? 'built_up',
        primaryAreaLabelBg: next.primaryAreaLabelBg,
        primaryAreaLabelEn: next.primaryAreaLabelEn,
        constructionStage: next.constructionStage ?? null,
        badges: next.badges ?? [],
        attributeValues: next.attributeValues ?? {},
        imageUrls: next.imageUrls,
        agentName: next.agentName,
        agentPhone: next.agentPhone,
        responsibleAgentUserId: next.responsibleAgentUserId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, id))
      .returning();
    if (updated === undefined) throw new AppError('INTERNAL');

    if (existing.price !== updated.price || existing.currency !== updated.currency) {
      await this.#history.recordPriceChange({
        propertyId: id,
        price: updated.price,
        currency: updated.currency,
        changedByUserId: actorUserId,
      });
    }
    if (existing.slug !== updated.slug) {
      await this.#history.recordSlugChange({
        propertyId: id,
        previousSlug: existing.slug,
        changedByUserId: actorUserId,
      });
    }
    return updated;
  }

  async publish(id: string): Promise<PropertyRow> {
    const existing = await this.getById(id);
    if (existing.responsibleAgentUserId === null) {
      throw new AppError('VALIDATION_FAILED', 'A responsible agent is required before publishing.');
    }
    const [updated] = await this.#db
      .update(properties)
      .set({
        listingStatus: 'published',
        publishedAt: existing.publishedAt ?? new Date(),
        updatedAt: new Date(),
      })
      .where(eq(properties.id, id))
      .returning();
    if (updated === undefined) throw new AppError('INTERNAL');
    return updated;
  }

  async archive(id: string): Promise<PropertyRow> {
    const [updated] = await this.#db
      .update(properties)
      .set({ listingStatus: 'archived', updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    if (updated === undefined) throw new AppError('NOT_FOUND');
    return updated;
  }

  async duplicate(id: string, actorUserId?: string): Promise<PropertyRow> {
    const source = await this.getById(id);
    const suffix = crypto.randomUUID().slice(0, 8);
    return this.create(
      {
        referenceNumber: `${source.referenceNumber}-copy-${suffix}`,
        slug: `${source.slug}-copy-${suffix}`,
        titleBg: `${source.titleBg} (copy)`,
        titleEn: `${source.titleEn} (copy)`,
        excerptBg: source.excerptBg,
        excerptEn: source.excerptEn,
        descriptionBg: source.descriptionBg,
        descriptionEn: source.descriptionEn,
        transactionType: source.transactionType,
        propertyType: source.propertyType,
        market: source.market,
        country: source.country,
        city: source.city,
        district: source.district,
        locationId: source.locationId,
        price: source.price,
        currency: source.currency,
        vatLabel: source.vatLabel,
        bedrooms: source.bedrooms,
        bathrooms: source.bathrooms,
        area: source.area,
        builtUpArea: source.builtUpArea,
        areaWithCommonParts: source.areaWithCommonParts,
        primaryArea: source.primaryArea,
        primaryAreaLabelBg: source.primaryAreaLabelBg,
        primaryAreaLabelEn: source.primaryAreaLabelEn,
        constructionStage: source.constructionStage,
        badges: source.badges,
        attributeValues: source.attributeValues,
        imageUrls: source.imageUrls,
        agentName: source.agentName,
        agentPhone: source.agentPhone,
        responsibleAgentUserId: source.responsibleAgentUserId,
      },
      actorUserId,
    );
  }
}

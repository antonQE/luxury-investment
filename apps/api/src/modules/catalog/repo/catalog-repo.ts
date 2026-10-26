import {
  LOCATION_KINDS,
  TAXONOMY_ENTITY_TYPES,
  type TaxonomyKind,
} from '@luxury-investment/shared';
import { and, asc, eq, inArray, isNull } from 'drizzle-orm';

import { AppError } from '../../../errors/app-error.ts';
import type { Database } from '../../../infrastructure/db/client.ts';
import {
  badges,
  constructionStages,
  listingStatuses,
  locations,
  markets,
  propertyTypes,
  transactionTypes,
  translations,
} from '../../../infrastructure/db/schema.ts';

export interface LocalizedName {
  bg: string;
  en: string;
}

export interface LocationRow {
  id: string;
  kind: string;
  slug: string;
  parentId: string | null;
  code: string | null;
  sortOrder: number;
  archivedAt: Date | null;
  name: LocalizedName;
}

export interface TaxonomyRow {
  id: string;
  key: string;
  sortOrder: number;
  archivedAt: Date | null;
  name: LocalizedName;
}

/** All taxonomy tables share this Drizzle shape. */
type TaxonomyTable = typeof markets;

const TAXONOMY_TABLES: Record<TaxonomyKind, TaxonomyTable> = {
  markets,
  property_types: propertyTypes,
  transaction_types: transactionTypes,
  badges,
  construction_stages: constructionStages,
  listing_statuses: listingStatuses,
};

async function loadNames(
  db: Database,
  entityType: string,
  ids: string[],
): Promise<Map<string, LocalizedName>> {
  const map = new Map<string, LocalizedName>();
  if (ids.length === 0) return map;
  for (const id of ids) {
    map.set(id, { bg: '', en: '' });
  }
  const rows = await db
    .select()
    .from(translations)
    .where(
      and(
        eq(translations.entityType, entityType),
        inArray(translations.entityId, ids),
        eq(translations.field, 'name'),
      ),
    );
  for (const row of rows) {
    const current = map.get(row.entityId) ?? { bg: '', en: '' };
    if (row.locale === 'bg') current.bg = row.value;
    if (row.locale === 'en') current.en = row.value;
    map.set(row.entityId, current);
  }
  return map;
}

async function writeName(
  db: Database,
  entityType: string,
  entityId: string,
  name: LocalizedName,
): Promise<void> {
  for (const [locale, value] of [
    ['bg', name.bg],
    ['en', name.en],
  ] as const) {
    await db
      .insert(translations)
      .values({ entityType, entityId, locale, field: 'name', value })
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
}

export class CatalogRepo {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async listLocations(includeArchived: boolean): Promise<LocationRow[]> {
    const rows = includeArchived
      ? await this.#db
          .select()
          .from(locations)
          .orderBy(asc(locations.sortOrder), asc(locations.slug))
      : await this.#db
          .select()
          .from(locations)
          .where(isNull(locations.archivedAt))
          .orderBy(asc(locations.sortOrder), asc(locations.slug));

    const names = await loadNames(
      this.#db,
      'location',
      rows.map((row) => row.id),
    );
    return rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      slug: row.slug,
      parentId: row.parentId,
      code: row.code,
      sortOrder: row.sortOrder,
      archivedAt: row.archivedAt,
      name: names.get(row.id) ?? { bg: '', en: '' },
    }));
  }

  async createLocation(input: {
    kind: string;
    slug: string;
    parentId?: string | null;
    code?: string | null;
    sortOrder?: number;
    name: LocalizedName;
  }): Promise<LocationRow> {
    if (!(LOCATION_KINDS as readonly string[]).includes(input.kind)) {
      throw new AppError('VALIDATION_FAILED', undefined, [
        { path: 'kind', message: 'invalid kind' },
      ]);
    }
    if (input.parentId) {
      const parent = await this.#db
        .select({ id: locations.id })
        .from(locations)
        .where(eq(locations.id, input.parentId))
        .limit(1);
      if (parent.length === 0)
        throw new AppError('VALIDATION_FAILED', 'Parent location not found.');
    }

    const [inserted] = await this.#db
      .insert(locations)
      .values({
        kind: input.kind,
        slug: input.slug,
        parentId: input.parentId ?? null,
        code: input.code ?? null,
        sortOrder: input.sortOrder ?? 0,
      })
      .returning();
    if (inserted === undefined) throw new AppError('INTERNAL');
    await writeName(this.#db, 'location', inserted.id, input.name);
    return {
      id: inserted.id,
      kind: inserted.kind,
      slug: inserted.slug,
      parentId: inserted.parentId,
      code: inserted.code,
      sortOrder: inserted.sortOrder,
      archivedAt: inserted.archivedAt,
      name: input.name,
    };
  }

  async updateLocation(
    id: string,
    input: {
      slug?: string;
      parentId?: string | null;
      code?: string | null;
      sortOrder?: number;
      name?: LocalizedName;
    },
  ): Promise<LocationRow> {
    const existing = await this.#db.select().from(locations).where(eq(locations.id, id)).limit(1);
    const row = existing[0];
    if (row === undefined) throw new AppError('NOT_FOUND');

    if (input.parentId) {
      const parent = await this.#db
        .select({ id: locations.id })
        .from(locations)
        .where(eq(locations.id, input.parentId))
        .limit(1);
      if (parent.length === 0)
        throw new AppError('VALIDATION_FAILED', 'Parent location not found.');
    }

    const [updated] = await this.#db
      .update(locations)
      .set({
        slug: input.slug ?? row.slug,
        parentId: input.parentId === undefined ? row.parentId : input.parentId,
        code: input.code === undefined ? row.code : input.code,
        sortOrder: input.sortOrder ?? row.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(locations.id, id))
      .returning();
    if (updated === undefined) throw new AppError('INTERNAL');

    if (input.name !== undefined) {
      await writeName(this.#db, 'location', id, input.name);
    }
    const names = await loadNames(this.#db, 'location', [id]);
    return {
      id: updated.id,
      kind: updated.kind,
      slug: updated.slug,
      parentId: updated.parentId,
      code: updated.code,
      sortOrder: updated.sortOrder,
      archivedAt: updated.archivedAt,
      name: names.get(id) ?? { bg: '', en: '' },
    };
  }

  async archiveLocation(id: string): Promise<LocationRow> {
    const [updated] = await this.#db
      .update(locations)
      .set({ archivedAt: new Date(), updatedAt: new Date() })
      .where(eq(locations.id, id))
      .returning();
    if (updated === undefined) throw new AppError('NOT_FOUND');
    const names = await loadNames(this.#db, 'location', [id]);
    return {
      id: updated.id,
      kind: updated.kind,
      slug: updated.slug,
      parentId: updated.parentId,
      code: updated.code,
      sortOrder: updated.sortOrder,
      archivedAt: updated.archivedAt,
      name: names.get(id) ?? { bg: '', en: '' },
    };
  }

  async listTaxonomy(kind: TaxonomyKind, includeArchived: boolean): Promise<TaxonomyRow[]> {
    const table = TAXONOMY_TABLES[kind];
    const entityType = TAXONOMY_ENTITY_TYPES[kind];
    const rows = includeArchived
      ? await this.#db.select().from(table).orderBy(asc(table.sortOrder), asc(table.key))
      : await this.#db
          .select()
          .from(table)
          .where(isNull(table.archivedAt))
          .orderBy(asc(table.sortOrder), asc(table.key));

    const names = await loadNames(
      this.#db,
      entityType,
      rows.map((row) => row.id),
    );
    return rows.map((row) => ({
      id: row.id,
      key: row.key,
      sortOrder: row.sortOrder,
      archivedAt: row.archivedAt,
      name: names.get(row.id) ?? { bg: '', en: '' },
    }));
  }

  async createTaxonomy(
    kind: TaxonomyKind,
    input: { key: string; sortOrder?: number; name: LocalizedName },
  ): Promise<TaxonomyRow> {
    const table = TAXONOMY_TABLES[kind];
    const entityType = TAXONOMY_ENTITY_TYPES[kind];
    const [inserted] = await this.#db
      .insert(table)
      .values({ key: input.key, sortOrder: input.sortOrder ?? 0 })
      .returning();
    if (inserted === undefined) throw new AppError('INTERNAL');
    await writeName(this.#db, entityType, inserted.id, input.name);
    return {
      id: inserted.id,
      key: inserted.key,
      sortOrder: inserted.sortOrder,
      archivedAt: inserted.archivedAt,
      name: input.name,
    };
  }

  async updateTaxonomy(
    kind: TaxonomyKind,
    id: string,
    input: { key?: string; sortOrder?: number; name?: LocalizedName },
  ): Promise<TaxonomyRow> {
    const table = TAXONOMY_TABLES[kind];
    const entityType = TAXONOMY_ENTITY_TYPES[kind];
    const existing = await this.#db.select().from(table).where(eq(table.id, id)).limit(1);
    const row = existing[0];
    if (row === undefined) throw new AppError('NOT_FOUND');

    const [updated] = await this.#db
      .update(table)
      .set({
        key: input.key ?? row.key,
        sortOrder: input.sortOrder ?? row.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(table.id, id))
      .returning();
    if (updated === undefined) throw new AppError('INTERNAL');

    if (input.name !== undefined) {
      await writeName(this.#db, entityType, id, input.name);
    }
    const names = await loadNames(this.#db, entityType, [id]);
    return {
      id: updated.id,
      key: updated.key,
      sortOrder: updated.sortOrder,
      archivedAt: updated.archivedAt,
      name: names.get(id) ?? { bg: '', en: '' },
    };
  }

  async archiveTaxonomy(kind: TaxonomyKind, id: string): Promise<TaxonomyRow> {
    const table = TAXONOMY_TABLES[kind];
    const entityType = TAXONOMY_ENTITY_TYPES[kind];
    const [updated] = await this.#db
      .update(table)
      .set({ archivedAt: new Date(), updatedAt: new Date() })
      .where(eq(table.id, id))
      .returning();
    if (updated === undefined) throw new AppError('NOT_FOUND');
    const names = await loadNames(this.#db, entityType, [id]);
    return {
      id: updated.id,
      key: updated.key,
      sortOrder: updated.sortOrder,
      archivedAt: updated.archivedAt,
      name: names.get(id) ?? { bg: '', en: '' },
    };
  }
}

import { and, eq } from 'drizzle-orm';

import type { Database } from '../client.ts';
import { locations, translations } from '../schema.ts';
import type { SeedModule } from './index.ts';

interface LocationSeed {
  kind: string;
  slug: string;
  parentSlug?: string;
  parentKind?: string;
  code?: string;
  sortOrder?: number;
  nameBg: string;
  nameEn: string;
}

/** Deduped subset of the current-site inventory (02-current-site.analysis.md). */
const LOCATION_ROWS: LocationSeed[] = [
  {
    kind: 'country',
    slug: 'bulgaria',
    code: 'BG',
    sortOrder: 1,
    nameBg: 'България',
    nameEn: 'Bulgaria',
  },
  { kind: 'country', slug: 'uae', code: 'AE', sortOrder: 2, nameBg: 'ОАЕ', nameEn: 'UAE' },
  { kind: 'country', slug: 'greece', code: 'GR', sortOrder: 3, nameBg: 'Гърция', nameEn: 'Greece' },
  {
    kind: 'country',
    slug: 'north-cyprus',
    code: 'CY-NORTH',
    sortOrder: 4,
    nameBg: 'Северен Кипър',
    nameEn: 'North Cyprus',
  },
  {
    kind: 'city',
    slug: 'sofia',
    parentKind: 'country',
    parentSlug: 'bulgaria',
    sortOrder: 1,
    nameBg: 'София',
    nameEn: 'Sofia',
  },
  {
    kind: 'city',
    slug: 'varna',
    parentKind: 'country',
    parentSlug: 'bulgaria',
    sortOrder: 2,
    nameBg: 'Варна',
    nameEn: 'Varna',
  },
  {
    kind: 'city',
    slug: 'burgas',
    parentKind: 'country',
    parentSlug: 'bulgaria',
    sortOrder: 3,
    nameBg: 'Бургас',
    nameEn: 'Burgas',
  },
  {
    kind: 'city',
    slug: 'dubai',
    parentKind: 'country',
    parentSlug: 'uae',
    sortOrder: 1,
    nameBg: 'Дубай',
    nameEn: 'Dubai',
  },
  {
    kind: 'city',
    slug: 'nea-agchialos',
    parentKind: 'country',
    parentSlug: 'greece',
    sortOrder: 1,
    nameBg: 'Неа Анхиалос',
    nameEn: 'Nea Agchialos',
  },
  {
    kind: 'district',
    slug: 'lozenets',
    parentKind: 'city',
    parentSlug: 'sofia',
    sortOrder: 1,
    nameBg: 'Лозенец',
    nameEn: 'Lozenets',
  },
  {
    kind: 'district',
    slug: 'malinova-dolina',
    parentKind: 'city',
    parentSlug: 'sofia',
    sortOrder: 2,
    nameBg: 'Малинова долина',
    nameEn: 'Malinova Dolina',
  },
  {
    kind: 'district',
    slug: 'boyana',
    parentKind: 'city',
    parentSlug: 'sofia',
    sortOrder: 3,
    nameBg: 'Бояна',
    nameEn: 'Boyana',
  },
  {
    kind: 'district',
    slug: 'ovcha-kupel',
    parentKind: 'city',
    parentSlug: 'sofia',
    sortOrder: 4,
    nameBg: 'Овча купел',
    nameEn: 'Ovcha Kupel',
  },
  {
    kind: 'district',
    slug: 'downtown',
    parentKind: 'city',
    parentSlug: 'dubai',
    sortOrder: 1,
    nameBg: 'Даунтаун',
    nameEn: 'Downtown',
  },
];

async function upsertLocation(db: Database, row: LocationSeed, parentId: string | null) {
  const existing = await db
    .select()
    .from(locations)
    .where(and(eq(locations.kind, row.kind), eq(locations.slug, row.slug)))
    .limit(1);

  let id = existing[0]?.id;
  if (id === undefined) {
    const [inserted] = await db
      .insert(locations)
      .values({
        kind: row.kind,
        slug: row.slug,
        parentId,
        code: row.code ?? null,
        sortOrder: row.sortOrder ?? 0,
      })
      .returning({ id: locations.id });
    id = inserted?.id;
  } else {
    await db
      .update(locations)
      .set({
        parentId,
        code: row.code ?? null,
        sortOrder: row.sortOrder ?? 0,
        updatedAt: new Date(),
      })
      .where(eq(locations.id, id));
  }
  if (id === undefined) throw new Error(`failed to upsert location ${row.kind}/${row.slug}`);

  for (const [locale, value] of [
    ['bg', row.nameBg],
    ['en', row.nameEn],
  ] as const) {
    await db
      .insert(translations)
      .values({
        entityType: 'location',
        entityId: id,
        locale,
        field: 'name',
        value,
      })
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

  return id;
}

export const locationsSeed: SeedModule = {
  name: 'locations',
  run: async (db) => {
    const byKey = new Map<string, string>();

    // Parents before children: countries, then cities, then districts.
    const ordered = [...LOCATION_ROWS].sort((a, b) => {
      const rank = (kind: string) =>
        kind === 'country' ? 0 : kind === 'region' ? 1 : kind === 'city' ? 2 : 3;
      return rank(a.kind) - rank(b.kind) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });

    for (const row of ordered) {
      let parentId: string | null = null;
      if (row.parentKind !== undefined && row.parentSlug !== undefined) {
        parentId = byKey.get(`${row.parentKind}:${row.parentSlug}`) ?? null;
        if (parentId === null) {
          throw new Error(`missing parent ${row.parentKind}/${row.parentSlug} for ${row.slug}`);
        }
      }
      const id = await upsertLocation(db, row, parentId);
      byKey.set(`${row.kind}:${row.slug}`, id);
    }
  },
};

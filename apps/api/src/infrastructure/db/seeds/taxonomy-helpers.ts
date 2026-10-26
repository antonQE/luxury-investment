import { eq } from 'drizzle-orm';

import type { Database } from '../client.ts';
import { markets, translations } from '../schema.ts';

export interface TaxonomySeedRow {
  key: string;
  sortOrder?: number;
  nameBg: string;
  nameEn: string;
}

/** All taxonomy tables share this Drizzle shape. */
type AnyTaxonomyTable = typeof markets;

/** Upsert a taxonomy row by `key` and write BG/EN `name` translations. */
export async function upsertTaxonomyRows(
  db: Database,
  table: AnyTaxonomyTable,
  entityType: string,
  rows: TaxonomySeedRow[],
): Promise<void> {
  for (const row of rows) {
    const existing = await db.select().from(table).where(eq(table.key, row.key)).limit(1);
    let id = existing[0]?.id;
    if (id === undefined) {
      const [inserted] = await db
        .insert(table)
        .values({ key: row.key, sortOrder: row.sortOrder ?? 0 })
        .returning({ id: table.id });
      id = inserted?.id;
    } else {
      await db
        .update(table)
        .set({ sortOrder: row.sortOrder ?? 0, updatedAt: new Date() })
        .where(eq(table.id, id));
    }
    if (id === undefined) throw new Error(`failed to upsert ${entityType}:${row.key}`);

    for (const [locale, value] of [
      ['bg', row.nameBg],
      ['en', row.nameEn],
    ] as const) {
      await db
        .insert(translations)
        .values({
          entityType,
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
  }
}

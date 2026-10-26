import type { PropertyListQuery } from '@luxury-investment/shared';
import { and, count, desc, eq, ne, type SQL } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import { properties } from '../../../infrastructure/db/schema.ts';

export type PropertyRow = typeof properties.$inferSelect;

const PUBLISHED = 'published';

export class PropertyRepo {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async getPage(query: PropertyListQuery): Promise<{ items: PropertyRow[]; total: number }> {
    const filters = this.filters(query);
    filters.push(eq(properties.listingStatus, PUBLISHED));
    const where = and(...filters);
    const [items, totals] = await Promise.all([
      this.#db
        .select()
        .from(properties)
        .where(where)
        .orderBy(desc(properties.publishedAt))
        .limit(query.limit)
        .offset(query.offset),
      this.#db.select({ total: count() }).from(properties).where(where),
    ]);
    return { items, total: totals[0]?.total ?? 0 };
  }

  async getBySlug(slug: string): Promise<PropertyRow | undefined> {
    const [row] = await this.#db
      .select()
      .from(properties)
      .where(and(eq(properties.slug, slug), eq(properties.listingStatus, PUBLISHED)))
      .limit(1);
    return row;
  }

  async findSimilar(row: PropertyRow, limit = 4): Promise<PropertyRow[]> {
    return this.#db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.market, row.market),
          eq(properties.propertyType, row.propertyType),
          eq(properties.listingStatus, PUBLISHED),
          ne(properties.id, row.id),
        ),
      )
      .orderBy(desc(properties.publishedAt))
      .limit(limit);
  }

  private filters(query: PropertyListQuery): SQL[] {
    const clauses: SQL[] = [];
    if (query.transactionType !== undefined) {
      clauses.push(eq(properties.transactionType, query.transactionType));
    }
    if (query.propertyType !== undefined) {
      clauses.push(eq(properties.propertyType, query.propertyType));
    }
    if (query.market !== undefined) {
      clauses.push(eq(properties.market, query.market));
    }
    return clauses;
  }
}

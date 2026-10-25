import type { PropertyListQuery } from '@luxury-investment/shared';
import { and, count, desc, eq, type SQL } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import { properties } from '../../../infrastructure/db/schema.ts';

export type PropertyRow = typeof properties.$inferSelect;

export class PropertyRepo {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async getPage(query: PropertyListQuery): Promise<{ items: PropertyRow[]; total: number }> {
    const filters = this.filters(query);
    const where = filters.length > 0 ? and(...filters) : undefined;
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
      .where(eq(properties.slug, slug))
      .limit(1);
    return row;
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

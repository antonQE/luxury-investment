import type { PropertyListQuery } from '@luxury-investment/shared';
import { and, count, desc, eq, gte, ilike, lte, ne, or, type SQL, sql } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import { properties } from '../../../infrastructure/db/schema.ts';
import type { FxRateQuote } from '../../exchange-rates/app/convert-price.ts';
import { convertPrice } from '../../exchange-rates/app/convert-price.ts';

export type PropertyRow = typeof properties.$inferSelect;

const PUBLISHED = 'published';

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

/** Pure helper for mixed-currency price bounds (original amount unchanged). */
export function matchesNormalizedPriceBounds(
  price: number,
  currency: string,
  bounds: { priceMin?: number; priceMax?: number; priceCurrency: string },
  rates: FxRateQuote[],
): boolean {
  const converted = convertPrice(price, currency, bounds.priceCurrency, rates);
  if (converted === null) {
    if (currency.toUpperCase() !== bounds.priceCurrency.toUpperCase()) return false;
    if (bounds.priceMin !== undefined && price < bounds.priceMin) return false;
    if (bounds.priceMax !== undefined && price > bounds.priceMax) return false;
    return true;
  }
  if (bounds.priceMin !== undefined && converted.amount < bounds.priceMin) return false;
  if (bounds.priceMax !== undefined && converted.amount > bounds.priceMax) return false;
  return true;
}

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
    if (query.city !== undefined) {
      clauses.push(ilike(properties.city, `%${escapeLike(query.city)}%`));
    }
    if (query.district !== undefined) {
      clauses.push(ilike(properties.district, `%${escapeLike(query.district)}%`));
    }
    if (query.bedroomsMin !== undefined) {
      clauses.push(gte(properties.bedrooms, query.bedroomsMin));
    }
    if (query.priceMin !== undefined) {
      clauses.push(gte(sql`${properties.price}::numeric`, query.priceMin));
    }
    if (query.priceMax !== undefined) {
      clauses.push(lte(sql`${properties.price}::numeric`, query.priceMax));
    }
    if (query.areaMin !== undefined) {
      clauses.push(gte(sql`${properties.area}::numeric`, query.areaMin));
    }
    if (query.areaMax !== undefined) {
      clauses.push(lte(sql`${properties.area}::numeric`, query.areaMax));
    }
    if (query.q !== undefined) {
      const pattern = `%${escapeLike(query.q)}%`;
      const textMatch = or(
        ilike(properties.referenceNumber, pattern),
        ilike(properties.titleBg, pattern),
        ilike(properties.titleEn, pattern),
        ilike(properties.slug, pattern),
      );
      if (textMatch) clauses.push(textMatch);
    }
    return clauses;
  }
}

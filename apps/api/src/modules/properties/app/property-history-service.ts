import { desc, eq } from 'drizzle-orm';

import { AppError } from '../../../errors/app-error.ts';
import type { Database } from '../../../infrastructure/db/client.ts';
import {
  properties,
  propertyPriceHistory,
  propertySlugHistory,
} from '../../../infrastructure/db/schema.ts';

export class PropertyHistoryService {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async recordPriceChange(input: {
    propertyId: string;
    price: string;
    currency: string;
    changedByUserId?: string | null;
    note?: string | null;
  }): Promise<void> {
    const existing = await this.#db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.id, input.propertyId))
      .limit(1);
    if (existing.length === 0) throw new AppError('NOT_FOUND');

    await this.#db.insert(propertyPriceHistory).values({
      propertyId: input.propertyId,
      price: input.price,
      currency: input.currency,
      changedByUserId: input.changedByUserId ?? null,
      note: input.note ?? null,
    });
  }

  async recordSlugChange(input: {
    propertyId: string;
    previousSlug: string;
    changedByUserId?: string | null;
  }): Promise<void> {
    const existing = await this.#db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.id, input.propertyId))
      .limit(1);
    if (existing.length === 0) throw new AppError('NOT_FOUND');

    await this.#db.insert(propertySlugHistory).values({
      propertyId: input.propertyId,
      slug: input.previousSlug,
      changedByUserId: input.changedByUserId ?? null,
    });
  }

  /** Resolve an old slug to the current property slug, if any. */
  async resolveSlug(slug: string): Promise<{ currentSlug: string; propertyId: string } | null> {
    const current = await this.#db
      .select({ id: properties.id, slug: properties.slug })
      .from(properties)
      .where(eq(properties.slug, slug))
      .limit(1);
    if (current[0] !== undefined) {
      return { currentSlug: current[0].slug, propertyId: current[0].id };
    }

    const historical = await this.#db
      .select({
        propertyId: propertySlugHistory.propertyId,
        slug: properties.slug,
      })
      .from(propertySlugHistory)
      .innerJoin(properties, eq(properties.id, propertySlugHistory.propertyId))
      .where(eq(propertySlugHistory.slug, slug))
      .limit(1);

    const hit = historical[0];
    if (hit === undefined) return null;
    return { currentSlug: hit.slug, propertyId: hit.propertyId };
  }

  async listPriceHistory(propertyId: string, limit = 20) {
    return this.#db
      .select()
      .from(propertyPriceHistory)
      .where(eq(propertyPriceHistory.propertyId, propertyId))
      .orderBy(desc(propertyPriceHistory.createdAt))
      .limit(limit);
  }
}

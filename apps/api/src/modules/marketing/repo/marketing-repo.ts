import { and, asc, desc, eq, isNull } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import {
  marketingActivities,
  portalListings,
  portalMeasurements,
} from '../../../infrastructure/db/schema.ts';

export type MarketingActivityRow = typeof marketingActivities.$inferSelect;
export type PortalListingRow = typeof portalListings.$inferSelect;
export type PortalMeasurementRow = typeof portalMeasurements.$inferSelect;

export class MarketingRepo {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  listActivities(propertyId: string) {
    return this.#db
      .select()
      .from(marketingActivities)
      .where(
        and(eq(marketingActivities.propertyId, propertyId), isNull(marketingActivities.archivedAt)),
      )
      .orderBy(desc(marketingActivities.createdAt));
  }

  async createActivity(
    values: typeof marketingActivities.$inferInsert,
  ): Promise<MarketingActivityRow> {
    const [row] = await this.#db.insert(marketingActivities).values(values).returning();
    if (row === undefined) throw new Error('activity insert failed');
    return row;
  }

  async updateActivity(
    id: string,
    values: Partial<typeof marketingActivities.$inferInsert>,
  ): Promise<MarketingActivityRow | null> {
    const [row] = await this.#db
      .update(marketingActivities)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(marketingActivities.id, id))
      .returning();
    return row ?? null;
  }

  listPortalListings(propertyId: string) {
    return this.#db
      .select()
      .from(portalListings)
      .where(and(eq(portalListings.propertyId, propertyId), isNull(portalListings.archivedAt)))
      .orderBy(asc(portalListings.portalName));
  }

  async createPortalListing(values: typeof portalListings.$inferInsert): Promise<PortalListingRow> {
    const [row] = await this.#db.insert(portalListings).values(values).returning();
    if (row === undefined) throw new Error('portal listing insert failed');
    return row;
  }

  async updatePortalListing(
    id: string,
    values: Partial<typeof portalListings.$inferInsert>,
  ): Promise<PortalListingRow | null> {
    const [row] = await this.#db
      .update(portalListings)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(portalListings.id, id))
      .returning();
    return row ?? null;
  }

  async getPortalListing(id: string): Promise<PortalListingRow | undefined> {
    const [row] = await this.#db
      .select()
      .from(portalListings)
      .where(eq(portalListings.id, id))
      .limit(1);
    return row;
  }

  listMeasurements(portalListingId: string) {
    return this.#db
      .select()
      .from(portalMeasurements)
      .where(eq(portalMeasurements.portalListingId, portalListingId))
      .orderBy(desc(portalMeasurements.measuredOn), desc(portalMeasurements.createdAt));
  }

  async appendMeasurement(
    values: typeof portalMeasurements.$inferInsert,
  ): Promise<PortalMeasurementRow> {
    const [row] = await this.#db.insert(portalMeasurements).values(values).returning();
    if (row === undefined) throw new Error('measurement insert failed');
    return row;
  }
}

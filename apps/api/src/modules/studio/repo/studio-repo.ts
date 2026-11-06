import { and, desc, eq, isNull } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import {
  brochureExports,
  brochureTemplates,
  properties,
} from '../../../infrastructure/db/schema.ts';

export type BrochureTemplateRow = typeof brochureTemplates.$inferSelect;
export type BrochureExportRow = typeof brochureExports.$inferSelect;

export class StudioRepo {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  listActiveTemplates() {
    return this.#db
      .select()
      .from(brochureTemplates)
      .where(and(eq(brochureTemplates.isActive, true), isNull(brochureTemplates.archivedAt)))
      .orderBy(brochureTemplates.key);
  }

  async getTemplateByKey(key: string): Promise<BrochureTemplateRow | undefined> {
    const [row] = await this.#db
      .select()
      .from(brochureTemplates)
      .where(eq(brochureTemplates.key, key))
      .limit(1);
    return row;
  }

  async getPropertyForBrochure(propertyId: string) {
    const [row] = await this.#db
      .select({
        id: properties.id,
        referenceNumber: properties.referenceNumber,
        slug: properties.slug,
        titleBg: properties.titleBg,
        titleEn: properties.titleEn,
        descriptionBg: properties.descriptionBg,
        descriptionEn: properties.descriptionEn,
        price: properties.price,
        currency: properties.currency,
        city: properties.city,
        district: properties.district,
        area: properties.area,
        agentName: properties.agentName,
        agentPhone: properties.agentPhone,
        imageUrls: properties.imageUrls,
        badges: properties.badges,
      })
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);
    return row;
  }

  async createExport(values: typeof brochureExports.$inferInsert): Promise<BrochureExportRow> {
    const [row] = await this.#db.insert(brochureExports).values(values).returning();
    if (row === undefined) throw new Error('brochure export insert failed');
    return row;
  }

  async getExport(id: string): Promise<BrochureExportRow | undefined> {
    const [row] = await this.#db
      .select()
      .from(brochureExports)
      .where(eq(brochureExports.id, id))
      .limit(1);
    return row;
  }

  listExportsForProperty(propertyId: string) {
    return this.#db
      .select()
      .from(brochureExports)
      .where(eq(brochureExports.propertyId, propertyId))
      .orderBy(desc(brochureExports.createdAt))
      .limit(50);
  }
}

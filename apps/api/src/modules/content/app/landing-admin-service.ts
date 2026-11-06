import {
  type CreateLandingPageInput,
  type UpdateLandingPageInput,
  validateLandingSections,
} from '@luxury-investment/shared';
import { and, asc, eq, isNull } from 'drizzle-orm';

import { AppError } from '../../../errors/app-error.ts';
import type { Database } from '../../../infrastructure/db/client.ts';
import { landingPages, landingSections } from '../../../infrastructure/db/schema.ts';

function mapLanding(
  row: typeof landingPages.$inferSelect,
  sections: (typeof landingSections.$inferSelect)[],
) {
  return {
    id: row.id,
    key: row.key,
    slug: row.slug,
    status: row.status,
    titleBg: row.titleBg,
    titleEn: row.titleEn,
    seoTitleBg: row.seoTitleBg,
    seoTitleEn: row.seoTitleEn,
    seoDescriptionBg: row.seoDescriptionBg,
    seoDescriptionEn: row.seoDescriptionEn,
    robots: row.robots,
    showInNav: row.showInNav,
    campaignKey: row.campaignKey,
    publishedAt: row.publishedAt,
    sortOrder: row.sortOrder,
    sections: sections.map((section) => ({
      id: section.id,
      type: section.type,
      sortOrder: section.sortOrder,
      payload: section.payload,
    })),
  };
}

export class LandingAdminService {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async list() {
    const rows = await this.#db
      .select()
      .from(landingPages)
      .where(isNull(landingPages.archivedAt))
      .orderBy(asc(landingPages.sortOrder), asc(landingPages.slug));
    return rows.map((row) => ({
      id: row.id,
      key: row.key,
      slug: row.slug,
      status: row.status,
      titleBg: row.titleBg,
      titleEn: row.titleEn,
      showInNav: row.showInNav,
      campaignKey: row.campaignKey,
      robots: row.robots,
      publishedAt: row.publishedAt,
      sortOrder: row.sortOrder,
    }));
  }

  async get(id: string) {
    const [row] = await this.#db
      .select()
      .from(landingPages)
      .where(and(eq(landingPages.id, id), isNull(landingPages.archivedAt)))
      .limit(1);
    if (row === undefined) throw new AppError('NOT_FOUND', 'Landing page not found.');
    const sections = await this.#db
      .select()
      .from(landingSections)
      .where(eq(landingSections.landingPageId, id))
      .orderBy(asc(landingSections.sortOrder));
    return mapLanding(row, sections);
  }

  async create(input: CreateLandingPageInput) {
    const parsedSections = validateLandingSections(input.sections);
    try {
      const [row] = await this.#db
        .insert(landingPages)
        .values({
          key: input.key,
          slug: input.slug,
          status: 'draft',
          titleBg: input.titleBg,
          titleEn: input.titleEn,
          seoTitleBg: input.seoTitleBg,
          seoTitleEn: input.seoTitleEn,
          seoDescriptionBg: input.seoDescriptionBg,
          seoDescriptionEn: input.seoDescriptionEn,
          robots: input.robots,
          showInNav: input.showInNav,
          campaignKey: input.campaignKey,
          sortOrder: input.sortOrder,
        })
        .returning();
      if (row === undefined) throw new Error('landing insert failed');

      if (parsedSections.length > 0) {
        await this.#db.insert(landingSections).values(
          parsedSections.map((section, index) => ({
            landingPageId: row.id,
            type: section.type,
            sortOrder: index,
            payload: section.payload,
          })),
        );
      }
      return await this.get(row.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (
        message.includes('landing_pages_slug_unique') ||
        message.includes('landing_pages_key_unique')
      ) {
        throw new AppError('CONFLICT', 'Landing key or slug already exists.');
      }
      throw error;
    }
  }

  async update(id: string, input: UpdateLandingPageInput) {
    const existing = await this.get(id);
    const parsedSections =
      input.sections !== undefined ? validateLandingSections(input.sections) : undefined;

    try {
      const [row] = await this.#db
        .update(landingPages)
        .set({
          slug: input.slug ?? existing.slug,
          titleBg: input.titleBg ?? existing.titleBg,
          titleEn: input.titleEn ?? existing.titleEn,
          seoTitleBg: input.seoTitleBg ?? existing.seoTitleBg,
          seoTitleEn: input.seoTitleEn ?? existing.seoTitleEn,
          seoDescriptionBg: input.seoDescriptionBg ?? existing.seoDescriptionBg,
          seoDescriptionEn: input.seoDescriptionEn ?? existing.seoDescriptionEn,
          robots: input.robots ?? existing.robots,
          showInNav: input.showInNav ?? existing.showInNav,
          campaignKey: input.campaignKey ?? existing.campaignKey,
          sortOrder: input.sortOrder ?? existing.sortOrder,
          updatedAt: new Date(),
        })
        .where(and(eq(landingPages.id, id), isNull(landingPages.archivedAt)))
        .returning();
      if (row === undefined) throw new AppError('NOT_FOUND', 'Landing page not found.');

      if (parsedSections !== undefined) {
        await this.#db.delete(landingSections).where(eq(landingSections.landingPageId, id));
        if (parsedSections.length > 0) {
          await this.#db.insert(landingSections).values(
            parsedSections.map((section, index) => ({
              landingPageId: id,
              type: section.type,
              sortOrder: index,
              payload: section.payload,
            })),
          );
        }
      }
      return await this.get(id);
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = error instanceof Error ? error.message : '';
      if (message.includes('landing_pages_slug_unique')) {
        throw new AppError('CONFLICT', 'Landing slug already exists.');
      }
      throw error;
    }
  }

  async publish(id: string, publishAt?: Date) {
    const [row] = await this.#db
      .update(landingPages)
      .set({
        status: 'published',
        publishedAt: publishAt ?? new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(landingPages.id, id), isNull(landingPages.archivedAt)))
      .returning();
    if (row === undefined) throw new AppError('NOT_FOUND', 'Landing page not found.');
    return row;
  }

  async archive(id: string) {
    const [row] = await this.#db
      .update(landingPages)
      .set({
        status: 'archived',
        archivedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(landingPages.id, id), isNull(landingPages.archivedAt)))
      .returning();
    if (row === undefined) throw new AppError('NOT_FOUND', 'Landing page not found.');
    return row;
  }
}

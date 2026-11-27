import type { Locale, PublicLanding } from '@luxury-investment/shared';
import {
  isRecordId,
  landingRobotsSchema,
  landingSectionTypeSchema,
} from '@luxury-investment/shared';
import { and, asc, eq, isNotNull, isNull, lte, type SQL } from 'drizzle-orm';

import { AppError } from '../../../errors/app-error.ts';
import type { Database } from '../../../infrastructure/db/client.ts';
import { landingPages, landingSections } from '../../../infrastructure/db/schema.ts';

function pickLocale(locale: Locale, bg: string, en: string): string {
  return locale === 'en' ? en || bg : bg || en;
}

export class LandingPublicService {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async getBySlug(locale: Locale, slug: string): Promise<PublicLanding> {
    return this.#load(locale, eq(landingPages.slug, slug));
  }

  /** Public detail by record id (`/campaigns/{id}/`). Malformed ids are "not found". */
  async getById(locale: Locale, id: string): Promise<PublicLanding> {
    if (!isRecordId(id)) throw new AppError('NOT_FOUND', 'Landing page not found.');
    return this.#load(locale, eq(landingPages.id, id));
  }

  async #load(locale: Locale, match: SQL | undefined): Promise<PublicLanding> {
    const now = new Date();
    const [row] = await this.#db
      .select()
      .from(landingPages)
      .where(
        and(
          match,
          eq(landingPages.status, 'published'),
          isNull(landingPages.archivedAt),
          isNotNull(landingPages.publishedAt),
          lte(landingPages.publishedAt, now),
        ),
      )
      .limit(1);
    if (row === undefined) throw new AppError('NOT_FOUND', 'Landing page not found.');

    const sections = await this.#db
      .select()
      .from(landingSections)
      .where(eq(landingSections.landingPageId, row.id))
      .orderBy(asc(landingSections.sortOrder));

    const robots = landingRobotsSchema.parse(row.robots);

    return {
      id: row.id,
      slug: row.slug,
      title: pickLocale(locale, row.titleBg, row.titleEn),
      seoTitle:
        pickLocale(locale, row.seoTitleBg, row.seoTitleEn) ||
        pickLocale(locale, row.titleBg, row.titleEn),
      seoDescription: pickLocale(locale, row.seoDescriptionBg, row.seoDescriptionEn),
      robots,
      showInNav: row.showInNav,
      campaignKey: row.campaignKey,
      publishedAt: row.publishedAt?.toISOString() ?? null,
      sections: sections.map((section) => ({
        id: section.id,
        type: landingSectionTypeSchema.parse(section.type),
        sortOrder: section.sortOrder,
        payload: section.payload,
      })),
    };
  }
}

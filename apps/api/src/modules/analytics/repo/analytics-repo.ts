import { and, asc, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import {
  inquiries,
  offers,
  ownerReportSnapshots,
  properties,
  propertyEventDailyRollups,
  propertyEvents,
  propertyPriceHistory,
  siteEventDailyRollups,
  siteEvents,
  viewings,
} from '../../../infrastructure/db/schema.ts';

export type PropertyEventRow = typeof propertyEvents.$inferSelect;
export type OwnerReportSnapshotRow = typeof ownerReportSnapshots.$inferSelect;

const BOT_UA =
  /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|phantom|wget|curl|python-requests/i;

export function isBotUserAgent(userAgent: string): boolean {
  return BOT_UA.test(userAgent);
}

export class AnalyticsRepo {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async ingestEvent(input: {
    propertyId: string;
    eventType: string;
    sessionKey: string;
    source: string;
    deviceClass: string;
    userAgent: string;
  }): Promise<{ id: string; counted: boolean }> {
    const bot = isBotUserAgent(input.userAgent);
    const [row] = await this.#db
      .insert(propertyEvents)
      .values({
        propertyId: input.propertyId,
        eventType: input.eventType,
        sessionKey: input.sessionKey,
        source: input.source,
        deviceClass: input.deviceClass,
        userAgent: input.userAgent.slice(0, 500),
        isBot: bot ? 1 : 0,
      })
      .returning({ id: propertyEvents.id });
    if (row === undefined) throw new Error('event insert failed');

    if (!bot) {
      await this.#bumpDailyRollup({
        propertyId: input.propertyId,
        eventType: input.eventType,
        sessionKey: input.sessionKey,
      });
    }

    return { id: row.id, counted: !bot };
  }

  async #bumpDailyRollup(input: {
    propertyId: string;
    eventType: string;
    sessionKey: string;
  }): Promise<void> {
    const day = new Date().toISOString().slice(0, 10);
    const [existing] = await this.#db
      .select()
      .from(propertyEventDailyRollups)
      .where(
        and(
          eq(propertyEventDailyRollups.propertyId, input.propertyId),
          eq(propertyEventDailyRollups.eventType, input.eventType),
          eq(propertyEventDailyRollups.day, day),
        ),
      )
      .limit(1);

    const alreadySeen =
      input.sessionKey !== '' &&
      (await this.#sessionSeenToday({
        propertyId: input.propertyId,
        eventType: input.eventType,
        sessionKey: input.sessionKey,
        day,
      }));
    const uniqueDelta = input.sessionKey !== '' && !alreadySeen ? 1 : 0;

    if (existing === undefined) {
      await this.#db.insert(propertyEventDailyRollups).values({
        propertyId: input.propertyId,
        eventType: input.eventType,
        day,
        eventCount: 1,
        uniqueSessions: uniqueDelta,
      });
      return;
    }

    await this.#db
      .update(propertyEventDailyRollups)
      .set({
        eventCount: existing.eventCount + 1,
        uniqueSessions: existing.uniqueSessions + uniqueDelta,
        updatedAt: new Date(),
      })
      .where(eq(propertyEventDailyRollups.id, existing.id));
  }

  /**
   * Returns true if this session already had a counted event today for the same
   * property+type (so uniqueSessions should not bump again).
   */
  async #sessionSeenToday(input: {
    propertyId: string;
    eventType: string;
    sessionKey: string;
    day: string;
  }): Promise<boolean> {
    const start = new Date(`${input.day}T00:00:00.000Z`);
    const end = new Date(`${input.day}T23:59:59.999Z`);
    const rows = await this.#db
      .select({ id: propertyEvents.id })
      .from(propertyEvents)
      .where(
        and(
          eq(propertyEvents.propertyId, input.propertyId),
          eq(propertyEvents.eventType, input.eventType),
          eq(propertyEvents.sessionKey, input.sessionKey),
          eq(propertyEvents.isBot, 0),
          gte(propertyEvents.occurredAt, start),
          lte(propertyEvents.occurredAt, end),
        ),
      )
      .limit(2);
    // After insert there is always ≥1; already seen if a prior row exists today.
    return rows.length > 1;
  }

  listRollups(propertyId: string, periodFrom: string | null, periodTo: string | null) {
    const clauses = [eq(propertyEventDailyRollups.propertyId, propertyId)];
    if (periodFrom !== null) clauses.push(gte(propertyEventDailyRollups.day, periodFrom));
    if (periodTo !== null) clauses.push(lte(propertyEventDailyRollups.day, periodTo));
    return this.#db
      .select()
      .from(propertyEventDailyRollups)
      .where(and(...clauses))
      .orderBy(asc(propertyEventDailyRollups.day));
  }

  async propertyExists(propertyId: string): Promise<boolean> {
    const [row] = await this.#db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);
    return row !== undefined;
  }

  async getPropertyMeta(propertyId: string) {
    const [row] = await this.#db
      .select({
        id: properties.id,
        referenceNumber: properties.referenceNumber,
        slug: properties.slug,
        publishedAt: properties.publishedAt,
        titleBg: properties.titleBg,
        price: properties.price,
        currency: properties.currency,
      })
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);
    return row;
  }

  async countInquiries(propertySlug: string, from: Date | null, to: Date | null): Promise<number> {
    const clauses = [eq(inquiries.propertySlug, propertySlug)];
    if (from !== null) clauses.push(gte(inquiries.createdAt, from));
    if (to !== null) clauses.push(lte(inquiries.createdAt, to));
    const [row] = await this.#db
      .select({ count: sql<number>`count(*)::int` })
      .from(inquiries)
      .where(and(...clauses));
    return row?.count ?? 0;
  }

  async countViewings(propertyId: string, from: Date | null, to: Date | null): Promise<number> {
    const clauses = [eq(viewings.propertyId, propertyId)];
    if (from !== null) clauses.push(gte(viewings.scheduledAt, from));
    if (to !== null) clauses.push(lte(viewings.scheduledAt, to));
    const [row] = await this.#db
      .select({ count: sql<number>`count(*)::int` })
      .from(viewings)
      .where(and(...clauses));
    return row?.count ?? 0;
  }

  async countOffers(propertyId: string, from: Date | null, to: Date | null): Promise<number> {
    const clauses = [eq(offers.propertyId, propertyId)];
    if (from !== null) clauses.push(gte(offers.createdAt, from));
    if (to !== null) clauses.push(lte(offers.createdAt, to));
    const [row] = await this.#db
      .select({ count: sql<number>`count(*)::int` })
      .from(offers)
      .where(and(...clauses));
    return row?.count ?? 0;
  }

  listPriceHistory(propertyId: string) {
    return this.#db
      .select({
        price: propertyPriceHistory.price,
        currency: propertyPriceHistory.currency,
        createdAt: propertyPriceHistory.createdAt,
        note: propertyPriceHistory.note,
      })
      .from(propertyPriceHistory)
      .where(eq(propertyPriceHistory.propertyId, propertyId))
      .orderBy(desc(propertyPriceHistory.createdAt))
      .limit(50);
  }

  listOwnerReports(propertyId: string) {
    return this.#db
      .select()
      .from(ownerReportSnapshots)
      .where(eq(ownerReportSnapshots.propertyId, propertyId))
      .orderBy(desc(ownerReportSnapshots.createdAt));
  }

  async createOwnerReport(
    values: typeof ownerReportSnapshots.$inferInsert,
  ): Promise<OwnerReportSnapshotRow> {
    const [row] = await this.#db.insert(ownerReportSnapshots).values(values).returning();
    if (row === undefined) throw new Error('owner report insert failed');
    return row;
  }

  /** Lifetime page_view totals + distinct sessions (bots excluded). */
  async getPropertyViewStatsForIds(
    propertyIds: string[],
  ): Promise<{ propertyId: string; viewsTotal: number; viewsUnique: number }[]> {
    if (propertyIds.length === 0) return [];
    const rows = await this.#db
      .select({
        propertyId: propertyEvents.propertyId,
        viewsTotal: sql<number>`count(*)::int`,
        viewsUnique: sql<number>`count(distinct ${propertyEvents.sessionKey})::int`,
      })
      .from(propertyEvents)
      .where(
        and(
          inArray(propertyEvents.propertyId, propertyIds),
          eq(propertyEvents.eventType, 'page_view'),
          eq(propertyEvents.isBot, 0),
          sql`${propertyEvents.sessionKey} <> ''`,
        ),
      )
      .groupBy(propertyEvents.propertyId);
    return rows.map((row) => ({
      propertyId: row.propertyId,
      viewsTotal: row.viewsTotal,
      viewsUnique: row.viewsUnique,
    }));
  }

  async ingestSiteEvent(input: {
    path: string;
    eventType: string;
    label: string;
    href: string;
    sessionKey: string;
    deviceClass: string;
    userAgent: string;
  }): Promise<{ id: string; counted: boolean }> {
    const bot = isBotUserAgent(input.userAgent);
    const [row] = await this.#db
      .insert(siteEvents)
      .values({
        path: input.path.slice(0, 300),
        eventType: input.eventType,
        label: input.label.slice(0, 200),
        href: input.href.slice(0, 500),
        sessionKey: input.sessionKey,
        deviceClass: input.deviceClass,
        userAgent: input.userAgent.slice(0, 500),
        isBot: bot ? 1 : 0,
      })
      .returning({ id: siteEvents.id });
    if (row === undefined) throw new Error('site event insert failed');

    if (!bot) {
      await this.#bumpSiteDailyRollup({
        path: input.path.slice(0, 300),
        eventType: input.eventType,
        label: input.label.slice(0, 200),
        sessionKey: input.sessionKey,
      });
    }

    return { id: row.id, counted: !bot };
  }

  async #bumpSiteDailyRollup(input: {
    path: string;
    eventType: string;
    label: string;
    sessionKey: string;
  }): Promise<void> {
    const day = new Date().toISOString().slice(0, 10);
    const [existing] = await this.#db
      .select()
      .from(siteEventDailyRollups)
      .where(
        and(
          eq(siteEventDailyRollups.path, input.path),
          eq(siteEventDailyRollups.eventType, input.eventType),
          eq(siteEventDailyRollups.label, input.label),
          eq(siteEventDailyRollups.day, day),
        ),
      )
      .limit(1);

    const alreadySeen =
      input.sessionKey !== '' &&
      (await this.#siteSessionSeenToday({
        path: input.path,
        eventType: input.eventType,
        label: input.label,
        sessionKey: input.sessionKey,
        day,
      }));
    const uniqueDelta = input.sessionKey !== '' && !alreadySeen ? 1 : 0;

    if (existing === undefined) {
      await this.#db.insert(siteEventDailyRollups).values({
        path: input.path,
        eventType: input.eventType,
        label: input.label,
        day,
        eventCount: 1,
        uniqueSessions: uniqueDelta,
      });
      return;
    }

    await this.#db
      .update(siteEventDailyRollups)
      .set({
        eventCount: existing.eventCount + 1,
        uniqueSessions: existing.uniqueSessions + uniqueDelta,
        updatedAt: new Date(),
      })
      .where(eq(siteEventDailyRollups.id, existing.id));
  }

  async #siteSessionSeenToday(input: {
    path: string;
    eventType: string;
    label: string;
    sessionKey: string;
    day: string;
  }): Promise<boolean> {
    const start = new Date(`${input.day}T00:00:00.000Z`);
    const end = new Date(`${input.day}T23:59:59.999Z`);
    const rows = await this.#db
      .select({ id: siteEvents.id })
      .from(siteEvents)
      .where(
        and(
          eq(siteEvents.path, input.path),
          eq(siteEvents.eventType, input.eventType),
          eq(siteEvents.label, input.label),
          eq(siteEvents.sessionKey, input.sessionKey),
          eq(siteEvents.isBot, 0),
          gte(siteEvents.occurredAt, start),
          lte(siteEvents.occurredAt, end),
        ),
      )
      .limit(2);
    return rows.length > 1;
  }

  async siteSummary(days: number): Promise<{
    pages: { path: string; events: number; uniqueSessions: number }[];
    clicks: {
      path: string;
      label: string;
      href: string;
      events: number;
      uniqueSessions: number;
    }[];
  }> {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days);

    const pageRows = await this.#db
      .select({
        path: siteEvents.path,
        events: sql<number>`count(*)::int`,
        uniqueSessions: sql<number>`count(distinct ${siteEvents.sessionKey})::int`,
      })
      .from(siteEvents)
      .where(
        and(
          eq(siteEvents.eventType, 'page_view'),
          eq(siteEvents.isBot, 0),
          gte(siteEvents.occurredAt, since),
          sql`${siteEvents.sessionKey} <> ''`,
        ),
      )
      .groupBy(siteEvents.path)
      .orderBy(desc(sql`count(*)`))
      .limit(40);

    const clickRows = await this.#db
      .select({
        path: siteEvents.path,
        label: siteEvents.label,
        href: siteEvents.href,
        events: sql<number>`count(*)::int`,
        uniqueSessions: sql<number>`count(distinct ${siteEvents.sessionKey})::int`,
      })
      .from(siteEvents)
      .where(
        and(
          eq(siteEvents.eventType, 'click'),
          eq(siteEvents.isBot, 0),
          gte(siteEvents.occurredAt, since),
          sql`${siteEvents.sessionKey} <> ''`,
        ),
      )
      .groupBy(siteEvents.path, siteEvents.label, siteEvents.href)
      .orderBy(desc(sql`count(*)`))
      .limit(50);

    return {
      pages: pageRows.map((row) => ({
        path: row.path,
        events: row.events,
        uniqueSessions: row.uniqueSessions,
      })),
      clicks: clickRows.map((row) => ({
        path: row.path,
        label: row.label,
        href: row.href,
        events: row.events,
        uniqueSessions: row.uniqueSessions,
      })),
    };
  }
}

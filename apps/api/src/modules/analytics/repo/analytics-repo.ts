import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import {
  inquiries,
  offers,
  ownerReportSnapshots,
  properties,
  propertyEventDailyRollups,
  propertyEvents,
  propertyPriceHistory,
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
}

import type { GenerateOwnerReportInput } from '@luxury-investment/shared';

import { AppError } from '../../../errors/app-error.ts';
import type { AnalyticsRepo } from '../repo/analytics-repo.ts';

export interface OwnerReportPayload {
  methodology: {
    viewsSource: 'internal_daily_rollups';
    uniqueSessionsNote: 'Distinct opaque sessionKey values per day; bots excluded.';
    noBuyerPii: true;
  };
  property: {
    id: string;
    referenceNumber: string;
    slug: string;
    titleBg: string;
    currentPrice: string;
    currency: string;
    firstPublishedAt: string | null;
  };
  period: { from: string | null; to: string | null; label: string };
  views: {
    totalEvents: number;
    uniqueSessionsSum: number;
    byEventType: Record<string, { events: number; uniqueSessions: number }>;
    daily: {
      day: string;
      eventType: string;
      eventCount: number;
      uniqueSessions: number;
    }[];
  };
  funnelCounts: {
    inquiries: number;
    viewings: number;
    offers: number;
  };
  priceHistory: {
    price: string;
    currency: string;
    createdAt: string;
    note: string | null;
  }[];
  brokerComment: string;
}

function toDateBoundary(isoDate: string | null | undefined, endOfDay: boolean): Date | null {
  if (isoDate === null || isoDate === undefined || isoDate === '') return null;
  return new Date(`${isoDate}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`);
}

export class OwnerReportService {
  readonly #repo: AnalyticsRepo;

  constructor(repo: AnalyticsRepo) {
    this.#repo = repo;
  }

  async generate(input: GenerateOwnerReportInput, generatedByUserId: string | null) {
    const meta = await this.#repo.getPropertyMeta(input.propertyId);
    if (meta === undefined) throw new AppError('NOT_FOUND');

    let periodFrom = input.periodFrom ?? null;
    let periodTo = input.periodTo ?? null;
    let periodLabel = 'custom';
    if (periodFrom === null && periodTo === null) {
      periodFrom = meta.publishedAt?.toISOString().slice(0, 10) ?? null;
      periodTo = new Date().toISOString().slice(0, 10);
      periodLabel = 'since_first_publication';
    }

    const fromTs = toDateBoundary(periodFrom, false);
    const toTs = toDateBoundary(periodTo, true);

    const rollups = await this.#repo.listRollups(input.propertyId, periodFrom, periodTo);
    const byEventType: OwnerReportPayload['views']['byEventType'] = {};
    let totalEvents = 0;
    let uniqueSessionsSum = 0;
    for (const row of rollups) {
      totalEvents += row.eventCount;
      uniqueSessionsSum += row.uniqueSessions;
      const bucket = byEventType[row.eventType] ?? { events: 0, uniqueSessions: 0 };
      bucket.events += row.eventCount;
      bucket.uniqueSessions += row.uniqueSessions;
      byEventType[row.eventType] = bucket;
    }

    const [inquiryCount, viewingCount, offerCount, priceHistory] = await Promise.all([
      this.#repo.countInquiries(meta.slug, fromTs, toTs),
      this.#repo.countViewings(input.propertyId, fromTs, toTs),
      this.#repo.countOffers(input.propertyId, fromTs, toTs),
      this.#repo.listPriceHistory(input.propertyId),
    ]);

    const payload: OwnerReportPayload = {
      methodology: {
        viewsSource: 'internal_daily_rollups',
        uniqueSessionsNote: 'Distinct opaque sessionKey values per day; bots excluded.',
        noBuyerPii: true,
      },
      property: {
        id: meta.id,
        referenceNumber: meta.referenceNumber,
        slug: meta.slug,
        titleBg: meta.titleBg,
        currentPrice: meta.price,
        currency: meta.currency,
        firstPublishedAt: meta.publishedAt?.toISOString() ?? null,
      },
      period: { from: periodFrom, to: periodTo, label: periodLabel },
      views: {
        totalEvents,
        uniqueSessionsSum,
        byEventType,
        daily: rollups.map((row) => ({
          day: row.day,
          eventType: row.eventType,
          eventCount: row.eventCount,
          uniqueSessions: row.uniqueSessions,
        })),
      },
      funnelCounts: {
        inquiries: inquiryCount,
        viewings: viewingCount,
        offers: offerCount,
      },
      priceHistory: priceHistory.map((row) => ({
        price: row.price,
        currency: row.currency,
        createdAt: row.createdAt.toISOString(),
        note: row.note,
      })),
      brokerComment: input.brokerComment,
    };

    return this.#repo.createOwnerReport({
      propertyId: input.propertyId,
      kind: input.kind,
      periodFrom,
      periodTo,
      generatedByUserId,
      brokerComment: input.brokerComment,
      payload,
    });
  }
}

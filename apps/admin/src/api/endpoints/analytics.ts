import type { SiteInsightRange } from '@luxury-investment/shared';
import { siteInsightRangeDays } from '@luxury-investment/shared';

import { apiClient } from '@/api/clients';

export interface PropertyViewStats {
  propertyId: string;
  viewsTotal: number;
  viewsUnique: number;
}

export interface SiteAnalyticsSummary {
  days: number;
  pages: { path: string; events: number; uniqueSessions: number }[];
  clicks: {
    path: string;
    label: string;
    href: string;
    events: number;
    uniqueSessions: number;
  }[];
}

export interface InsightTotals {
  sessions: number;
  pageviews: number;
  users: number;
  newUsers: number;
  avgSessionDurationMs: number;
  bounceRate: number;
  engagedMsSum: number;
  bouncedSessions: number;
}

export interface SiteInsightOverview {
  range: SiteInsightRange;
  days: number;
  current: InsightTotals;
  previous: InsightTotals;
  deltas: {
    sessions: number | null;
    pageviews: number | null;
    users: number | null;
    newUsers: number | null;
    avgSessionDurationMs: number | null;
    bounceRate: number | null;
  };
}

interface ViewsEnvelope {
  data: PropertyViewStats[];
}

interface SiteEnvelope {
  data: SiteAnalyticsSummary;
}

interface OverviewEnvelope {
  data: SiteInsightOverview;
}

export const analyticsKeys = {
  propertyViews: (ids: string[]) => ['admin', 'analytics', 'property-views', ...ids] as const,
  site: (days: number) => ['admin', 'analytics', 'site', days] as const,
  overview: (range: SiteInsightRange) => ['admin', 'analytics', 'overview', range] as const,
};

export async function fetchPropertyViewStats(ids: string[]): Promise<PropertyViewStats[]> {
  if (ids.length === 0) return [];
  const { data } = await apiClient.get<ViewsEnvelope>(
    `/v1/admin/analytics/property-views?ids=${encodeURIComponent(ids.join(','))}`,
  );
  return data.data;
}

export async function fetchSiteAnalytics(days = 30): Promise<SiteAnalyticsSummary> {
  const { data } = await apiClient.get<SiteEnvelope>(
    `/v1/admin/analytics/site?days=${String(days)}`,
  );
  return data.data;
}

export async function fetchSiteInsightOverview(
  range: SiteInsightRange = '30d',
): Promise<SiteInsightOverview> {
  const { data } = await apiClient.get<OverviewEnvelope>(
    `/v1/admin/analytics/overview?range=${encodeURIComponent(range)}`,
  );
  return data.data;
}

export { siteInsightRangeDays };
export type { SiteInsightRange };

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

interface ViewsEnvelope {
  data: PropertyViewStats[];
}

interface SiteEnvelope {
  data: SiteAnalyticsSummary;
}

export const analyticsKeys = {
  propertyViews: (ids: string[]) => ['admin', 'analytics', 'property-views', ...ids] as const,
  site: (days: number) => ['admin', 'analytics', 'site', days] as const,
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

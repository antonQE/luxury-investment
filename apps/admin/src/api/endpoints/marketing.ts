import type {
  CreateMarketingActivityInput,
  CreatePortalListingInput,
  CreatePortalMeasurementInput,
  MarketingActivityStatus,
  PortalListingStatus,
} from '@luxury-investment/shared';

import { apiClient } from '@/api/clients';

export interface AdminMarketingActivity {
  id: string;
  propertyId: string;
  activityType: string;
  title: string;
  ownerUserId: string | null;
  status: MarketingActivityStatus;
  startsOn: string | null;
  endsOn: string | null;
  costAmount: string | null;
  costCurrency: string;
  resultNotes: string;
  evidenceUrl: string | null;
  recurrence: string;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPortalListing {
  id: string;
  propertyId: string;
  portalName: string;
  listingUrl: string;
  status: PortalListingStatus;
  publishedOn: string | null;
  notes: string;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPortalMeasurement {
  id: string;
  portalListingId: string;
  measuredOn: string;
  periodLabel: string;
  views: number;
  saves: number;
  metricDefinition: string;
  enteredByUserId: string | null;
  evidenceUrl: string | null;
  notes: string;
  createdAt: string;
}

interface ListEnvelope<T> {
  data: T[];
}

export const marketingKeys = {
  activities: (propertyId: string) => ['admin', 'marketing', 'activities', propertyId] as const,
  portals: (propertyId: string) => ['admin', 'marketing', 'portals', propertyId] as const,
  measurements: (listingId: string) => ['admin', 'marketing', 'measurements', listingId] as const,
};

export async function fetchMarketingActivities(
  propertyId: string,
): Promise<AdminMarketingActivity[]> {
  const { data } = await apiClient.get<ListEnvelope<AdminMarketingActivity>>(
    `/v1/admin/marketing/activities?propertyId=${encodeURIComponent(propertyId)}`,
  );
  return data.data;
}

export async function createMarketingActivity(
  body: CreateMarketingActivityInput,
): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ data: { id: string } }>(
    '/v1/admin/marketing/activities',
    body,
  );
  return data.data;
}

export async function fetchPortalListings(propertyId: string): Promise<AdminPortalListing[]> {
  const { data } = await apiClient.get<ListEnvelope<AdminPortalListing>>(
    `/v1/admin/marketing/portal-listings?propertyId=${encodeURIComponent(propertyId)}`,
  );
  return data.data;
}

export async function createPortalListing(body: CreatePortalListingInput): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ data: { id: string } }>(
    '/v1/admin/marketing/portal-listings',
    body,
  );
  return data.data;
}

export async function fetchPortalMeasurements(
  listingId: string,
): Promise<AdminPortalMeasurement[]> {
  const { data } = await apiClient.get<ListEnvelope<AdminPortalMeasurement>>(
    `/v1/admin/marketing/portal-listings/${listingId}/measurements`,
  );
  return data.data;
}

export async function appendPortalMeasurement(
  listingId: string,
  body: CreatePortalMeasurementInput,
): Promise<{ id: string; previousCount: number; currentCount: number }> {
  const { data } = await apiClient.post<{
    data: { id: string; previousCount: number; currentCount: number };
  }>(`/v1/admin/marketing/portal-listings/${listingId}/measurements`, body);
  return data.data;
}

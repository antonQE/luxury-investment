import type { LandingSectionType } from '@luxury-investment/shared';

import { apiClient } from '@/api/clients';

export interface AdminLandingSummary {
  id: string;
  key: string;
  slug: string;
  status: string;
  titleBg: string;
  titleEn: string;
  showInNav: boolean;
  campaignKey: string;
  robots: string;
  publishedAt: string | null;
  sortOrder: number;
}

export interface AdminLandingSection {
  id?: string;
  type: LandingSectionType;
  sortOrder: number;
  payload: Record<string, unknown>;
}

export interface AdminLandingDetail extends AdminLandingSummary {
  seoTitleBg: string;
  seoTitleEn: string;
  seoDescriptionBg: string;
  seoDescriptionEn: string;
  sections: AdminLandingSection[];
}

export const landingKeys = {
  list: () => ['admin', 'landings'] as const,
  detail: (id: string) => ['admin', 'landings', id] as const,
};

export async function fetchAdminLandings(): Promise<AdminLandingSummary[]> {
  const { data } = await apiClient.get<{ data: AdminLandingSummary[] }>('/v1/admin/landings');
  return data.data;
}

export async function fetchAdminLanding(id: string): Promise<AdminLandingDetail> {
  const { data } = await apiClient.get<{ data: AdminLandingDetail }>(`/v1/admin/landings/${id}`);
  return data.data;
}

export async function createAdminLanding(body: {
  key: string;
  slug: string;
  titleBg: string;
  titleEn: string;
  seoTitleBg?: string;
  seoTitleEn?: string;
  seoDescriptionBg?: string;
  seoDescriptionEn?: string;
  robots?: string;
  showInNav?: boolean;
  campaignKey?: string;
  sections?: { type: LandingSectionType; payload: unknown }[];
}): Promise<AdminLandingDetail> {
  const { data } = await apiClient.post<{ data: AdminLandingDetail }>('/v1/admin/landings', body);
  return data.data;
}

export async function updateAdminLanding(
  id: string,
  body: {
    slug?: string;
    titleBg?: string;
    titleEn?: string;
    seoTitleBg?: string;
    seoTitleEn?: string;
    seoDescriptionBg?: string;
    seoDescriptionEn?: string;
    robots?: string;
    showInNav?: boolean;
    campaignKey?: string;
    sections?: { type: LandingSectionType; payload: unknown }[];
  },
): Promise<AdminLandingDetail> {
  const { data } = await apiClient.patch<{ data: AdminLandingDetail }>(
    `/v1/admin/landings/${id}`,
    body,
  );
  return data.data;
}

export async function publishAdminLanding(id: string): Promise<void> {
  await apiClient.post(`/v1/admin/landings/${id}/publish`);
}

export async function archiveAdminLanding(id: string): Promise<void> {
  await apiClient.post(`/v1/admin/landings/${id}/archive`);
}

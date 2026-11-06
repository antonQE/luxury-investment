import { apiClient } from '@/api/clients';

export interface SiteSettings {
  publicPhone: string | null;
  publicEmail: string | null;
}

export const siteSettingsKeys = {
  all: () => ['admin', 'site-settings'] as const,
};

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data } = await apiClient.get<{ data: SiteSettings }>('/v1/admin/site-settings');
  return data.data;
}

export async function updateSiteSettings(body: {
  publicPhone?: string | null;
  publicEmail?: string | null;
}): Promise<SiteSettings> {
  const { data } = await apiClient.patch<{ data: SiteSettings }>('/v1/admin/site-settings', body);
  return data.data;
}

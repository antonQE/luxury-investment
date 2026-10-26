import { apiClient } from '@/api/clients';

export interface AdminPartner {
  id: string;
  slug: string;
  name: { bg: string; en: string };
  logoUrl: string;
  websiteUrl: string | null;
  sortOrder: number;
}

interface ListEnvelope {
  data: AdminPartner[];
}

export const partnerKeys = {
  list: () => ['admin', 'partners'] as const,
};

export async function fetchAdminPartners(): Promise<AdminPartner[]> {
  const { data } = await apiClient.get<ListEnvelope>('/v1/admin/partners');
  return data.data;
}

export async function createAdminPartner(body: {
  slug: string;
  nameBg: string;
  nameEn: string;
  logoUrl: string;
  websiteUrl?: string | null;
}): Promise<{ id: string; slug: string }> {
  const { data } = await apiClient.post<{ data: { id: string; slug: string } }>(
    '/v1/admin/partners',
    body,
  );
  return data.data;
}

export async function archiveAdminPartner(id: string): Promise<void> {
  await apiClient.post(`/v1/admin/partners/${id}/archive`);
}

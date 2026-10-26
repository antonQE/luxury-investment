import { apiClient } from '@/api/clients';

export interface AdminOffice {
  id: string;
  slug: string;
  name: { bg: string; en: string };
  mapQuery: string;
  phone: string | null;
  email: string | null;
  sortOrder: number;
}

interface ListEnvelope {
  data: AdminOffice[];
}

export const officeKeys = {
  list: () => ['admin', 'offices'] as const,
};

export async function fetchAdminOffices(): Promise<AdminOffice[]> {
  const { data } = await apiClient.get<ListEnvelope>('/v1/admin/offices');
  return data.data;
}

export async function createAdminOffice(body: {
  slug: string;
  nameBg: string;
  nameEn: string;
  addressBg: string;
  addressEn: string;
  mapQuery: string;
  phone?: string | null;
  email?: string | null;
}): Promise<{ id: string; slug: string }> {
  const { data } = await apiClient.post<{ data: { id: string; slug: string } }>(
    '/v1/admin/offices',
    body,
  );
  return data.data;
}

export async function archiveAdminOffice(id: string): Promise<void> {
  await apiClient.post(`/v1/admin/offices/${id}/archive`);
}

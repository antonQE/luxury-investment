import { apiClient } from '@/api/clients';

export interface AdminTeamMember {
  id: string;
  slug: string;
  kind: string;
  name: { bg: string; en: string };
  email: string | null;
  phone: string | null;
  isPublic: boolean;
  sortOrder: number;
}

interface ListEnvelope {
  data: AdminTeamMember[];
}

export const teamKeys = {
  list: () => ['admin', 'team'] as const,
};

export async function fetchAdminTeam(): Promise<AdminTeamMember[]> {
  const { data } = await apiClient.get<ListEnvelope>('/v1/admin/team');
  return data.data;
}

export async function createAdminTeamMember(body: {
  slug: string;
  kind: string;
  nameBg: string;
  nameEn: string;
  roleBg: string;
  roleEn: string;
}): Promise<{ id: string; slug: string }> {
  const { data } = await apiClient.post<{ data: { id: string; slug: string } }>(
    '/v1/admin/team',
    body,
  );
  return data.data;
}

export async function archiveAdminTeamMember(id: string): Promise<void> {
  await apiClient.post(`/v1/admin/team/${id}/archive`);
}

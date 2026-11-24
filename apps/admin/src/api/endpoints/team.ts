import { apiClient } from '@/api/clients';
import { env } from '@/config/env';

export interface AdminTeamMember {
  id: string;
  slug: string;
  kind: string;
  name: { bg: string; en: string };
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  isPublic: boolean;
  sortOrder: number;
}

export interface AdminTeamMemberDetail {
  id: string;
  slug: string;
  kind: string;
  nameBg: string;
  nameEn: string;
  roleBg: string;
  roleEn: string;
  bioBg: string;
  bioEn: string;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  markets: string[];
  languages: string[];
  qualifications: string | null;
  sortOrder: number;
  isPublic: boolean;
}

export interface AdminTeamMemberWrite {
  slug: string;
  kind: string;
  nameBg: string;
  nameEn: string;
  roleBg: string;
  roleEn: string;
  bioBg?: string;
  bioEn?: string;
  email?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
  markets?: string[];
  languages?: string[];
  qualifications?: string | null;
  sortOrder?: number;
  isPublic?: boolean;
}

interface ListEnvelope {
  data: AdminTeamMember[];
}

interface DetailEnvelope {
  data: AdminTeamMemberDetail;
}

export const teamKeys = {
  list: () => ['admin', 'team'] as const,
  detail: (id: string) => ['admin', 'team', id] as const,
};

export async function fetchAdminTeam(): Promise<AdminTeamMember[]> {
  const { data } = await apiClient.get<ListEnvelope>('/v1/admin/team');
  return data.data;
}

export async function fetchAdminTeamMember(id: string): Promise<AdminTeamMemberDetail> {
  const { data } = await apiClient.get<DetailEnvelope>(`/v1/admin/team/${id}`);
  return data.data;
}

export async function createAdminTeamMember(
  body: AdminTeamMemberWrite,
): Promise<{ id: string; slug: string }> {
  const { data } = await apiClient.post<{ data: { id: string; slug: string } }>(
    '/v1/admin/team',
    body,
  );
  return data.data;
}

export async function updateAdminTeamMember(
  id: string,
  body: AdminTeamMemberWrite,
): Promise<AdminTeamMemberDetail> {
  const { data } = await apiClient.patch<DetailEnvelope>(`/v1/admin/team/${id}`, body);
  return data.data;
}

export async function uploadAdminTeamPhoto(id: string, file: File): Promise<AdminTeamMemberDetail> {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch(`${env().apiUrl}/v1/admin/team/${id}/photo`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(`Upload failed (${String(response.status)})`);
  }
  const body = (await response.json()) as DetailEnvelope;
  return body.data;
}

export async function archiveAdminTeamMember(id: string): Promise<void> {
  await apiClient.post(`/v1/admin/team/${id}/archive`);
}

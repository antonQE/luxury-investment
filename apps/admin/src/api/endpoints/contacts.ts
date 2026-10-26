import type { ContactKind, ContactRole, PreferredContactChannel } from '@luxury-investment/shared';

import { apiClient } from '@/api/clients';

export interface AdminContact {
  id: string;
  kind: ContactKind;
  displayName: string;
  email: string | null;
  phone: string | null;
  preferredLocale: string;
  preferredChannel: PreferredContactChannel | null;
  notes: string;
  legalBasis: string | null;
  roles: ContactRole[];
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactDuplicateHint {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  roles: ContactRole[];
}

export interface ContactWriteBody {
  kind: ContactKind;
  displayName: string;
  email?: string | null;
  phone?: string | null;
  preferredLocale?: 'bg' | 'en';
  preferredChannel?: PreferredContactChannel | null;
  notes?: string;
  legalBasis?: string | null;
  roles?: ContactRole[];
}

export interface ContactWriteResult {
  contact: AdminContact;
  duplicateHints: ContactDuplicateHint[];
}

interface ListEnvelope {
  data: AdminContact[];
}

export const contactKeys = {
  list: (includeArchived = false) => ['admin', 'contacts', { includeArchived }] as const,
};

export async function fetchAdminContacts(includeArchived = false): Promise<AdminContact[]> {
  const { data } = await apiClient.get<ListEnvelope>('/v1/admin/contacts', {
    params: includeArchived ? { includeArchived: true } : undefined,
  });
  return data.data;
}

export async function fetchContactDuplicates(params: {
  email?: string;
  phone?: string;
  excludeId?: string;
}): Promise<ContactDuplicateHint[]> {
  const { data } = await apiClient.get<{ data: ContactDuplicateHint[] }>(
    '/v1/admin/contacts/duplicates',
    { params },
  );
  return data.data;
}

export async function createAdminContact(body: ContactWriteBody): Promise<ContactWriteResult> {
  const { data } = await apiClient.post<{
    data: AdminContact;
    duplicateHints: ContactDuplicateHint[];
  }>('/v1/admin/contacts', body);
  return { contact: data.data, duplicateHints: data.duplicateHints };
}

export async function updateAdminContact(
  id: string,
  body: Partial<ContactWriteBody>,
): Promise<ContactWriteResult> {
  const { data } = await apiClient.patch<{
    data: AdminContact;
    duplicateHints: ContactDuplicateHint[];
  }>(`/v1/admin/contacts/${id}`, body);
  return { contact: data.data, duplicateHints: data.duplicateHints };
}

export async function archiveAdminContact(id: string): Promise<AdminContact> {
  const { data } = await apiClient.post<{ data: AdminContact }>(`/v1/admin/contacts/${id}/archive`);
  return data.data;
}

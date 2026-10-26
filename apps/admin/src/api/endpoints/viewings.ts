import type { ViewingStatus } from '@luxury-investment/shared';

import { apiClient } from '@/api/clients';

export interface AdminViewing {
  id: string;
  propertyId: string;
  contactId: string;
  agentId: string;
  inquiryId: string | null;
  scheduledAt: string;
  endsAt: string | null;
  locationNote: string;
  accessInstructions: string;
  status: ViewingStatus;
  outcomeNote: string;
  nextActionNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface ViewingWriteBody {
  propertyId: string;
  contactId: string;
  agentId: string;
  inquiryId?: string | null;
  scheduledAt: string;
  endsAt?: string | null;
  locationNote?: string;
  accessInstructions?: string;
  status?: ViewingStatus;
  outcomeNote?: string;
  nextActionNote?: string;
}

export interface ListViewingsParams {
  from?: string;
  to?: string;
  propertyId?: string;
  agentId?: string;
  status?: ViewingStatus;
}

interface ListEnvelope {
  data: AdminViewing[];
}

export const viewingKeys = {
  list: (params: ListViewingsParams = {}) => ['admin', 'viewings', params] as const,
};

export async function fetchAdminViewings(params: ListViewingsParams = {}): Promise<AdminViewing[]> {
  const { data } = await apiClient.get<ListEnvelope>('/v1/admin/viewings', { params });
  return data.data;
}

export async function createAdminViewing(body: ViewingWriteBody): Promise<AdminViewing> {
  const { data } = await apiClient.post<{ data: AdminViewing }>('/v1/admin/viewings', body);
  return data.data;
}

export async function updateAdminViewing(
  id: string,
  body: Partial<ViewingWriteBody>,
): Promise<AdminViewing> {
  const { data } = await apiClient.patch<{ data: AdminViewing }>(`/v1/admin/viewings/${id}`, body);
  return data.data;
}

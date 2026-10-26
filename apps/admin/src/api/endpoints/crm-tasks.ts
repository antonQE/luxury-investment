import type { CrmTaskKind, CrmTaskStatus } from '@luxury-investment/shared';

import { apiClient } from '@/api/clients';

export interface AdminCrmTask {
  id: string;
  title: string;
  notes: string;
  kind: CrmTaskKind;
  status: CrmTaskStatus;
  assigneeId: string;
  dueAt: string;
  relatedInquiryId: string | null;
  relatedViewingId: string | null;
  relatedPropertyId: string | null;
  relatedContactId: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrmTaskWriteBody {
  title: string;
  notes?: string;
  kind?: CrmTaskKind;
  assigneeId: string;
  dueAt: string;
  relatedInquiryId?: string | null;
  relatedViewingId?: string | null;
  relatedPropertyId?: string | null;
  relatedContactId?: string | null;
}

interface ListEnvelope {
  data: AdminCrmTask[];
}

export const crmTaskKeys = {
  list: (status?: CrmTaskStatus) => ['admin', 'crm-tasks', { status }] as const,
};

export async function fetchAdminCrmTasks(status?: CrmTaskStatus): Promise<AdminCrmTask[]> {
  const { data } = await apiClient.get<ListEnvelope>('/v1/admin/crm-tasks', {
    params: status !== undefined ? { status } : undefined,
  });
  return data.data;
}

export async function createAdminCrmTask(body: CrmTaskWriteBody): Promise<AdminCrmTask> {
  const { data } = await apiClient.post<{ data: AdminCrmTask }>('/v1/admin/crm-tasks', body);
  return data.data;
}

export async function completeAdminCrmTask(id: string): Promise<AdminCrmTask> {
  const { data } = await apiClient.post<{ data: AdminCrmTask }>(
    `/v1/admin/crm-tasks/${id}/complete`,
  );
  return data.data;
}

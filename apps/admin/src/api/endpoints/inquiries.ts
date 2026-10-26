import type { InquiryStatus } from '@luxury-investment/shared';

import { apiClient } from '@/api/clients';

export interface AdminInquiry {
  id: string;
  type: string;
  propertySlug: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
}

interface ListEnvelope {
  data: AdminInquiry[];
}

export const inquiryKeys = {
  list: () => ['admin', 'inquiries'] as const,
};

export async function fetchAdminInquiries(): Promise<AdminInquiry[]> {
  const { data } = await apiClient.get<ListEnvelope>('/v1/admin/inquiries');
  return data.data;
}

export async function updateAdminInquiryStatus(
  id: string,
  status: InquiryStatus,
): Promise<AdminInquiry> {
  const { data } = await apiClient.patch<{ data: AdminInquiry }>(`/v1/admin/inquiries/${id}`, {
    status,
  });
  return data.data;
}

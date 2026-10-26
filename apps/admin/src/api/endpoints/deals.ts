import type { DealStage } from '@luxury-investment/shared';

import { apiClient } from '@/api/clients';

export interface AdminDeal {
  id: string;
  propertyId: string;
  buyerContactId: string;
  sellerContactId: string | null;
  offerId: string | null;
  stage: DealStage;
  agreedPrice: string | null;
  currency: string;
  commissionAmount: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealWriteBody {
  propertyId: string;
  buyerContactId: string;
  sellerContactId?: string | null;
  offerId?: string | null;
  stage?: DealStage;
  agreedPrice?: string | null;
  currency?: string;
  commissionAmount?: string | null;
  notes?: string;
}

interface ListEnvelope {
  data: AdminDeal[];
}

export const dealKeys = {
  list: () => ['admin', 'deals'] as const,
};

export async function fetchAdminDeals(): Promise<AdminDeal[]> {
  const { data } = await apiClient.get<ListEnvelope>('/v1/admin/deals');
  return data.data;
}

export async function createAdminDeal(body: DealWriteBody): Promise<AdminDeal> {
  const { data } = await apiClient.post<{ data: AdminDeal }>('/v1/admin/deals', body);
  return data.data;
}

export async function updateAdminDeal(
  id: string,
  body: Partial<Omit<DealWriteBody, 'propertyId'>>,
): Promise<AdminDeal> {
  const { data } = await apiClient.patch<{ data: AdminDeal }>(`/v1/admin/deals/${id}`, body);
  return data.data;
}

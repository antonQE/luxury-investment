import type { OfferStatus, OfferType } from '@luxury-investment/shared';

import { apiClient } from '@/api/clients';

export interface AdminOffer {
  id: string;
  propertyId: string;
  contactId: string;
  type: OfferType;
  amount: string;
  currency: string;
  validUntil: string | null;
  terms: string;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OfferWriteBody {
  propertyId: string;
  contactId: string;
  type: OfferType;
  amount: string;
  currency?: string;
  validUntil?: string | null;
  terms?: string;
  status?: OfferStatus;
}

interface ListEnvelope {
  data: AdminOffer[];
}

export const offerKeys = {
  list: () => ['admin', 'offers'] as const,
};

export async function fetchAdminOffers(): Promise<AdminOffer[]> {
  const { data } = await apiClient.get<ListEnvelope>('/v1/admin/offers');
  return data.data;
}

export async function createAdminOffer(body: OfferWriteBody): Promise<AdminOffer> {
  const { data } = await apiClient.post<{ data: AdminOffer }>('/v1/admin/offers', body);
  return data.data;
}

export async function updateAdminOffer(
  id: string,
  body: Partial<Pick<OfferWriteBody, 'status' | 'amount' | 'terms' | 'validUntil' | 'type'>>,
): Promise<AdminOffer> {
  const { data } = await apiClient.patch<{ data: AdminOffer }>(`/v1/admin/offers/${id}`, body);
  return data.data;
}

import { apiClient } from '@/api/clients';

export interface AdminProperty {
  id: string;
  referenceNumber: string;
  slug: string;
  titleBg: string;
  titleEn: string;
  excerptBg: string;
  excerptEn: string;
  descriptionBg: string;
  descriptionEn: string;
  transactionType: string;
  propertyType: string;
  market: string;
  country: string;
  city: string;
  district: string | null;
  price: string;
  currency: string;
  area: string;
  builtUpArea: string | null;
  areaWithCommonParts: string | null;
  primaryArea: string;
  primaryAreaLabelBg: string;
  primaryAreaLabelEn: string;
  constructionStage: string | null;
  badges: string[];
  imageUrls: string[];
  agentName: string;
  agentPhone: string;
  responsibleAgentUserId: string | null;
  listingStatus: string;
  publishedAt: string | null;
  updatedAt: string;
}

export interface PropertyWriteBody {
  titleBg: string;
  titleEn: string;
  excerptBg: string;
  excerptEn: string;
  descriptionBg: string;
  descriptionEn: string;
  transactionType: string;
  propertyType: string;
  market: string;
  country: string;
  city: string;
  district?: string | null;
  price: string;
  currency: string;
  area: string;
  builtUpArea?: string | null;
  primaryArea?: string;
  primaryAreaLabelBg: string;
  primaryAreaLabelEn: string;
  imageUrls: string[];
  agentName: string;
  agentPhone: string;
  responsibleAgentUserId?: string | null;
  slug?: string;
}

interface ListEnvelope {
  data: AdminProperty[];
  total: number;
}

interface ItemEnvelope {
  data: AdminProperty;
}

export const propertyKeys = {
  list: () => ['admin', 'properties'] as const,
  detail: (id: string) => ['admin', 'properties', id] as const,
};

export async function fetchAdminProperties(): Promise<AdminProperty[]> {
  const { data } = await apiClient.get<ListEnvelope>('/v1/admin/properties?limit=100');
  return data.data;
}

export async function fetchAdminProperty(id: string): Promise<AdminProperty> {
  const { data } = await apiClient.get<ItemEnvelope>(`/v1/admin/properties/${id}`);
  return data.data;
}

export async function createAdminProperty(body: PropertyWriteBody): Promise<AdminProperty> {
  const { data } = await apiClient.post<ItemEnvelope>('/v1/admin/properties', body);
  return data.data;
}

export async function updateAdminProperty(
  id: string,
  body: Partial<PropertyWriteBody>,
): Promise<AdminProperty> {
  const { data } = await apiClient.patch<ItemEnvelope>(`/v1/admin/properties/${id}`, body);
  return data.data;
}

export async function publishAdminProperty(id: string): Promise<AdminProperty> {
  const { data } = await apiClient.post<ItemEnvelope>(`/v1/admin/properties/${id}/publish`);
  return data.data;
}

export async function archiveAdminProperty(id: string): Promise<AdminProperty> {
  const { data } = await apiClient.post<ItemEnvelope>(`/v1/admin/properties/${id}/archive`);
  return data.data;
}

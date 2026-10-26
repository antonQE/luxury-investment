import { apiClient } from '@/api/clients';
import { env } from '@/config/env';

export interface AdminMediaAsset {
  id: string;
  propertyId: string;
  visibility: string;
  sortOrder: number;
  isPrimary: boolean;
  altBg: string;
  altEn: string;
  urls: {
    original: string;
    web: string;
    thumb: string;
    social: string;
  };
  archivedAt: string | null;
}

interface ListEnvelope {
  data: AdminMediaAsset[];
}

interface ItemEnvelope {
  data: AdminMediaAsset;
}

export const mediaKeys = {
  forProperty: (propertyId: string) => ['admin', 'media', propertyId] as const,
};

export async function fetchPropertyMedia(propertyId: string): Promise<AdminMediaAsset[]> {
  const { data } = await apiClient.get<ListEnvelope>(`/v1/admin/properties/${propertyId}/media`);
  return data.data;
}

export async function uploadPropertyMedia(
  propertyId: string,
  file: File,
  fields?: { altBg?: string; altEn?: string },
): Promise<AdminMediaAsset> {
  const form = new FormData();
  form.append('file', file);
  if (fields?.altBg !== undefined) form.append('altBg', fields.altBg);
  if (fields?.altEn !== undefined) form.append('altEn', fields.altEn);

  const response = await fetch(`${env().apiUrl}/v1/admin/properties/${propertyId}/media`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  });
  if (!response.ok) {
    const message = `Upload failed (${String(response.status)})`;
    throw new Error(message);
  }
  const body = (await response.json()) as ItemEnvelope;
  return body.data;
}

export async function updatePropertyMedia(
  propertyId: string,
  assetId: string,
  patch: Partial<Pick<AdminMediaAsset, 'altBg' | 'altEn' | 'isPrimary' | 'visibility'>>,
): Promise<AdminMediaAsset> {
  const { data } = await apiClient.patch<ItemEnvelope>(
    `/v1/admin/properties/${propertyId}/media/${assetId}`,
    patch,
  );
  return data.data;
}

export async function archiveMedia(assetId: string): Promise<AdminMediaAsset> {
  const { data } = await apiClient.post<ItemEnvelope>(`/v1/admin/media/${assetId}/archive`);
  return data.data;
}

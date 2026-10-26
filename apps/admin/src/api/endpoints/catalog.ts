import { apiClient } from '@/api/clients';

export interface LocalizedName {
  bg: string;
  en: string;
}

export interface AdminLocation {
  id: string;
  kind: string;
  slug: string;
  parentId: string | null;
  code: string | null;
  sortOrder: number;
  archivedAt: string | null;
  name: LocalizedName;
}

export interface AdminTaxonomy {
  id: string;
  key: string;
  sortOrder: number;
  archivedAt: string | null;
  name: LocalizedName;
}

interface ListEnvelope<T> {
  data: T[];
}

interface ItemEnvelope<T> {
  data: T;
}

export const catalogKeys = {
  locations: (includeArchived: boolean) => ['catalog', 'locations', includeArchived] as const,
  taxonomy: (kind: string, includeArchived: boolean) =>
    ['catalog', 'taxonomy', kind, includeArchived] as const,
};

export async function fetchLocations(includeArchived = false): Promise<AdminLocation[]> {
  const { data } = await apiClient.get<ListEnvelope<AdminLocation>>(
    `/v1/admin/locations${includeArchived ? '?includeArchived=true' : ''}`,
  );
  return data.data;
}

export async function createLocation(body: {
  kind: string;
  slug: string;
  parentId?: string | null;
  code?: string | null;
  sortOrder?: number;
  name: LocalizedName;
}): Promise<AdminLocation> {
  const { data } = await apiClient.post<ItemEnvelope<AdminLocation>>('/v1/admin/locations', body);
  return data.data;
}

export async function archiveLocation(id: string): Promise<AdminLocation> {
  const { data } = await apiClient.post<ItemEnvelope<AdminLocation>>(
    `/v1/admin/locations/${id}/archive`,
  );
  return data.data;
}

export async function fetchTaxonomy(
  kind: string,
  includeArchived = false,
): Promise<AdminTaxonomy[]> {
  const { data } = await apiClient.get<ListEnvelope<AdminTaxonomy>>(
    `/v1/admin/taxonomies/${kind}${includeArchived ? '?includeArchived=true' : ''}`,
  );
  return data.data;
}

export async function createTaxonomy(
  kind: string,
  body: { key: string; sortOrder?: number; name: LocalizedName },
): Promise<AdminTaxonomy> {
  const { data } = await apiClient.post<ItemEnvelope<AdminTaxonomy>>(
    `/v1/admin/taxonomies/${kind}`,
    body,
  );
  return data.data;
}

export async function archiveTaxonomy(kind: string, id: string): Promise<AdminTaxonomy> {
  const { data } = await apiClient.post<ItemEnvelope<AdminTaxonomy>>(
    `/v1/admin/taxonomies/${kind}/${id}/archive`,
  );
  return data.data;
}

import { env } from '@/config/env';

export interface AdminDocumentVersion {
  id: string;
  versionLabel: string;
  fileName: string;
  contentType: string;
  byteSize: number;
  publishedAt: string | null;
  createdAt: string;
  isCurrent: boolean;
  downloadCount: number;
}

export interface AdminDocumentListItem {
  id: string;
  slug: string;
  kind: string;
  accessLevel: string;
  locale: string;
  source: string;
  legalSample: boolean;
  responsibleEditor: string;
  currentVersionId: string | null;
  archivedAt: string | null;
  titleBg: string;
  titleEn: string;
  descriptionBg: string;
  descriptionEn: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDocumentDetail extends AdminDocumentListItem {
  downloadTotal: number;
  versions: AdminDocumentVersion[];
}

/** @deprecated Prefer AdminDocumentDetail */
export type AdminHandbook = AdminDocumentDetail;
export type AdminHandbookVersion = AdminDocumentVersion;

interface ListEnvelope {
  data: AdminDocumentListItem[];
}

interface DetailEnvelope {
  data: AdminDocumentDetail;
}

export const documentKeys = {
  handbook: () => ['admin', 'documents', 'seller-handbook'] as const,
  list: () => ['admin', 'documents', 'list'] as const,
  detail: (id: string) => ['admin', 'documents', id] as const,
};

export async function fetchDocuments(): Promise<AdminDocumentListItem[]> {
  const response = await fetch(`${env().apiUrl}/v1/admin/documents`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Failed to load documents (${String(response.status)})`);
  }
  const body = (await response.json()) as ListEnvelope;
  return body.data;
}

export async function fetchDocument(id: string): Promise<AdminDocumentDetail> {
  const response = await fetch(`${env().apiUrl}/v1/admin/documents/${id}`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Failed to load document (${String(response.status)})`);
  }
  const body = (await response.json()) as DetailEnvelope;
  return body.data;
}

export async function archiveDocument(id: string): Promise<void> {
  const response = await fetch(`${env().apiUrl}/v1/admin/documents/${id}/archive`, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Archive failed (${String(response.status)})`);
  }
}

export async function uploadDocumentVersion(
  id: string,
  file: File,
  fields: { versionLabel: string; publish: boolean },
): Promise<{ id: string }> {
  const form = new FormData();
  form.append('file', file);
  form.append('versionLabel', fields.versionLabel);
  form.append('publish', fields.publish ? 'true' : 'false');

  const response = await fetch(`${env().apiUrl}/v1/admin/documents/${id}/versions`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(`Upload failed (${String(response.status)})`);
  }
  const body = (await response.json()) as { data: { id: string } };
  return body.data;
}

export async function fetchSellerHandbook(): Promise<AdminDocumentDetail> {
  const response = await fetch(`${env().apiUrl}/v1/admin/documents/seller-handbook`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Failed to load handbook (${String(response.status)})`);
  }
  const body = (await response.json()) as DetailEnvelope;
  return body.data;
}

export async function uploadSellerHandbookVersion(
  file: File,
  fields: { versionLabel: string; publish: boolean },
): Promise<{ id: string }> {
  const form = new FormData();
  form.append('file', file);
  form.append('versionLabel', fields.versionLabel);
  form.append('publish', fields.publish ? 'true' : 'false');

  const response = await fetch(`${env().apiUrl}/v1/admin/documents/seller-handbook/versions`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(`Upload failed (${String(response.status)})`);
  }
  const body = (await response.json()) as { data: { id: string } };
  return body.data;
}

export async function publishSellerHandbookVersion(versionId: string): Promise<void> {
  const response = await fetch(
    `${env().apiUrl}/v1/admin/documents/seller-handbook/versions/${versionId}/publish`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    },
  );
  if (!response.ok) {
    throw new Error(`Publish failed (${String(response.status)})`);
  }
}

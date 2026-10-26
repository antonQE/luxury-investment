import { env } from '@/config/env';

export interface AdminHandbookVersion {
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

export interface AdminHandbook {
  id: string;
  slug: string;
  kind: string;
  currentVersionId: string | null;
  downloadTotal: number;
  versions: AdminHandbookVersion[];
}

interface Envelope {
  data: AdminHandbook;
}

export const documentKeys = {
  handbook: () => ['admin', 'documents', 'seller-handbook'] as const,
};

export async function fetchSellerHandbook(): Promise<AdminHandbook> {
  const response = await fetch(`${env().apiUrl}/v1/admin/documents/seller-handbook`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Failed to load handbook (${String(response.status)})`);
  }
  const body = (await response.json()) as Envelope;
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

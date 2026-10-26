import type { Locale } from '@luxury-investment/shared';

import { apiGet } from '@/lib/api/client';
import { serverEnv } from '@/lib/config/env';

export interface PublicDocumentListItem {
  id: string;
  slug: string;
  kind: string;
  locale: string;
  legalSample: boolean;
  title: string;
  description: string;
  fileName: string | null;
  publishedAt: string | null;
}

export async function fetchPublicDocuments(locale: Locale): Promise<PublicDocumentListItem[]> {
  const body = await apiGet<{ data: PublicDocumentListItem[] }>(
    `/v1/public/documents?lang=${locale}`,
    { revalidate: 60, tags: ['documents'] },
  );
  return body.data;
}

export function documentDownloadUrl(slug: string, source = 'document-library'): string {
  return `${serverEnv().API_URL}/v1/public/documents/${encodeURIComponent(slug)}?source=${encodeURIComponent(source)}`;
}

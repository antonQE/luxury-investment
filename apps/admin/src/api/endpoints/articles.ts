import { apiClient } from '@/api/clients';

export interface AdminArticle {
  id: string;
  slug: string;
  status: string;
  title: { bg: string; en: string };
  coverUrl: string | null;
  authorName: string | null;
  publishedAt: string | null;
  sortOrder: number;
}

interface ListEnvelope {
  data: AdminArticle[];
}

export const articleKeys = {
  list: () => ['admin', 'articles'] as const,
};

export async function fetchAdminArticles(): Promise<AdminArticle[]> {
  const { data } = await apiClient.get<ListEnvelope>('/v1/admin/articles');
  return data.data;
}

export async function createAdminArticle(body: {
  slug: string;
  titleBg: string;
  titleEn: string;
  excerptBg: string;
  excerptEn: string;
  bodyBg: string;
  bodyEn: string;
}): Promise<{ id: string; slug: string }> {
  const { data } = await apiClient.post<{ data: { id: string; slug: string } }>(
    '/v1/admin/articles',
    body,
  );
  return data.data;
}

export async function publishAdminArticle(id: string): Promise<void> {
  await apiClient.post(`/v1/admin/articles/${id}/publish`);
}

export async function archiveAdminArticle(id: string): Promise<void> {
  await apiClient.post(`/v1/admin/articles/${id}/archive`);
}

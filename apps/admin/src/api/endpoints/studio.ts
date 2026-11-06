import type {
  BrochureElementToggles,
  ChannelCopyChannel,
  ChannelCopyLength,
} from '@luxury-investment/shared';

import { apiClient } from '@/api/clients';
import { env } from '@/config/env';

export interface StudioTemplate {
  id: string;
  key: string;
  kind: string;
  format: string;
  locale: string;
  nameBg: string;
  nameEn: string;
  defaultToggles: BrochureElementToggles;
  badgePreset: string;
}

export interface BrochureExportSummary {
  id: string;
  propertyId: string;
  templateId: string;
  format: string;
  toggles: BrochureElementToggles;
  listingUrl: string;
  fileName: string;
  byteSize: number;
  createdAt: string;
}

export interface GenerateBrochureResult {
  id: string;
  propertyId: string;
  fileName: string;
  byteSize: number;
  listingUrl: string;
  downloadPath: string;
  createdAt: string;
}

export interface ChannelCopySnippet {
  channel: ChannelCopyChannel;
  locale: 'bg' | 'en';
  length: ChannelCopyLength;
  text: string;
}

export interface ChannelCopyResult {
  propertyId: string;
  listingUrl: string;
  requiresHumanConfirmation: boolean;
  snippets: ChannelCopySnippet[];
}

export const studioKeys = {
  templates: () => ['admin', 'studio', 'templates'] as const,
  exports: (propertyId: string) => ['admin', 'studio', 'exports', propertyId] as const,
  channelCopy: (propertyId: string) => ['admin', 'studio', 'channel-copy', propertyId] as const,
};

export async function fetchStudioTemplates(): Promise<StudioTemplate[]> {
  const { data } = await apiClient.get<{ data: StudioTemplate[] }>('/v1/admin/studio/templates');
  return data.data;
}

export async function fetchBrochureExports(propertyId: string): Promise<BrochureExportSummary[]> {
  const { data } = await apiClient.get<{ data: BrochureExportSummary[] }>(
    `/v1/admin/studio/brochures/exports?propertyId=${encodeURIComponent(propertyId)}`,
  );
  return data.data;
}

export async function generateBrochure(body: {
  propertyId: string;
  templateKey?: string;
  toggles?: Partial<BrochureElementToggles>;
}): Promise<GenerateBrochureResult> {
  const { data } = await apiClient.post<{ data: GenerateBrochureResult }>(
    '/v1/admin/studio/brochures/generate',
    body,
  );
  return data.data;
}

export async function generateSocialAsset(body: {
  propertyId: string;
  templateKey?: string;
  toggles?: Partial<BrochureElementToggles>;
  badgePreset?: string;
}): Promise<GenerateBrochureResult & { format: string }> {
  const { data } = await apiClient.post<{ data: GenerateBrochureResult & { format: string } }>(
    '/v1/admin/studio/social/generate',
    body,
  );
  return data.data;
}

export async function fetchChannelCopy(propertyId: string): Promise<ChannelCopyResult> {
  const { data } = await apiClient.get<{ data: ChannelCopyResult }>(
    `/v1/admin/studio/channel-copy?propertyId=${encodeURIComponent(propertyId)}`,
  );
  return data.data;
}

/** Authenticated PDF download (cookie session). */
export async function downloadBrochureExport(exportId: string, fileName: string): Promise<void> {
  const response = await fetch(
    `${env().apiUrl}/v1/admin/studio/brochures/exports/${exportId}/download`,
    { credentials: 'include' },
  );
  if (!response.ok) {
    throw new Error(`Download failed (${String(response.status)})`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

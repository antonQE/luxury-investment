import 'server-only';

import type {
  Locale,
  PublicOffice,
  PublicPartner,
  PublicTeamMember,
} from '@luxury-investment/shared';

import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from './cache';
import { apiGet } from './client';

function queryString(lang: Locale): string {
  return `?lang=${lang}`;
}

export async function fetchTeam(locale: Locale): Promise<PublicTeamMember[]> {
  const body = await apiGet<{ data: PublicTeamMember[] }>(`/v1/public/team${queryString(locale)}`, {
    revalidate: PUBLIC_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.team],
  });
  return body.data;
}

export async function fetchTeamMember(locale: Locale, slug: string): Promise<PublicTeamMember> {
  const body = await apiGet<{ data: PublicTeamMember }>(
    `/v1/public/team/${encodeURIComponent(slug)}${queryString(locale)}`,
    { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [CACHE_TAGS.team] },
  );
  return body.data;
}

export async function fetchOffices(locale: Locale): Promise<PublicOffice[]> {
  const body = await apiGet<{ data: PublicOffice[] }>(`/v1/public/offices${queryString(locale)}`, {
    revalidate: PUBLIC_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.team],
  });
  return body.data;
}

export async function fetchPartners(locale: Locale): Promise<PublicPartner[]> {
  const body = await apiGet<{ data: PublicPartner[] }>(
    `/v1/public/partners${queryString(locale)}`,
    { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [CACHE_TAGS.team] },
  );
  return body.data;
}

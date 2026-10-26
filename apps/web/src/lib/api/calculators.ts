import type { AcquisitionEstimate, DepositEstimate, Locale } from '@luxury-investment/shared';

import { apiGet } from '@/lib/api/client';

export async function fetchAcquisitionEstimate(
  locale: Locale,
  slug: string,
  price?: number,
): Promise<AcquisitionEstimate> {
  const params = new URLSearchParams({ lang: locale });
  if (price !== undefined) params.set('price', String(price));
  const body = await apiGet<{ data: AcquisitionEstimate }>(
    `/v1/public/properties/${encodeURIComponent(slug)}/acquisition-estimate?${params.toString()}`,
  );
  return body.data;
}

export async function fetchDepositEstimate(
  locale: Locale,
  slug: string,
  price?: number,
): Promise<DepositEstimate> {
  const params = new URLSearchParams({ lang: locale });
  if (price !== undefined) params.set('price', String(price));
  const body = await apiGet<{ data: DepositEstimate }>(
    `/v1/public/properties/${encodeURIComponent(slug)}/deposit-estimate?${params.toString()}`,
  );
  return body.data;
}

import 'server-only';

import { serverEnv } from '../config/env';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

export interface ApiRequestOptions {
  /** Seconds to cache the response in the Next.js data cache; `false` disables caching. */
  revalidate?: number | false;
  tags?: string[];
}

export async function apiGet<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const url = new URL(path, serverEnv().API_URL);
  // In Next.js `revalidate: false` means "cache forever", so no-cache requests use `no-store`.
  const caching: RequestInit =
    options.revalidate === false
      ? { cache: 'no-store' }
      : { next: { revalidate: options.revalidate ?? 60, tags: options.tags ?? [] } };
  const response = await fetch(url, { headers: { accept: 'application/json' }, ...caching });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new ApiError(
      response.status,
      body.error?.code ?? 'UNKNOWN',
      body.error?.message ?? `API request failed with ${String(response.status)}`,
    );
  }

  return (await response.json()) as T;
}

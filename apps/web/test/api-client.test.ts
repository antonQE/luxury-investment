import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('../src/lib/config/env', () => ({
  serverEnv: () => ({ API_URL: 'http://localhost:4000' }),
}));

describe('apiGet', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('wraps network failures as ApiError 503 UNAVAILABLE', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    const { apiGet } = await import('../src/lib/api/client');
    await expect(apiGet('/v1/public/pages/x')).rejects.toMatchObject({
      name: 'ApiError',
      status: 503,
      code: 'UNAVAILABLE',
    });
  });
});

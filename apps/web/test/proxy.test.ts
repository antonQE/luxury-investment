import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import proxy from '../src/proxy';

function run(path: string, headers: Record<string, string> = {}) {
  return proxy(new NextRequest(new URL(path, 'http://localhost:3000'), { headers }));
}

function isRedirect(response: Response) {
  return response.status >= 300 && response.status < 400;
}

describe('locale routing (proxy.ts)', () => {
  it('serves Bulgarian on unprefixed paths without redirecting', () => {
    for (const path of ['/', '/obiavi/some-property/']) {
      const response = run(path);
      expect(isRedirect(response), path).toBe(false);
      expect(response.headers.get('x-middleware-rewrite'), path).toContain('/bg');
    }
  });

  it('serves English under /en/ including nested paths', () => {
    for (const path of ['/en/', '/en/obiavi/some-property/']) {
      const response = run(path);
      expect(isRedirect(response), path).toBe(false);
    }
  });

  it('never redirects "/" based on Accept-Language or a locale cookie', () => {
    const response = run('/', { 'accept-language': 'en-US,en;q=0.9', cookie: 'NEXT_LOCALE=en' });
    expect(isRedirect(response)).toBe(false);
  });

  it('redirects the superfluous /bg/ prefix to the unprefixed URL', () => {
    const response = run('/bg/za-nas/');
    expect(isRedirect(response)).toBe(true);
    // The trailing slash comes from `trailingSlash` in next.config.ts (applied by the next-intl
    // plugin at build time), so it is checked against the running app rather than here.
    expect(new URL(response.headers.get('location') ?? '').pathname).toMatch(/^\/za-nas\/?$/);
  });
});

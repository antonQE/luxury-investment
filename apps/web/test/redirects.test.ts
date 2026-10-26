import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { lookupRedirect } from '../src/lib/seo/redirects';
import proxy from '../src/proxy';

function run(path: string) {
  return proxy(new NextRequest(new URL(path, 'http://localhost:3000')));
}

describe('lookupRedirect', () => {
  it('maps oferti aliases to obiavi', () => {
    expect(lookupRedirect('/oferti/')).toBe('/obiavi/');
    expect(lookupRedirect('/en/oferti/')).toBe('/en/obiavi/');
  });

  it('maps agent and novini section aliases', () => {
    expect(lookupRedirect('/agent/')).toBe('/ekip/');
    expect(lookupRedirect('/novini/')).toBe('/stati/');
    expect(lookupRedirect('/en/novini/')).toBe('/en/stati/');
  });

  it('returns null for unknown paths', () => {
    expect(lookupRedirect('/obiavi/')).toBeNull();
  });
});

describe('proxy redirects', () => {
  it('answers sample legacy paths with HTTP 301', () => {
    const response = run('/oferti/');
    expect(response.status).toBe(301);
    expect(new URL(response.headers.get('location') ?? '').pathname).toBe('/obiavi/');
  });

  it('falls through when there is no redirect', () => {
    const response = run('/obiavi/');
    expect(response.status).not.toBe(301);
  });
});

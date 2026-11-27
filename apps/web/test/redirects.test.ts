import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { lookupRedirect } from '../src/lib/seo/redirects';
import proxy from '../src/proxy';

function run(path: string) {
  return proxy(new NextRequest(new URL(path, 'http://localhost:3000')));
}

describe('lookupRedirect', () => {
  it('maps oferti aliases to properties', () => {
    expect(lookupRedirect('/oferti/')).toBe('/properties/');
    expect(lookupRedirect('/en/oferti/')).toBe('/en/properties/');
  });

  it('maps agent and novini section aliases', () => {
    expect(lookupRedirect('/agent/')).toBe('/team/');
    expect(lookupRedirect('/novini/')).toBe('/articles/');
    expect(lookupRedirect('/en/novini/')).toBe('/en/articles/');
  });

  it('returns null for unknown paths', () => {
    expect(lookupRedirect('/properties/')).toBeNull();
  });
});

describe('proxy redirects', () => {
  it('answers sample legacy paths with HTTP 301', () => {
    const response = run('/oferti/');
    expect(response.status).toBe(301);
    expect(new URL(response.headers.get('location') ?? '').pathname).toBe('/properties/');
  });

  it('falls through when there is no redirect', () => {
    const response = run('/properties/');
    expect(response.status).not.toBe(301);
  });
});

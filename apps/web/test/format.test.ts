import { describe, expect, it } from 'vitest';

import { formatPricePerSqm } from '../src/lib/format';

describe('formatPricePerSqm', () => {
  it('returns null when area is zero', () => {
    expect(formatPricePerSqm('bg', { price: 100_000, currency: 'EUR', area: 0 })).toBeNull();
  });

  it('formats price divided by area', () => {
    const value = formatPricePerSqm('en', { price: 250_000, currency: 'EUR', area: 100 });
    expect(value).toMatch(/2[,.]?500/);
  });
});

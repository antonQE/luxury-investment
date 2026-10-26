import { describe, expect, it } from 'vitest';

import { convertPrice } from './convert-price.ts';

const rates = [
  {
    baseCurrency: 'EUR',
    quoteCurrency: 'BGN',
    rate: 1.95583,
    asOf: '2026-01-01',
    source: 'demo',
  },
  {
    baseCurrency: 'USD',
    quoteCurrency: 'EUR',
    rate: 0.92,
    asOf: '2026-01-01',
    source: 'demo',
  },
];

describe('convertPrice', () => {
  it('converts EUR to BGN with a direct rate', () => {
    const result = convertPrice(200_000, 'EUR', 'BGN', rates);
    expect(result).toEqual({
      amount: 391_166,
      currency: 'BGN',
      asOf: '2026-01-01',
      source: 'demo',
      rate: 1.95583,
    });
  });

  it('converts via inverse rate when only reverse pair exists', () => {
    const result = convertPrice(1000, 'BGN', 'EUR', rates);
    expect(result?.currency).toBe('EUR');
    expect(result?.amount).toBe(511.29);
  });

  it('returns null when no rate exists', () => {
    expect(convertPrice(100, 'AED', 'EUR', rates)).toBeNull();
  });

  it('keeps original amount for same currency', () => {
    const result = convertPrice(50, 'EUR', 'EUR', rates);
    expect(result?.amount).toBe(50);
    expect(result?.rate).toBe(1);
  });
});

describe('matchesNormalizedPriceBounds', () => {
  it('compares USD listing against EUR bounds via rate without mutating original', async () => {
    const { matchesNormalizedPriceBounds } = await import('../../properties/repo/property-repo.ts');
    expect(
      matchesNormalizedPriceBounds(
        100_000,
        'USD',
        { priceMin: 80_000, priceMax: 100_000, priceCurrency: 'EUR' },
        rates,
      ),
    ).toBe(true); // 100_000 * 0.92 = 92_000 EUR
    expect(
      matchesNormalizedPriceBounds(
        100_000,
        'USD',
        { priceMin: 95_000, priceMax: 100_000, priceCurrency: 'EUR' },
        rates,
      ),
    ).toBe(false);
  });
});

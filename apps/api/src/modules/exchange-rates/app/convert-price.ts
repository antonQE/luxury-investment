export interface FxRateQuote {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  asOf: string;
  source: string;
}

export interface ConvertedPrice {
  amount: number;
  currency: string;
  asOf: string;
  source: string;
  rate: number;
}

/**
 * Convert `amount` from `fromCurrency` to `toCurrency` using a quote where
 * 1 base = rate quote. Supports direct pair or inverse when only the reverse exists.
 * Same-currency returns the original amount with a synthetic 1:1 quote.
 */
export function convertPrice(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: FxRateQuote[],
): ConvertedPrice | null {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  if (!Number.isFinite(amount)) return null;
  if (from === to) {
    return {
      amount: Math.round(amount * 100) / 100,
      currency: to,
      asOf: new Date().toISOString().slice(0, 10),
      source: 'identity',
      rate: 1,
    };
  }

  const direct = rates.find((row) => row.baseCurrency === from && row.quoteCurrency === to);
  if (direct !== undefined && Number.isFinite(direct.rate) && direct.rate > 0) {
    return {
      amount: Math.round(amount * direct.rate * 100) / 100,
      currency: to,
      asOf: direct.asOf,
      source: direct.source,
      rate: direct.rate,
    };
  }

  const inverse = rates.find((row) => row.baseCurrency === to && row.quoteCurrency === from);
  if (inverse !== undefined && Number.isFinite(inverse.rate) && inverse.rate > 0) {
    const rate = 1 / inverse.rate;
    return {
      amount: Math.round(amount * rate * 100) / 100,
      currency: to,
      asOf: inverse.asOf,
      source: inverse.source,
      rate,
    };
  }

  return null;
}

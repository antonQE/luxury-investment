import { z } from 'zod';

const currencyCode = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(z.string().regex(/^[A-Z]{3}$/, 'invalid currency'));

export const upsertExchangeRateSchema = z.object({
  baseCurrency: currencyCode,
  quoteCurrency: currencyCode,
  rate: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,8})?$/, 'invalid rate'),
  asOf: z.iso.date(),
  source: z.string().trim().max(500).optional().default(''),
});

export type UpsertExchangeRateInput = z.infer<typeof upsertExchangeRateSchema>;

export const listExchangeRatesQuerySchema = z
  .object({
    baseCurrency: currencyCode.optional(),
    quoteCurrency: currencyCode.optional(),
  })
  .transform((query) => ({
    baseCurrency: query.baseCurrency,
    quoteCurrency: query.quoteCurrency,
  }));

export type ListExchangeRatesQuery = z.infer<typeof listExchangeRatesQuerySchema>;

export const priceEquivalentSchema = z.object({
  amount: z.number(),
  currency: z.string(),
  asOf: z.string(),
  source: z.string(),
  rate: z.number(),
});

export type PriceEquivalent = z.infer<typeof priceEquivalentSchema>;

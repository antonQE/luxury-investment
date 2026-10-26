import { and, eq } from 'drizzle-orm';

import { exchangeRates } from '../schema.ts';
import type { SeedModule } from './index.ts';

/** Demo FX rows — not a live feed. EUR/BGN uses the fixed official parity for local display demos. */
const DEMO_SOURCE = 'Demo seed — reference rates for local/dev only';

const RATES = [
  {
    baseCurrency: 'EUR',
    quoteCurrency: 'BGN',
    rate: '1.95583',
    asOf: '2026-01-01',
    source: DEMO_SOURCE,
  },
  {
    baseCurrency: 'USD',
    quoteCurrency: 'EUR',
    rate: '0.92000000',
    asOf: '2026-01-01',
    source: DEMO_SOURCE,
  },
] as const;

export const exchangeRatesSeed: SeedModule = {
  name: 'exchange-rates',
  async run(db) {
    for (const row of RATES) {
      const [existing] = await db
        .select({ id: exchangeRates.id })
        .from(exchangeRates)
        .where(
          and(
            eq(exchangeRates.baseCurrency, row.baseCurrency),
            eq(exchangeRates.quoteCurrency, row.quoteCurrency),
            eq(exchangeRates.asOf, row.asOf),
          ),
        )
        .limit(1);

      if (existing === undefined) {
        await db.insert(exchangeRates).values(row);
      } else {
        await db
          .update(exchangeRates)
          .set({ rate: row.rate, source: row.source, updatedAt: new Date() })
          .where(eq(exchangeRates.id, existing.id));
      }
    }
  },
};

import { and, desc, eq } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import { exchangeRates } from '../../../infrastructure/db/schema.ts';

export type ExchangeRateRow = typeof exchangeRates.$inferSelect;

export class ExchangeRatesRepo {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async list(filters: {
    baseCurrency?: string;
    quoteCurrency?: string;
  }): Promise<ExchangeRateRow[]> {
    const clauses = [];
    if (filters.baseCurrency !== undefined) {
      clauses.push(eq(exchangeRates.baseCurrency, filters.baseCurrency));
    }
    if (filters.quoteCurrency !== undefined) {
      clauses.push(eq(exchangeRates.quoteCurrency, filters.quoteCurrency));
    }
    const where = clauses.length > 0 ? and(...clauses) : undefined;
    return this.#db
      .select()
      .from(exchangeRates)
      .where(where)
      .orderBy(desc(exchangeRates.asOf), exchangeRates.baseCurrency, exchangeRates.quoteCurrency);
  }

  /** Latest rate per pair (by asOf desc). */
  async listLatest(): Promise<ExchangeRateRow[]> {
    const rows = await this.#db
      .select()
      .from(exchangeRates)
      .orderBy(desc(exchangeRates.asOf), exchangeRates.baseCurrency, exchangeRates.quoteCurrency);
    const seen = new Set<string>();
    const latest: ExchangeRateRow[] = [];
    for (const row of rows) {
      const key = `${row.baseCurrency}/${row.quoteCurrency}`;
      if (seen.has(key)) continue;
      seen.add(key);
      latest.push(row);
    }
    return latest;
  }

  async upsert(input: {
    baseCurrency: string;
    quoteCurrency: string;
    rate: string;
    asOf: string;
    source: string;
  }): Promise<ExchangeRateRow> {
    const [existing] = await this.#db
      .select()
      .from(exchangeRates)
      .where(
        and(
          eq(exchangeRates.baseCurrency, input.baseCurrency),
          eq(exchangeRates.quoteCurrency, input.quoteCurrency),
          eq(exchangeRates.asOf, input.asOf),
        ),
      )
      .limit(1);

    if (existing !== undefined) {
      const [updated] = await this.#db
        .update(exchangeRates)
        .set({
          rate: input.rate,
          source: input.source,
          updatedAt: new Date(),
        })
        .where(eq(exchangeRates.id, existing.id))
        .returning();
      if (updated === undefined) throw new Error('exchange rate update failed');
      return updated;
    }

    const [inserted] = await this.#db
      .insert(exchangeRates)
      .values({
        baseCurrency: input.baseCurrency,
        quoteCurrency: input.quoteCurrency,
        rate: input.rate,
        asOf: input.asOf,
        source: input.source,
      })
      .returning();
    if (inserted === undefined) throw new Error('exchange rate insert failed');
    return inserted;
  }
}

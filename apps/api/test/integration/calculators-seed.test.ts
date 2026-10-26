import { and, eq, isNull } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import {
  calculatorRuleLines,
  calculatorRuleSets,
  calculatorToggles,
} from '../../src/infrastructure/db/schema.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();

beforeEach(async () => {
  await resetDatabase(connection);
  for (const module of SEED_MODULES) {
    await module.run(connection.db);
  }
});

afterAll(async () => {
  await connection.close();
});

describe('calculators seed (LI-069)', () => {
  it('seeds BG toggles and fictional rule lines for the 200k deposit scenario', async () => {
    const toggles = await connection.db
      .select()
      .from(calculatorToggles)
      .where(eq(calculatorToggles.countryCode, 'BG'));
    expect(toggles).toHaveLength(3);
    expect(toggles.every((row) => row.enabled)).toBe(true);

    const [depositSet] = await connection.db
      .select()
      .from(calculatorRuleSets)
      .where(
        and(
          eq(calculatorRuleSets.kind, 'deposit'),
          eq(calculatorRuleSets.countryCode, 'BG'),
          isNull(calculatorRuleSets.archivedAt),
        ),
      )
      .limit(1);
    expect(depositSet).toBeDefined();
    if (depositSet === undefined) throw new Error('expected deposit rule set');

    const lines = await connection.db
      .select()
      .from(calculatorRuleLines)
      .where(eq(calculatorRuleLines.ruleSetId, depositSet.id));
    const depositLine = lines.find((row) => row.costGroup === 'deposit_percent');
    expect(depositLine?.rateValue).toBe('10.000000');
    expect(depositLine?.lineType).toBe('percent_of_price');

    const acquisitionLines = await connection.db
      .select({ costGroup: calculatorRuleLines.costGroup })
      .from(calculatorRuleLines)
      .innerJoin(calculatorRuleSets, eq(calculatorRuleLines.ruleSetId, calculatorRuleSets.id))
      .where(
        and(eq(calculatorRuleSets.kind, 'acquisition'), eq(calculatorRuleSets.countryCode, 'BG')),
      );
    expect(acquisitionLines.map((row) => row.costGroup)).toEqual(
      expect.arrayContaining(['transfer_tax', 'notary', 'bank_appraisal']),
    );
  });
});

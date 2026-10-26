import { and, eq, isNull } from 'drizzle-orm';

import { calculatorRuleLines, calculatorRuleSets, calculatorToggles } from '../schema.ts';
import type { SeedModule } from './index.ts';

/**
 * Fictional demo rates only — not real Bulgarian (or other) tax law.
 * Used for the 200_000 € / 10% deposit acceptance scenario.
 */
const DEMO_SOURCE = 'Demo seed — fictional rates for local/dev only';

export const calculatorsSeed: SeedModule = {
  name: 'calculators',
  async run(db) {
    for (const kind of ['acquisition', 'deposit', 'mortgage'] as const) {
      const [existingToggle] = await db
        .select({ id: calculatorToggles.id })
        .from(calculatorToggles)
        .where(
          and(
            eq(calculatorToggles.kind, kind),
            eq(calculatorToggles.countryCode, 'BG'),
            eq(calculatorToggles.propertyType, ''),
          ),
        )
        .limit(1);

      if (existingToggle === undefined) {
        await db.insert(calculatorToggles).values({
          kind,
          countryCode: 'BG',
          propertyType: '',
          enabled: true,
        });
      } else {
        await db
          .update(calculatorToggles)
          .set({ enabled: true, updatedAt: new Date() })
          .where(eq(calculatorToggles.id, existingToggle.id));
      }
    }

    async function upsertRuleSet(input: {
      kind: string;
      name: string;
      warning: string;
      lines: {
        costGroup: string;
        lineType: string;
        rateValue: string;
        minAmount?: string | null;
        maxAmount?: string | null;
        optional?: boolean;
        sortOrder: number;
        labelBg: string;
        labelEn: string;
      }[];
    }) {
      const [existing] = await db
        .select({ id: calculatorRuleSets.id })
        .from(calculatorRuleSets)
        .where(
          and(
            eq(calculatorRuleSets.kind, input.kind),
            eq(calculatorRuleSets.countryCode, 'BG'),
            eq(calculatorRuleSets.propertyType, ''),
            eq(calculatorRuleSets.name, input.name),
            isNull(calculatorRuleSets.archivedAt),
          ),
        )
        .limit(1);

      let ruleSetId = existing?.id;
      if (ruleSetId === undefined) {
        const [inserted] = await db
          .insert(calculatorRuleSets)
          .values({
            countryCode: 'BG',
            propertyType: '',
            kind: input.kind,
            name: input.name,
            currency: 'EUR',
            validFrom: '2026-01-01',
            validTo: null,
            source: DEMO_SOURCE,
            warning: input.warning,
          })
          .returning({ id: calculatorRuleSets.id });
        ruleSetId = inserted?.id;
      } else {
        await db
          .update(calculatorRuleSets)
          .set({
            source: DEMO_SOURCE,
            warning: input.warning,
            updatedAt: new Date(),
          })
          .where(eq(calculatorRuleSets.id, ruleSetId));
      }
      if (ruleSetId === undefined) return;

      for (const line of input.lines) {
        const [existingLine] = await db
          .select({ id: calculatorRuleLines.id })
          .from(calculatorRuleLines)
          .where(
            and(
              eq(calculatorRuleLines.ruleSetId, ruleSetId),
              eq(calculatorRuleLines.costGroup, line.costGroup),
            ),
          )
          .limit(1);

        const values = {
          ruleSetId,
          costGroup: line.costGroup,
          lineType: line.lineType,
          rateValue: line.rateValue,
          minAmount: line.minAmount ?? null,
          maxAmount: line.maxAmount ?? null,
          optional: line.optional ?? false,
          sortOrder: line.sortOrder,
          labelBg: line.labelBg,
          labelEn: line.labelEn,
          updatedAt: new Date(),
        };

        if (existingLine !== undefined) {
          await db
            .update(calculatorRuleLines)
            .set(values)
            .where(eq(calculatorRuleLines.id, existingLine.id));
        } else {
          await db.insert(calculatorRuleLines).values(values);
        }
      }
    }

    await upsertRuleSet({
      kind: 'acquisition',
      name: 'Demo BG acquisition costs',
      warning:
        'Demo fictional rates. Not legal or tax advice. Missing real rates show as insufficient data.',
      lines: [
        {
          costGroup: 'transfer_tax',
          lineType: 'percent_of_price',
          rateValue: '3',
          sortOrder: 1,
          labelBg: 'Демо данък прехвърляне (измислен)',
          labelEn: 'Demo transfer tax (fictional)',
        },
        {
          costGroup: 'notary',
          lineType: 'fixed',
          rateValue: '500',
          sortOrder: 2,
          labelBg: 'Демо нотариална такса',
          labelEn: 'Demo notary fee',
        },
        {
          costGroup: 'bank_appraisal',
          lineType: 'fixed',
          rateValue: '200',
          optional: true,
          sortOrder: 3,
          labelBg: 'Демо банкова оценка',
          labelEn: 'Demo bank appraisal',
        },
      ],
    });

    await upsertRuleSet({
      kind: 'deposit',
      name: 'Demo BG deposit',
      warning: 'Deposit is part of the purchase price — never added twice.',
      lines: [
        {
          costGroup: 'deposit_percent',
          lineType: 'percent_of_price',
          rateValue: '10',
          sortOrder: 1,
          labelBg: 'Демо задатък %',
          labelEn: 'Demo deposit %',
        },
      ],
    });

    await upsertRuleSet({
      kind: 'mortgage',
      name: 'Demo BG mortgage assumptions',
      warning: 'Indicative only. Bank approval is individual; no guaranteed financing.',
      lines: [
        {
          costGroup: 'mortgage_annual_rate',
          lineType: 'percent_of_loan',
          rateValue: '3.5',
          sortOrder: 1,
          labelBg: 'Демо годишна лихва',
          labelEn: 'Demo annual interest rate',
        },
      ],
    });
  },
};

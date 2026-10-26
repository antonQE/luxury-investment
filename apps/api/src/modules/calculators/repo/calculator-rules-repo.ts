import type {
  CreateCalculatorRuleLineInput,
  CreateCalculatorRuleSetInput,
  ListCalculatorRuleSetsQuery,
  UpdateCalculatorRuleLineInput,
  UpdateCalculatorRuleSetInput,
  UpsertCalculatorToggleInput,
} from '@luxury-investment/shared';
import { and, asc, eq, isNull, type SQL } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import {
  calculatorRuleLines,
  calculatorRuleSets,
  calculatorToggles,
} from '../../../infrastructure/db/schema.ts';

export type CalculatorRuleSetRow = typeof calculatorRuleSets.$inferSelect;
export type CalculatorRuleLineRow = typeof calculatorRuleLines.$inferSelect;
export type CalculatorToggleRow = typeof calculatorToggles.$inferSelect;

export class CalculatorRulesRepo {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async listToggles(): Promise<CalculatorToggleRow[]> {
    return this.#db
      .select()
      .from(calculatorToggles)
      .orderBy(asc(calculatorToggles.countryCode), asc(calculatorToggles.kind));
  }

  async upsertToggle(input: UpsertCalculatorToggleInput): Promise<CalculatorToggleRow> {
    const propertyType = input.propertyType;
    const [existing] = await this.#db
      .select()
      .from(calculatorToggles)
      .where(
        and(
          eq(calculatorToggles.kind, input.kind),
          eq(calculatorToggles.countryCode, input.countryCode),
          eq(calculatorToggles.propertyType, propertyType),
        ),
      )
      .limit(1);

    if (existing !== undefined) {
      const [row] = await this.#db
        .update(calculatorToggles)
        .set({ enabled: input.enabled, updatedAt: new Date() })
        .where(eq(calculatorToggles.id, existing.id))
        .returning();
      if (row === undefined) throw new Error('update calculator_toggles returned no row');
      return row;
    }

    const [row] = await this.#db
      .insert(calculatorToggles)
      .values({
        kind: input.kind,
        countryCode: input.countryCode,
        propertyType,
        enabled: input.enabled,
      })
      .returning();
    if (row === undefined) throw new Error('insert calculator_toggles returned no row');
    return row;
  }

  async listRuleSets(
    query: ListCalculatorRuleSetsQuery = {
      countryCode: undefined,
      kind: undefined,
      includeArchived: false,
    },
  ): Promise<CalculatorRuleSetRow[]> {
    const clauses: SQL[] = [];
    if (query.countryCode !== undefined) {
      clauses.push(eq(calculatorRuleSets.countryCode, query.countryCode));
    }
    if (query.kind !== undefined) {
      clauses.push(eq(calculatorRuleSets.kind, query.kind));
    }
    if (!query.includeArchived) {
      clauses.push(isNull(calculatorRuleSets.archivedAt));
    }
    const where = clauses.length > 0 ? and(...clauses) : undefined;
    return this.#db
      .select()
      .from(calculatorRuleSets)
      .where(where)
      .orderBy(asc(calculatorRuleSets.countryCode), asc(calculatorRuleSets.kind));
  }

  async getRuleSet(id: string): Promise<CalculatorRuleSetRow | null> {
    const [row] = await this.#db
      .select()
      .from(calculatorRuleSets)
      .where(eq(calculatorRuleSets.id, id))
      .limit(1);
    return row ?? null;
  }

  async listLines(ruleSetId: string): Promise<CalculatorRuleLineRow[]> {
    return this.#db
      .select()
      .from(calculatorRuleLines)
      .where(eq(calculatorRuleLines.ruleSetId, ruleSetId))
      .orderBy(asc(calculatorRuleLines.sortOrder));
  }

  async createRuleSet(input: CreateCalculatorRuleSetInput): Promise<CalculatorRuleSetRow> {
    const [row] = await this.#db
      .insert(calculatorRuleSets)
      .values({
        countryCode: input.countryCode,
        propertyType: input.propertyType ?? '',
        kind: input.kind,
        name: input.name,
        currency: input.currency,
        validFrom: input.validFrom,
        validTo: input.validTo ?? null,
        source: input.source,
        warning: input.warning,
      })
      .returning();
    if (row === undefined) throw new Error('insert calculator_rule_sets returned no row');
    return row;
  }

  async updateRuleSet(
    id: string,
    input: UpdateCalculatorRuleSetInput,
  ): Promise<CalculatorRuleSetRow | null> {
    const patch: Partial<typeof calculatorRuleSets.$inferInsert> = { updatedAt: new Date() };
    if (input.countryCode !== undefined) patch.countryCode = input.countryCode;
    if (input.propertyType !== undefined) patch.propertyType = input.propertyType ?? '';
    if (input.kind !== undefined) patch.kind = input.kind;
    if (input.name !== undefined) patch.name = input.name;
    if (input.currency !== undefined) patch.currency = input.currency;
    if (input.validFrom !== undefined) patch.validFrom = input.validFrom;
    if (input.validTo !== undefined) patch.validTo = input.validTo;
    if (input.source !== undefined) patch.source = input.source;
    if (input.warning !== undefined) patch.warning = input.warning;

    const [row] = await this.#db
      .update(calculatorRuleSets)
      .set(patch)
      .where(eq(calculatorRuleSets.id, id))
      .returning();
    return row ?? null;
  }

  async archiveRuleSet(id: string): Promise<CalculatorRuleSetRow | null> {
    const [row] = await this.#db
      .update(calculatorRuleSets)
      .set({ archivedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(calculatorRuleSets.id, id), isNull(calculatorRuleSets.archivedAt)))
      .returning();
    if (row !== undefined) return row;
    return this.getRuleSet(id);
  }

  async createLine(
    ruleSetId: string,
    input: CreateCalculatorRuleLineInput,
  ): Promise<CalculatorRuleLineRow> {
    const [row] = await this.#db
      .insert(calculatorRuleLines)
      .values({
        ruleSetId,
        costGroup: input.costGroup,
        lineType: input.lineType,
        rateValue: input.rateValue,
        minAmount: input.minAmount ?? null,
        maxAmount: input.maxAmount ?? null,
        optional: input.optional,
        sortOrder: input.sortOrder,
        labelBg: input.labelBg,
        labelEn: input.labelEn,
      })
      .returning();
    if (row === undefined) throw new Error('insert calculator_rule_lines returned no row');
    return row;
  }

  async updateLine(
    id: string,
    input: UpdateCalculatorRuleLineInput,
  ): Promise<CalculatorRuleLineRow | null> {
    const patch: Partial<typeof calculatorRuleLines.$inferInsert> = { updatedAt: new Date() };
    if (input.costGroup !== undefined) patch.costGroup = input.costGroup;
    if (input.lineType !== undefined) patch.lineType = input.lineType;
    if (input.rateValue !== undefined) patch.rateValue = input.rateValue;
    if (input.minAmount !== undefined) patch.minAmount = input.minAmount;
    if (input.maxAmount !== undefined) patch.maxAmount = input.maxAmount;
    if (input.optional !== undefined) patch.optional = input.optional;
    if (input.sortOrder !== undefined) patch.sortOrder = input.sortOrder;
    if (input.labelBg !== undefined) patch.labelBg = input.labelBg;
    if (input.labelEn !== undefined) patch.labelEn = input.labelEn;

    const [row] = await this.#db
      .update(calculatorRuleLines)
      .set(patch)
      .where(eq(calculatorRuleLines.id, id))
      .returning();
    return row ?? null;
  }

  async getLine(id: string): Promise<CalculatorRuleLineRow | null> {
    const [row] = await this.#db
      .select()
      .from(calculatorRuleLines)
      .where(eq(calculatorRuleLines.id, id))
      .limit(1);
    return row ?? null;
  }
}

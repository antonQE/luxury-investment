import type { CalculatorKind, DepositEstimate } from '@luxury-investment/shared';
import { and, asc, eq, isNull, lte, or, sql } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import {
  calculatorRuleLines,
  calculatorRuleSets,
  calculatorToggles,
  properties,
} from '../../../infrastructure/db/schema.ts';
import { buildAcquisitionEstimate } from './acquisition-estimate.ts';
import { resolveCountryCode } from './country-code.ts';
import { buildDepositEstimate } from './deposit-estimate.ts';

export class DepositEstimateService {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async estimateForSlug(
    slug: string,
    options: { price?: number; depositPercent?: number; locale?: 'bg' | 'en' } = {},
  ): Promise<DepositEstimate | null> {
    const [property] = await this.#db
      .select({
        price: properties.price,
        currency: properties.currency,
        country: properties.country,
        propertyType: properties.propertyType,
        listingStatus: properties.listingStatus,
      })
      .from(properties)
      .where(eq(properties.slug, slug))
      .limit(1);

    if (property?.listingStatus !== 'published') {
      return null;
    }

    const purchasePrice = options.price ?? Number(property.price);
    const countryCode = resolveCountryCode(property.country);
    const locale = options.locale ?? 'en';

    if (countryCode === null || !Number.isFinite(purchasePrice) || purchasePrice <= 0) {
      return buildDepositEstimate({
        purchasePrice: Number.isFinite(purchasePrice) ? purchasePrice : 0,
        currency: property.currency,
        countryCode,
        enabled: false,
        depositPercentOverride: options.depositPercent ?? null,
        depositRuleSet: null,
        depositLines: [],
        extraCosts: [],
        extraCostsTotal: null,
      });
    }

    const depositCtx = await this.#loadKindContext('deposit', countryCode, property.propertyType);
    const acquisitionCtx = await this.#loadKindContext(
      'acquisition',
      countryCode,
      property.propertyType,
    );

    const acquisition = buildAcquisitionEstimate({
      purchasePrice,
      currency: property.currency,
      countryCode,
      enabled: acquisitionCtx.enabled,
      ruleSet: acquisitionCtx.ruleSet,
      lines: acquisitionCtx.lines,
      locale,
    });

    const extraCosts = acquisition.status === 'ok' ? acquisition.costs : [];
    const extraCostsTotal = acquisition.status === 'ok' ? acquisition.costsTotal : null;

    return buildDepositEstimate({
      purchasePrice,
      currency: property.currency,
      countryCode,
      enabled: depositCtx.enabled,
      depositPercentOverride: options.depositPercent ?? null,
      depositRuleSet: depositCtx.ruleSet,
      depositLines: depositCtx.lines,
      extraCosts,
      extraCostsTotal,
    });
  }

  async #loadKindContext(kind: CalculatorKind, countryCode: string, propertyType: string) {
    const [toggleExact] = await this.#db
      .select()
      .from(calculatorToggles)
      .where(
        and(
          eq(calculatorToggles.kind, kind),
          eq(calculatorToggles.countryCode, countryCode),
          eq(calculatorToggles.propertyType, propertyType),
        ),
      )
      .limit(1);

    const [toggleAll] = await this.#db
      .select()
      .from(calculatorToggles)
      .where(
        and(
          eq(calculatorToggles.kind, kind),
          eq(calculatorToggles.countryCode, countryCode),
          eq(calculatorToggles.propertyType, ''),
        ),
      )
      .limit(1);

    const toggle = toggleExact ?? toggleAll;
    const enabled = toggle === undefined ? true : toggle.enabled;

    const today = new Date().toISOString().slice(0, 10);
    const validClause = and(
      lte(calculatorRuleSets.validFrom, today),
      or(isNull(calculatorRuleSets.validTo), sql`${calculatorRuleSets.validTo} >= ${today}`),
    );

    const [exactSet] = await this.#db
      .select()
      .from(calculatorRuleSets)
      .where(
        and(
          eq(calculatorRuleSets.kind, kind),
          eq(calculatorRuleSets.countryCode, countryCode),
          eq(calculatorRuleSets.propertyType, propertyType),
          isNull(calculatorRuleSets.archivedAt),
          validClause,
        ),
      )
      .limit(1);

    const [allSet] = await this.#db
      .select()
      .from(calculatorRuleSets)
      .where(
        and(
          eq(calculatorRuleSets.kind, kind),
          eq(calculatorRuleSets.countryCode, countryCode),
          eq(calculatorRuleSets.propertyType, ''),
          isNull(calculatorRuleSets.archivedAt),
          validClause,
        ),
      )
      .limit(1);

    const ruleSet = exactSet ?? allSet ?? null;
    const lines =
      ruleSet === null
        ? []
        : await this.#db
            .select()
            .from(calculatorRuleLines)
            .where(eq(calculatorRuleLines.ruleSetId, ruleSet.id))
            .orderBy(asc(calculatorRuleLines.sortOrder));

    return { enabled, ruleSet, lines };
  }
}

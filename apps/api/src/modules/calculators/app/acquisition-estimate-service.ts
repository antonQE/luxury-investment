import type { AcquisitionEstimate } from '@luxury-investment/shared';
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

export class AcquisitionEstimateService {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async estimateForSlug(
    slug: string,
    options: { price?: number; locale?: 'bg' | 'en' } = {},
  ): Promise<AcquisitionEstimate | null> {
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
      return buildAcquisitionEstimate({
        purchasePrice: Number.isFinite(purchasePrice) ? purchasePrice : 0,
        currency: property.currency,
        countryCode,
        enabled: false,
        ruleSet: null,
        lines: [],
        locale,
      });
    }

    const [toggleExact] = await this.#db
      .select()
      .from(calculatorToggles)
      .where(
        and(
          eq(calculatorToggles.kind, 'acquisition'),
          eq(calculatorToggles.countryCode, countryCode),
          eq(calculatorToggles.propertyType, property.propertyType),
        ),
      )
      .limit(1);

    const [toggleAll] = await this.#db
      .select()
      .from(calculatorToggles)
      .where(
        and(
          eq(calculatorToggles.kind, 'acquisition'),
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
          eq(calculatorRuleSets.kind, 'acquisition'),
          eq(calculatorRuleSets.countryCode, countryCode),
          eq(calculatorRuleSets.propertyType, property.propertyType),
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
          eq(calculatorRuleSets.kind, 'acquisition'),
          eq(calculatorRuleSets.countryCode, countryCode),
          eq(calculatorRuleSets.propertyType, ''),
          isNull(calculatorRuleSets.archivedAt),
          validClause,
        ),
      )
      .limit(1);

    const activeSet = exactSet ?? allSet ?? null;
    const lines =
      activeSet === null
        ? []
        : await this.#db
            .select()
            .from(calculatorRuleLines)
            .where(eq(calculatorRuleLines.ruleSetId, activeSet.id))
            .orderBy(asc(calculatorRuleLines.sortOrder));

    return buildAcquisitionEstimate({
      purchasePrice,
      currency: property.currency,
      countryCode,
      enabled,
      ruleSet: activeSet,
      lines,
      locale,
    });
  }
}

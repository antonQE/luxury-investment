import type {
  CalculatorKind,
  MortgageConsultant,
  MortgageEstimate,
} from '@luxury-investment/shared';
import { and, asc, eq, isNull, lte, or, sql } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/db/client.ts';
import {
  calculatorRuleLines,
  calculatorRuleSets,
  calculatorToggles,
  properties,
  teamMembers,
  translations,
} from '../../../infrastructure/db/schema.ts';
import { resolveCountryCode } from './country-code.ts';
import { buildMortgageEstimate } from './mortgage-estimate.ts';

export class MortgageEstimateService {
  readonly #db: Database;
  readonly #consultantSlug: string;

  constructor(db: Database, consultantSlug: string) {
    this.#db = db;
    this.#consultantSlug = consultantSlug;
  }

  async estimateForSlug(
    slug: string,
    options: {
      price?: number;
      downPayment?: number;
      loanAmount?: number;
      termYears?: number;
      annualRate?: number;
      locale?: 'bg' | 'en';
    } = {},
  ): Promise<MortgageEstimate | null> {
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
    const consultant = await this.#loadConsultant(locale);

    if (countryCode === null || !Number.isFinite(purchasePrice) || purchasePrice <= 0) {
      return buildMortgageEstimate({
        purchasePrice: Number.isFinite(purchasePrice) ? purchasePrice : 0,
        currency: property.currency,
        countryCode,
        enabled: false,
        downPaymentOverride: options.downPayment ?? null,
        loanAmountOverride: options.loanAmount ?? null,
        termYearsOverride: options.termYears ?? null,
        annualRateOverride: options.annualRate ?? null,
        defaultDownPaymentPercent: null,
        mortgageRuleSet: null,
        mortgageLines: [],
        consultant,
      });
    }

    const mortgageCtx = await this.#loadKindContext('mortgage', countryCode, property.propertyType);
    const depositCtx = await this.#loadKindContext('deposit', countryCode, property.propertyType);
    const depositLine = depositCtx.lines.find((row) => row.costGroup === 'deposit_percent');
    const defaultDownPaymentPercent =
      depositLine !== undefined && Number.isFinite(Number(depositLine.rateValue))
        ? Number(depositLine.rateValue)
        : null;

    return buildMortgageEstimate({
      purchasePrice,
      currency: property.currency,
      countryCode,
      enabled: mortgageCtx.enabled,
      downPaymentOverride: options.downPayment ?? null,
      loanAmountOverride: options.loanAmount ?? null,
      termYearsOverride: options.termYears ?? null,
      annualRateOverride: options.annualRate ?? null,
      defaultDownPaymentPercent,
      mortgageRuleSet: mortgageCtx.ruleSet,
      mortgageLines: mortgageCtx.lines,
      consultant,
    });
  }

  async #loadConsultant(locale: 'bg' | 'en'): Promise<MortgageConsultant | null> {
    const [member] = await this.#db
      .select({
        id: teamMembers.id,
        slug: teamMembers.slug,
        email: teamMembers.email,
        phone: teamMembers.phone,
        isPublic: teamMembers.isPublic,
        archivedAt: teamMembers.archivedAt,
      })
      .from(teamMembers)
      .where(eq(teamMembers.slug, this.#consultantSlug))
      .limit(1);

    if (member === undefined || !member.isPublic || member.archivedAt !== null) {
      return null;
    }

    const [nameRow] = await this.#db
      .select({ value: translations.value })
      .from(translations)
      .where(
        and(
          eq(translations.entityType, 'team_member'),
          eq(translations.entityId, member.id),
          eq(translations.field, 'name'),
          eq(translations.locale, locale),
        ),
      )
      .limit(1);

    const [fallbackName] = await this.#db
      .select({ value: translations.value })
      .from(translations)
      .where(
        and(
          eq(translations.entityType, 'team_member'),
          eq(translations.entityId, member.id),
          eq(translations.field, 'name'),
          eq(translations.locale, 'en'),
        ),
      )
      .limit(1);

    return {
      name: nameRow?.value ?? fallbackName?.value ?? member.slug,
      email: member.email,
      phone: member.phone,
      slug: member.slug,
    };
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

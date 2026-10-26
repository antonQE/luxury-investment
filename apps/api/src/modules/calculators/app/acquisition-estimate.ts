import type { AcquisitionCostLine, AcquisitionEstimate } from '@luxury-investment/shared';

import type { CalculatorRuleLineRow, CalculatorRuleSetRow } from '../repo/calculator-rules-repo.ts';

const DISCLAIMER_EN =
  'Indicative estimate only. Not a binding financial or legal offer. Confirm rates for the jurisdiction before relying on them.';

export interface AcquisitionEstimateInput {
  purchasePrice: number;
  currency: string;
  countryCode: string | null;
  enabled: boolean;
  ruleSet: CalculatorRuleSetRow | null;
  lines: CalculatorRuleLineRow[];
  locale: 'bg' | 'en';
}

function clamp(amount: number, min: string | null, max: string | null): number {
  let value = amount;
  if (min !== null && min !== '') {
    const parsed = Number(min);
    if (Number.isFinite(parsed)) value = Math.max(value, parsed);
  }
  if (max !== null && max !== '') {
    const parsed = Number(max);
    if (Number.isFinite(parsed)) value = Math.min(value, parsed);
  }
  return value;
}

function lineAmount(
  line: CalculatorRuleLineRow,
  purchasePrice: number,
): { amount: number | null; status: AcquisitionCostLine['status'] } {
  const rate = Number(line.rateValue);
  if (!Number.isFinite(rate)) {
    return { amount: null, status: 'unknown' };
  }

  let raw: number;
  if (line.lineType === 'percent_of_price') {
    raw = (purchasePrice * rate) / 100;
  } else if (line.lineType === 'fixed') {
    raw = rate;
  } else {
    // percent_of_loan is not used for acquisition estimates
    return { amount: null, status: 'unknown' };
  }

  const amount = clamp(raw, line.minAmount, line.maxAmount);
  return {
    amount: Math.round(amount * 100) / 100,
    status: line.optional ? 'assumed' : 'included',
  };
}

export function buildAcquisitionEstimate(input: AcquisitionEstimateInput): AcquisitionEstimate {
  const purchasePrice = input.purchasePrice;

  if (input.countryCode === null) {
    return {
      status: 'insufficient_data',
      countryCode: null,
      currency: input.currency,
      purchasePrice,
      costs: [],
      costsTotal: null,
      totalAcquisition: null,
      warning: 'Country could not be resolved for calculator rules.',
      disclaimer: DISCLAIMER_EN,
    };
  }

  if (!input.enabled) {
    return {
      status: 'disabled',
      countryCode: input.countryCode,
      currency: input.currency,
      purchasePrice,
      costs: [],
      costsTotal: null,
      totalAcquisition: null,
      warning: input.ruleSet?.warning ?? null,
      disclaimer: DISCLAIMER_EN,
    };
  }

  if (input.ruleSet === null || input.lines.length === 0) {
    return {
      status: 'insufficient_data',
      countryCode: input.countryCode,
      currency: input.currency,
      purchasePrice,
      costs: [],
      costsTotal: null,
      totalAcquisition: null,
      warning: 'Not enough configured rates for this country.',
      disclaimer: DISCLAIMER_EN,
    };
  }

  const costs: AcquisitionCostLine[] = input.lines.map((line) => {
    const computed = lineAmount(line, purchasePrice);
    return {
      costGroup: line.costGroup as AcquisitionCostLine['costGroup'],
      label: input.locale === 'bg' ? line.labelBg : line.labelEn,
      amount: computed.amount,
      optional: line.optional,
      status: computed.status,
    };
  });

  const unknown = costs.some((line) => line.status === 'unknown' || line.amount === null);
  if (unknown) {
    return {
      status: 'insufficient_data',
      countryCode: input.countryCode,
      currency: input.ruleSet.currency,
      purchasePrice,
      costs,
      costsTotal: null,
      totalAcquisition: null,
      warning: input.ruleSet.warning || 'Some cost lines could not be calculated.',
      disclaimer: DISCLAIMER_EN,
    };
  }

  const costsTotal = costs.reduce((sum, line) => sum + (line.amount ?? 0), 0);
  const roundedCosts = Math.round(costsTotal * 100) / 100;

  return {
    status: 'ok',
    countryCode: input.countryCode,
    currency: input.ruleSet.currency,
    purchasePrice,
    costs,
    costsTotal: roundedCosts,
    totalAcquisition: Math.round((purchasePrice + roundedCosts) * 100) / 100,
    warning: input.ruleSet.warning || null,
    disclaimer: DISCLAIMER_EN,
  };
}

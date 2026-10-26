import type { AcquisitionCostLine, DepositEstimate } from '@luxury-investment/shared';

import type { CalculatorRuleLineRow, CalculatorRuleSetRow } from '../repo/calculator-rules-repo.ts';

const DISCLAIMER_EN =
  'Indicative estimate only. The deposit is part of the purchase price and is never added twice. Not a binding financial or legal offer.';

export interface DepositEstimateInput {
  purchasePrice: number;
  currency: string;
  countryCode: string | null;
  enabled: boolean;
  depositPercentOverride: number | null;
  depositRuleSet: CalculatorRuleSetRow | null;
  depositLines: CalculatorRuleLineRow[];
  extraCosts: AcquisitionCostLine[];
  extraCostsTotal: number | null;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function resolveDepositPercent(input: DepositEstimateInput): number | null {
  if (input.depositPercentOverride !== null) {
    return input.depositPercentOverride;
  }
  const line = input.depositLines.find((row) => row.costGroup === 'deposit_percent');
  if (line === undefined) return null;
  const rate = Number(line.rateValue);
  return Number.isFinite(rate) ? rate : null;
}

export function buildDepositEstimate(input: DepositEstimateInput): DepositEstimate {
  const purchasePrice = input.purchasePrice;

  if (input.countryCode === null) {
    return {
      status: 'insufficient_data',
      countryCode: null,
      currency: input.currency,
      purchasePrice,
      depositPercent: null,
      depositAmount: null,
      remainingPrice: null,
      extraCosts: [],
      extraCostsTotal: null,
      initialFunds: null,
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
      depositPercent: null,
      depositAmount: null,
      remainingPrice: null,
      extraCosts: [],
      extraCostsTotal: null,
      initialFunds: null,
      warning: input.depositRuleSet?.warning ?? null,
      disclaimer: DISCLAIMER_EN,
    };
  }

  const depositPercent = resolveDepositPercent(input);
  if (
    depositPercent === null ||
    (input.depositPercentOverride === null &&
      (input.depositRuleSet === null || input.depositLines.length === 0))
  ) {
    return {
      status: 'insufficient_data',
      countryCode: input.countryCode,
      currency: input.currency,
      purchasePrice,
      depositPercent: null,
      depositAmount: null,
      remainingPrice: null,
      extraCosts: input.extraCosts,
      extraCostsTotal: input.extraCostsTotal,
      initialFunds: null,
      warning: 'Not enough configured deposit rates for this country.',
      disclaimer: DISCLAIMER_EN,
    };
  }

  const depositAmount = roundMoney((purchasePrice * depositPercent) / 100);
  const remainingPrice = roundMoney(purchasePrice - depositAmount);
  const extraCostsTotal = input.extraCostsTotal;
  const initialFunds =
    extraCostsTotal === null ? depositAmount : roundMoney(depositAmount + extraCostsTotal);

  return {
    status: 'ok',
    countryCode: input.countryCode,
    currency: input.depositRuleSet?.currency ?? input.currency,
    purchasePrice,
    depositPercent,
    depositAmount,
    remainingPrice,
    extraCosts: input.extraCosts,
    extraCostsTotal,
    initialFunds,
    warning: input.depositRuleSet?.warning ?? null,
    disclaimer: DISCLAIMER_EN,
  };
}

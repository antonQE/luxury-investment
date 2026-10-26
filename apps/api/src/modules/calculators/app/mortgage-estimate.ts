import type { MortgageConsultant, MortgageEstimate } from '@luxury-investment/shared';

import type { CalculatorRuleLineRow, CalculatorRuleSetRow } from '../repo/calculator-rules-repo.ts';

const DISCLAIMER_EN =
  'Indicative estimate only. Bank approval, financed share and fees depend on individual underwriting. Not a guaranteed financing offer.';

const DEFAULT_TERM_YEARS = 25;

export interface MortgageEstimateInput {
  purchasePrice: number;
  currency: string;
  countryCode: string | null;
  enabled: boolean;
  downPaymentOverride: number | null;
  loanAmountOverride: number | null;
  termYearsOverride: number | null;
  annualRateOverride: number | null;
  /** Fallback down-payment percent when no override (e.g. deposit rule). */
  defaultDownPaymentPercent: number | null;
  mortgageRuleSet: CalculatorRuleSetRow | null;
  mortgageLines: CalculatorRuleLineRow[];
  consultant: MortgageConsultant | null;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function resolveAnnualRate(input: MortgageEstimateInput): number | null {
  if (input.annualRateOverride !== null) return input.annualRateOverride;
  const line = input.mortgageLines.find((row) => row.costGroup === 'mortgage_annual_rate');
  if (line === undefined) return null;
  const rate = Number(line.rateValue);
  return Number.isFinite(rate) ? rate : null;
}

/** Standard amortizing monthly payment. */
export function amortizingMonthlyPayment(
  loanAmount: number,
  annualRatePercent: number,
  termYears: number,
): number {
  const months = termYears * 12;
  if (months <= 0 || loanAmount <= 0) return 0;
  const monthlyRate = annualRatePercent / 100 / 12;
  if (monthlyRate === 0) return roundMoney(loanAmount / months);
  const factor = (1 + monthlyRate) ** months;
  return roundMoney((loanAmount * (monthlyRate * factor)) / (factor - 1));
}

export function buildMortgageEstimate(input: MortgageEstimateInput): MortgageEstimate {
  const purchasePrice = input.purchasePrice;
  const base = {
    countryCode: input.countryCode,
    currency: input.currency,
    purchasePrice,
    consultant: input.consultant,
    disclaimer: DISCLAIMER_EN,
  };

  if (input.countryCode === null) {
    return {
      ...base,
      status: 'insufficient_data',
      downPayment: null,
      loanAmount: null,
      termYears: null,
      annualRatePercent: null,
      monthlyPayment: null,
      totalPayments: null,
      totalInterest: null,
      warning: 'Country could not be resolved for calculator rules.',
    };
  }

  if (!input.enabled) {
    return {
      ...base,
      status: 'disabled',
      downPayment: null,
      loanAmount: null,
      termYears: null,
      annualRatePercent: null,
      monthlyPayment: null,
      totalPayments: null,
      totalInterest: null,
      warning: input.mortgageRuleSet?.warning ?? null,
    };
  }

  const annualRatePercent = resolveAnnualRate(input);
  const termYears = input.termYearsOverride ?? DEFAULT_TERM_YEARS;

  if (
    annualRatePercent === null ||
    (input.annualRateOverride === null &&
      (input.mortgageRuleSet === null || input.mortgageLines.length === 0))
  ) {
    return {
      ...base,
      status: 'insufficient_data',
      downPayment: null,
      loanAmount: null,
      termYears,
      annualRatePercent: null,
      monthlyPayment: null,
      totalPayments: null,
      totalInterest: null,
      warning: 'Not enough configured mortgage rates for this country.',
    };
  }

  let downPayment: number;
  if (input.downPaymentOverride !== null) {
    downPayment = input.downPaymentOverride;
  } else if (input.defaultDownPaymentPercent !== null) {
    downPayment = roundMoney((purchasePrice * input.defaultDownPaymentPercent) / 100);
  } else {
    downPayment = roundMoney(purchasePrice * 0.2);
  }

  if (downPayment < 0 || downPayment >= purchasePrice) {
    return {
      ...base,
      status: 'insufficient_data',
      downPayment,
      loanAmount: null,
      termYears,
      annualRatePercent,
      monthlyPayment: null,
      totalPayments: null,
      totalInterest: null,
      warning: 'Down payment must be less than the purchase price.',
    };
  }

  const loanAmount = input.loanAmountOverride ?? roundMoney(purchasePrice - downPayment);

  if (loanAmount <= 0) {
    return {
      ...base,
      status: 'insufficient_data',
      downPayment,
      loanAmount,
      termYears,
      annualRatePercent,
      monthlyPayment: null,
      totalPayments: null,
      totalInterest: null,
      warning: 'Loan amount must be positive.',
    };
  }

  const monthlyPayment = amortizingMonthlyPayment(loanAmount, annualRatePercent, termYears);
  const totalPayments = roundMoney(monthlyPayment * termYears * 12);
  const totalInterest = roundMoney(totalPayments - loanAmount);

  return {
    status: 'ok',
    countryCode: input.countryCode,
    currency: input.mortgageRuleSet?.currency ?? input.currency,
    purchasePrice,
    downPayment,
    loanAmount,
    termYears,
    annualRatePercent,
    monthlyPayment,
    totalPayments,
    totalInterest,
    consultant: input.consultant,
    warning: input.mortgageRuleSet?.warning ?? null,
    disclaimer: DISCLAIMER_EN,
  };
}

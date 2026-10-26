import { describe, expect, it } from 'vitest';

import type { CalculatorRuleLineRow, CalculatorRuleSetRow } from '../repo/calculator-rules-repo.ts';
import { amortizingMonthlyPayment, buildMortgageEstimate } from './mortgage-estimate.ts';

function line(
  partial: Partial<CalculatorRuleLineRow> &
    Pick<CalculatorRuleLineRow, 'costGroup' | 'lineType' | 'rateValue' | 'labelEn'>,
): CalculatorRuleLineRow {
  return {
    id: 'line-1',
    ruleSetId: 'set-1',
    minAmount: null,
    maxAmount: null,
    optional: false,
    sortOrder: 1,
    labelBg: partial.labelEn,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  };
}

const mortgageSet: CalculatorRuleSetRow = {
  id: 'set-mortgage',
  countryCode: 'BG',
  propertyType: '',
  kind: 'mortgage',
  name: 'Demo mortgage',
  currency: 'EUR',
  validFrom: '2026-01-01',
  validTo: null,
  source: 'demo',
  warning: 'Indicative only.',
  archivedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('amortizingMonthlyPayment', () => {
  it('computes a stable payment for a fixed input set', () => {
    // 180_000 €, 3.5% annual, 25 years → known amortizing payment
    const payment = amortizingMonthlyPayment(180_000, 3.5, 25);
    expect(payment).toBe(901.12);
  });
});

describe('buildMortgageEstimate', () => {
  it('returns monthly payment and totals from configurable assumptions', () => {
    const result = buildMortgageEstimate({
      purchasePrice: 200_000,
      currency: 'EUR',
      countryCode: 'BG',
      enabled: true,
      downPaymentOverride: 20_000,
      loanAmountOverride: null,
      termYearsOverride: 25,
      annualRateOverride: null,
      defaultDownPaymentPercent: 10,
      mortgageRuleSet: mortgageSet,
      mortgageLines: [
        line({
          costGroup: 'mortgage_annual_rate',
          lineType: 'percent_of_loan',
          rateValue: '3.5',
          labelEn: 'Annual rate',
        }),
      ],
      consultant: {
        name: 'Demo Credit Consultant',
        email: 'credit@example.com',
        phone: '+359 000 000 004',
        slug: 'demo-credit-consultant',
      },
    });

    expect(result.status).toBe('ok');
    expect(result.downPayment).toBe(20_000);
    expect(result.loanAmount).toBe(180_000);
    expect(result.annualRatePercent).toBe(3.5);
    expect(result.monthlyPayment).toBe(901.12);
    expect(result.totalPayments).toBe(270_336);
    expect(result.totalInterest).toBe(90_336);
    expect(result.consultant?.slug).toBe('demo-credit-consultant');
  });

  it('returns insufficient_data when rate is missing', () => {
    const result = buildMortgageEstimate({
      purchasePrice: 200_000,
      currency: 'EUR',
      countryCode: 'BG',
      enabled: true,
      downPaymentOverride: null,
      loanAmountOverride: null,
      termYearsOverride: null,
      annualRateOverride: null,
      defaultDownPaymentPercent: 10,
      mortgageRuleSet: null,
      mortgageLines: [],
      consultant: null,
    });
    expect(result.status).toBe('insufficient_data');
    expect(result.monthlyPayment).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';

import type { CalculatorRuleLineRow, CalculatorRuleSetRow } from '../repo/calculator-rules-repo.ts';
import { buildDepositEstimate } from './deposit-estimate.ts';

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

const depositSet: CalculatorRuleSetRow = {
  id: 'set-deposit',
  countryCode: 'BG',
  propertyType: '',
  kind: 'deposit',
  name: 'Demo deposit',
  currency: 'EUR',
  validFrom: '2026-01-01',
  validTo: null,
  source: 'demo',
  warning: 'Deposit is part of the purchase price — never added twice.',
  archivedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('buildDepositEstimate', () => {
  it('does not double-count deposit for 200_000 € / 10%', () => {
    const result = buildDepositEstimate({
      purchasePrice: 200_000,
      currency: 'EUR',
      countryCode: 'BG',
      enabled: true,
      depositPercentOverride: null,
      depositRuleSet: depositSet,
      depositLines: [
        line({
          costGroup: 'deposit_percent',
          lineType: 'percent_of_price',
          rateValue: '10',
          labelEn: 'Deposit %',
        }),
      ],
      extraCosts: [
        {
          costGroup: 'transfer_tax',
          label: 'Transfer tax',
          amount: 6000,
          optional: false,
          status: 'included',
        },
        {
          costGroup: 'notary',
          label: 'Notary',
          amount: 500,
          optional: false,
          status: 'included',
        },
      ],
      extraCostsTotal: 6500,
    });

    expect(result.status).toBe('ok');
    expect(result.purchasePrice).toBe(200_000);
    expect(result.depositPercent).toBe(10);
    expect(result.depositAmount).toBe(20_000);
    expect(result.remainingPrice).toBe(180_000);
    expect((result.depositAmount ?? 0) + (result.remainingPrice ?? 0)).toBe(200_000);
    // Double-counting would report 220_000 as the price — must not happen.
    expect(result.purchasePrice).toBe(200_000);
    expect(result.extraCostsTotal).toBe(6500);
    expect(result.initialFunds).toBe(26_500);
  });

  it('returns insufficient_data without deposit rate', () => {
    const result = buildDepositEstimate({
      purchasePrice: 200_000,
      currency: 'EUR',
      countryCode: 'BG',
      enabled: true,
      depositPercentOverride: null,
      depositRuleSet: null,
      depositLines: [],
      extraCosts: [],
      extraCostsTotal: null,
    });
    expect(result.status).toBe('insufficient_data');
    expect(result.depositAmount).toBeNull();
  });
});

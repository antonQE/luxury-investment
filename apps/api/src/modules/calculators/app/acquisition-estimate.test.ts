import { describe, expect, it } from 'vitest';

import type { CalculatorRuleLineRow, CalculatorRuleSetRow } from '../repo/calculator-rules-repo.ts';
import { buildAcquisitionEstimate } from './acquisition-estimate.ts';
import { resolveCountryCode } from './country-code.ts';

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

const ruleSet: CalculatorRuleSetRow = {
  id: 'set-1',
  countryCode: 'BG',
  propertyType: '',
  kind: 'acquisition',
  name: 'Demo',
  currency: 'EUR',
  validFrom: '2026-01-01',
  validTo: null,
  source: 'demo',
  warning: 'Demo warning',
  archivedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('resolveCountryCode', () => {
  it('maps Bulgarian labels to BG', () => {
    expect(resolveCountryCode('България')).toBe('BG');
    expect(resolveCountryCode('BG')).toBe('BG');
  });
});

describe('buildAcquisitionEstimate', () => {
  it('keeps purchase price separate from tax/notary/bank fees', () => {
    const result = buildAcquisitionEstimate({
      purchasePrice: 200_000,
      currency: 'EUR',
      countryCode: 'BG',
      enabled: true,
      ruleSet,
      lines: [
        line({
          costGroup: 'transfer_tax',
          lineType: 'percent_of_price',
          rateValue: '3',
          labelEn: 'Transfer tax',
        }),
        line({
          id: 'line-2',
          costGroup: 'notary',
          lineType: 'fixed',
          rateValue: '500',
          labelEn: 'Notary',
        }),
        line({
          id: 'line-3',
          costGroup: 'bank_appraisal',
          lineType: 'fixed',
          rateValue: '200',
          optional: true,
          labelEn: 'Bank appraisal',
        }),
      ],
      locale: 'en',
    });

    expect(result.status).toBe('ok');
    expect(result.purchasePrice).toBe(200_000);
    expect(result.costsTotal).toBe(6700);
    expect(result.totalAcquisition).toBe(206_700);
    expect(result.costs.map((c) => c.costGroup)).toEqual([
      'transfer_tax',
      'notary',
      'bank_appraisal',
    ]);
    expect(result.costs.find((c) => c.costGroup === 'bank_appraisal')?.status).toBe('assumed');
  });

  it('returns insufficient_data when no rules', () => {
    const result = buildAcquisitionEstimate({
      purchasePrice: 200_000,
      currency: 'EUR',
      countryCode: 'BG',
      enabled: true,
      ruleSet: null,
      lines: [],
      locale: 'en',
    });
    expect(result.status).toBe('insufficient_data');
    expect(result.totalAcquisition).toBeNull();
  });
});

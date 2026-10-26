/** @vitest-environment jsdom */
import { render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DepositCalculator } from '@/components/property/DepositCalculator';

const messages = {
  Property: {
    depositCalculator: {
      title: 'Deposit estimate',
      lead: 'Lead',
      loading: 'Calculating…',
      loadError: 'Could not load',
      disabled: 'Disabled',
      insufficientData: 'Not enough data',
      purchasePrice: 'Purchase price',
      deposit: 'Deposit',
      remaining: 'Remaining price',
      extraCosts: 'Extra costs',
      initialFunds: 'Initial funds',
      unknown: '—',
      disclaimer: 'Deposit is part of the price',
    },
  },
};

describe('DepositCalculator', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows deposit without treating it as an extra cost on the price', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              status: 'ok',
              countryCode: 'BG',
              currency: 'EUR',
              purchasePrice: 200_000,
              depositPercent: 10,
              depositAmount: 20_000,
              remainingPrice: 180_000,
              extraCosts: [],
              extraCostsTotal: 6500,
              initialFunds: 26_500,
              warning: null,
              disclaimer: 'x',
            },
          }),
      }),
    );

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <DepositCalculator slug="demo" price={200_000} currency="EUR" />
      </NextIntlClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('deposit-calculator-result')).toBeInTheDocument();
    });
    expect(screen.getByTestId('deposit-calculator-purchase-price')).toHaveTextContent('200');
    expect(screen.getByTestId('deposit-calculator-deposit')).toHaveTextContent('20');
    expect(screen.getByTestId('deposit-calculator-remaining')).toHaveTextContent('180');
    expect(screen.getByTestId('deposit-calculator-disclaimer')).toHaveTextContent(
      'Deposit is part of the price',
    );
  });
});

/** @vitest-environment jsdom */
import { render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AcquisitionCalculator } from '@/components/property/AcquisitionCalculator';

const messages = {
  Property: {
    calculator: {
      title: 'Acquisition estimate',
      lead: 'Lead',
      loading: 'Calculating…',
      loadError: 'Could not load',
      disabled: 'Disabled',
      insufficientData: 'Not enough data',
      purchasePrice: 'Purchase price',
      costsTotal: 'Costs',
      total: 'Total',
      assumed: 'assumed',
      unknown: '—',
      disclaimer: 'Indicative only',
    },
  },
};

describe('AcquisitionCalculator', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows purchase price separate from fees', async () => {
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
              costs: [
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
              costsTotal: 6500,
              totalAcquisition: 206_500,
              warning: null,
              disclaimer: 'x',
            },
          }),
      }),
    );

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <AcquisitionCalculator slug="demo" price={200_000} currency="EUR" />
      </NextIntlClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('acquisition-calculator-result')).toBeInTheDocument();
    });
    expect(screen.getByText('Purchase price')).toBeInTheDocument();
    expect(screen.getByText('Transfer tax')).toBeInTheDocument();
    expect(screen.getByText('Notary')).toBeInTheDocument();
    expect(screen.getByTestId('acquisition-calculator-disclaimer')).toHaveTextContent(
      'Indicative only',
    );
  });
});

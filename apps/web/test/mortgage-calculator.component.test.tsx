/** @vitest-environment jsdom */
import { render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MortgageCalculator } from '@/components/property/MortgageCalculator';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const messages = {
  Property: {
    mortgageCalculator: {
      title: 'Indicative mortgage',
      lead: 'Lead',
      loading: 'Calculating…',
      loadError: 'Could not load',
      disabled: 'Disabled',
      insufficientData: 'Not enough data',
      downPayment: 'Down payment',
      loanAmount: 'Loan',
      rate: 'Rate',
      term: 'Term',
      termYears: '{years} years',
      monthly: 'Monthly',
      totalInterest: 'Interest',
      unknown: '—',
      disclaimer: 'Not guaranteed',
      ctaLead: 'Speak with:',
      ctaProfile: 'View profile',
    },
  },
};

describe('MortgageCalculator', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows monthly payment, disclaimer and consultant CTA', async () => {
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
              downPayment: 20_000,
              loanAmount: 180_000,
              termYears: 25,
              annualRatePercent: 3.5,
              monthlyPayment: 901.12,
              totalPayments: 270_336,
              totalInterest: 90_336,
              consultant: {
                name: 'Demo Credit Consultant',
                email: 'credit@example.com',
                phone: '+359 000 000 004',
                slug: 'demo-credit-consultant',
              },
              warning: null,
              disclaimer: 'x',
            },
          }),
      }),
    );

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <MortgageCalculator slug="demo" price={200_000} currency="EUR" />
      </NextIntlClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('mortgage-calculator-result')).toBeInTheDocument();
    });
    expect(screen.getByTestId('mortgage-calculator-monthly')).toHaveTextContent('901');
    expect(screen.getByTestId('mortgage-calculator-disclaimer')).toHaveTextContent(
      'Not guaranteed',
    );
    expect(screen.getByTestId('mortgage-calculator-cta')).toHaveTextContent(
      'Demo Credit Consultant',
    );
  });
});

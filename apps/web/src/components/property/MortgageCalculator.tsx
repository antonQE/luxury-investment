'use client';

import type { MortgageEstimate } from '@luxury-investment/shared';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Link } from '@/i18n/navigation';

interface MortgageCalculatorProps {
  slug: string;
  price: number;
  currency: string;
}

function formatMoney(locale: string, amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(locale === 'bg' ? 'bg-BG' : 'en-GB', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${String(amount)} ${currency}`;
  }
}

export function MortgageCalculator({ slug, price, currency }: MortgageCalculatorProps) {
  const t = useTranslations('Property.mortgageCalculator');
  const locale = useLocale();
  const [estimate, setEstimate] = useState<MortgageEstimate | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
    const params = new URLSearchParams({ lang: locale, price: String(price) });
    void fetch(
      `${base}/v1/public/properties/${encodeURIComponent(slug)}/mortgage-estimate?${params.toString()}`,
      { headers: { accept: 'application/json' } },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error('failed');
        const body = (await response.json()) as { data: MortgageEstimate };
        if (!cancelled) {
          setEstimate(body.data);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEstimate(null);
          setError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug, price, locale]);

  const money = (amount: number) => formatMoney(locale, amount, estimate?.currency ?? currency);

  return (
    <section className="mt-8 border-t border-line pt-6 no-print" data-testid="mortgage-calculator">
      <h2 className="font-serif text-xl">{t('title')}</h2>
      <p className="mt-2 text-sm text-ink-soft">{t('lead')}</p>

      {error ? (
        <p className="mt-4 text-sm text-ink-soft" data-testid="mortgage-calculator-error">
          {t('loadError')}
        </p>
      ) : estimate === null ? (
        <p className="mt-4 text-sm text-ink-soft">{t('loading')}</p>
      ) : estimate.status === 'disabled' ? (
        <p className="mt-4 text-sm text-ink-soft" data-testid="mortgage-calculator-disabled">
          {t('disabled')}
        </p>
      ) : estimate.status === 'insufficient_data' ? (
        <p className="mt-4 text-sm text-ink-soft" data-testid="mortgage-calculator-insufficient">
          {t('insufficientData')}
        </p>
      ) : (
        <dl className="mt-4 space-y-2 text-sm" data-testid="mortgage-calculator-result">
          <div className="flex justify-between gap-4 border-b border-line pb-2">
            <dt className="text-ink-soft">{t('downPayment')}</dt>
            <dd>{estimate.downPayment === null ? t('unknown') : money(estimate.downPayment)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-line pb-2">
            <dt className="text-ink-soft">{t('loanAmount')}</dt>
            <dd>{estimate.loanAmount === null ? t('unknown') : money(estimate.loanAmount)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-line pb-2">
            <dt className="text-ink-soft">{t('rate')}</dt>
            <dd>
              {estimate.annualRatePercent === null
                ? t('unknown')
                : `${String(estimate.annualRatePercent)}%`}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-line pb-2">
            <dt className="text-ink-soft">{t('term')}</dt>
            <dd>
              {estimate.termYears === null
                ? t('unknown')
                : t('termYears', { years: estimate.termYears })}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-line pb-2 font-medium">
            <dt>{t('monthly')}</dt>
            <dd data-testid="mortgage-calculator-monthly">
              {estimate.monthlyPayment === null ? t('unknown') : money(estimate.monthlyPayment)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-line pb-2">
            <dt className="text-ink-soft">{t('totalInterest')}</dt>
            <dd>
              {estimate.totalInterest === null ? t('unknown') : money(estimate.totalInterest)}
            </dd>
          </div>
        </dl>
      )}

      {estimate?.warning !== null && estimate?.warning !== undefined && estimate.warning !== '' ? (
        <p className="mt-3 text-xs text-ink-soft">{estimate.warning}</p>
      ) : null}
      <p className="mt-3 text-xs text-ink-soft" data-testid="mortgage-calculator-disclaimer">
        {t('disclaimer')}
      </p>

      {estimate?.consultant !== null && estimate?.consultant !== undefined ? (
        <div className="mt-4 text-sm" data-testid="mortgage-calculator-cta">
          <p className="text-ink-soft">{t('ctaLead')}</p>
          <p className="mt-1 font-medium">{estimate.consultant.name}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {estimate.consultant.email !== null ? (
              <a
                className="underline underline-offset-2"
                href={`mailto:${estimate.consultant.email}`}
              >
                {estimate.consultant.email}
              </a>
            ) : null}
            {estimate.consultant.phone !== null ? (
              <a className="underline underline-offset-2" href={`tel:${estimate.consultant.phone}`}>
                {estimate.consultant.phone}
              </a>
            ) : null}
            {estimate.consultant.slug !== null ? (
              <Link
                className="underline underline-offset-2"
                href={`/ekip/${estimate.consultant.slug}`}
              >
                {t('ctaProfile')}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

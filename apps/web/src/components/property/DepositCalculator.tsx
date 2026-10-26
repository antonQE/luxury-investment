'use client';

import type { DepositEstimate } from '@luxury-investment/shared';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface DepositCalculatorProps {
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

export function DepositCalculator({ slug, price, currency }: DepositCalculatorProps) {
  const t = useTranslations('Property.depositCalculator');
  const locale = useLocale();
  const [estimate, setEstimate] = useState<DepositEstimate | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
    const params = new URLSearchParams({ lang: locale, price: String(price) });
    void fetch(
      `${base}/v1/public/properties/${encodeURIComponent(slug)}/deposit-estimate?${params.toString()}`,
      { headers: { accept: 'application/json' } },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error('failed');
        const body = (await response.json()) as { data: DepositEstimate };
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

  return (
    <section className="mt-8 border-t border-line pt-6 no-print" data-testid="deposit-calculator">
      <h2 className="font-serif text-xl">{t('title')}</h2>
      <p className="mt-2 text-sm text-ink-soft">{t('lead')}</p>

      {error ? (
        <p className="mt-4 text-sm text-ink-soft" data-testid="deposit-calculator-error">
          {t('loadError')}
        </p>
      ) : estimate === null ? (
        <p className="mt-4 text-sm text-ink-soft">{t('loading')}</p>
      ) : estimate.status === 'disabled' ? (
        <p className="mt-4 text-sm text-ink-soft" data-testid="deposit-calculator-disabled">
          {t('disabled')}
        </p>
      ) : estimate.status === 'insufficient_data' ? (
        <p className="mt-4 text-sm text-ink-soft" data-testid="deposit-calculator-insufficient">
          {t('insufficientData')}
        </p>
      ) : (
        <dl className="mt-4 space-y-2 text-sm" data-testid="deposit-calculator-result">
          <div className="flex justify-between gap-4 border-b border-line pb-2">
            <dt className="text-ink-soft">{t('purchasePrice')}</dt>
            <dd data-testid="deposit-calculator-purchase-price">
              {formatMoney(locale, estimate.purchasePrice, estimate.currency || currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-line pb-2">
            <dt className="text-ink-soft">
              {t('deposit')}
              {estimate.depositPercent !== null ? ` (${String(estimate.depositPercent)}%)` : ''}
            </dt>
            <dd data-testid="deposit-calculator-deposit">
              {estimate.depositAmount === null
                ? t('unknown')
                : formatMoney(locale, estimate.depositAmount, estimate.currency || currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-line pb-2">
            <dt className="text-ink-soft">{t('remaining')}</dt>
            <dd data-testid="deposit-calculator-remaining">
              {estimate.remainingPrice === null
                ? t('unknown')
                : formatMoney(locale, estimate.remainingPrice, estimate.currency || currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-line pb-2">
            <dt className="text-ink-soft">{t('extraCosts')}</dt>
            <dd>
              {estimate.extraCostsTotal === null
                ? t('unknown')
                : formatMoney(locale, estimate.extraCostsTotal, estimate.currency || currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 pt-1 font-serif text-lg">
            <dt>{t('initialFunds')}</dt>
            <dd data-testid="deposit-calculator-initial-funds">
              {estimate.initialFunds === null
                ? t('unknown')
                : formatMoney(locale, estimate.initialFunds, estimate.currency || currency)}
            </dd>
          </div>
        </dl>
      )}

      {estimate?.warning !== null && estimate?.warning !== undefined && estimate.warning !== '' ? (
        <p className="mt-3 text-xs text-ink-soft">{estimate.warning}</p>
      ) : null}
      <p className="mt-3 text-xs text-ink-soft" data-testid="deposit-calculator-disclaimer">
        {t('disclaimer')}
      </p>
    </section>
  );
}

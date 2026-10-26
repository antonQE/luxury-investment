'use client';

import type { AcquisitionEstimate } from '@luxury-investment/shared';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface AcquisitionCalculatorProps {
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

export function AcquisitionCalculator({ slug, price, currency }: AcquisitionCalculatorProps) {
  const t = useTranslations('Property.calculator');
  const locale = useLocale();
  const [estimate, setEstimate] = useState<AcquisitionEstimate | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
    const params = new URLSearchParams({ lang: locale, price: String(price) });
    void fetch(
      `${base}/v1/public/properties/${encodeURIComponent(slug)}/acquisition-estimate?${params.toString()}`,
      { headers: { accept: 'application/json' } },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error('failed');
        const body = (await response.json()) as { data: AcquisitionEstimate };
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
    <section
      className="mt-8 border-t border-line pt-6 no-print"
      data-testid="acquisition-calculator"
    >
      <h2 className="font-serif text-xl">{t('title')}</h2>
      <p className="mt-2 text-sm text-ink-soft">{t('lead')}</p>

      {error ? (
        <p className="mt-4 text-sm text-ink-soft" data-testid="acquisition-calculator-error">
          {t('loadError')}
        </p>
      ) : estimate === null ? (
        <p className="mt-4 text-sm text-ink-soft">{t('loading')}</p>
      ) : estimate.status === 'disabled' ? (
        <p className="mt-4 text-sm text-ink-soft" data-testid="acquisition-calculator-disabled">
          {t('disabled')}
        </p>
      ) : estimate.status === 'insufficient_data' ? (
        <p className="mt-4 text-sm text-ink-soft" data-testid="acquisition-calculator-insufficient">
          {t('insufficientData')}
        </p>
      ) : (
        <dl className="mt-4 space-y-2 text-sm" data-testid="acquisition-calculator-result">
          <div className="flex justify-between gap-4 border-b border-line pb-2">
            <dt className="text-ink-soft">{t('purchasePrice')}</dt>
            <dd>{formatMoney(locale, estimate.purchasePrice, estimate.currency || currency)}</dd>
          </div>
          {estimate.costs.map((line) => (
            <div
              key={line.costGroup}
              className="flex justify-between gap-4 border-b border-line pb-2"
            >
              <dt className="text-ink-soft">
                {line.label}
                {line.status === 'assumed' ? ` (${t('assumed')})` : ''}
              </dt>
              <dd>
                {line.amount === null
                  ? t('unknown')
                  : formatMoney(locale, line.amount, estimate.currency || currency)}
              </dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 border-b border-line pb-2 font-medium">
            <dt>{t('costsTotal')}</dt>
            <dd>
              {estimate.costsTotal === null
                ? t('unknown')
                : formatMoney(locale, estimate.costsTotal, estimate.currency || currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 pt-1 font-serif text-lg">
            <dt>{t('total')}</dt>
            <dd>
              {estimate.totalAcquisition === null
                ? t('unknown')
                : formatMoney(locale, estimate.totalAcquisition, estimate.currency || currency)}
            </dd>
          </div>
        </dl>
      )}

      {estimate?.warning !== null && estimate?.warning !== undefined && estimate.warning !== '' ? (
        <p className="mt-3 text-xs text-ink-soft">{estimate.warning}</p>
      ) : null}
      <p className="mt-3 text-xs text-ink-soft" data-testid="acquisition-calculator-disclaimer">
        {t('disclaimer')}
      </p>
    </section>
  );
}

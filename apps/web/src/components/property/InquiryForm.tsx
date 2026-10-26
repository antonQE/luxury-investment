'use client';

import { PROPERTY_INQUIRY_TYPES, type PropertyInquiryType } from '@luxury-investment/shared';
import { useTranslations } from 'next-intl';
import { type SyntheticEvent, useState } from 'react';

import { Link } from '@/i18n/navigation';
import { postInquiry } from '@/lib/api/post-inquiry';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function InquiryForm({ propertySlug }: { propertySlug: string }) {
  const t = useTranslations('Inquiry');
  const [type, setType] = useState<PropertyInquiryType>('inquiry');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus('submitting');
    const form = new FormData(event.currentTarget);
    try {
      await postInquiry({
        type,
        propertySlug,
        name: form.get('name'),
        email: form.get('email'),
        phone: form.get('phone'),
        message: form.get('message'),
        consent: form.get('consent') === 'on',
        website: form.get('website') ?? '',
      });
      setStatus('success');
      event.currentTarget.reset();
      setType('inquiry');
    } catch {
      setStatus('error');
      setError(t('error'));
    }
  }

  if (status === 'success') {
    return (
      <p className="border border-line bg-paper p-4 text-sm" data-testid="inquiry-success">
        {t('success')}
      </p>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className="grid gap-3 border border-line bg-paper p-4"
      data-testid="inquiry-form"
    >
      <p className="text-xs tracking-[0.2em] uppercase text-brass">{t('title')}</p>
      <div className="flex flex-wrap gap-3 text-sm">
        {PROPERTY_INQUIRY_TYPES.map((value) => (
          <label key={value} className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              checked={type === value}
              onChange={() => {
                setType(value);
              }}
              data-testid={`inquiry-type-${value}`}
            />
            {t(value)}
          </label>
        ))}
      </div>
      <label className="grid gap-1 text-xs uppercase tracking-wide text-ink-soft">
        {t('name')}
        <input
          name="name"
          required
          className="border border-line bg-paper px-3 py-2 text-sm text-ink"
          data-testid="inquiry-name"
        />
      </label>
      <label className="grid gap-1 text-xs uppercase tracking-wide text-ink-soft">
        {t('email')}
        <input
          name="email"
          type="email"
          required
          className="border border-line bg-paper px-3 py-2 text-sm text-ink"
          data-testid="inquiry-email"
        />
      </label>
      <label className="grid gap-1 text-xs uppercase tracking-wide text-ink-soft">
        {t('phone')}
        <input
          name="phone"
          required
          className="border border-line bg-paper px-3 py-2 text-sm text-ink"
          data-testid="inquiry-phone"
        />
      </label>
      <label className="grid gap-1 text-xs uppercase tracking-wide text-ink-soft">
        {t('message')}
        <textarea
          name="message"
          required
          rows={4}
          className="border border-line bg-paper px-3 py-2 text-sm text-ink"
          data-testid="inquiry-message"
        />
      </label>
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
        data-testid="inquiry-honeypot"
      />
      <label className="flex items-start gap-2 text-sm text-ink-soft">
        <input
          name="consent"
          type="checkbox"
          required
          className="mt-1"
          data-testid="inquiry-consent"
        />
        <span>
          {t('consent')}{' '}
          <Link
            href="/stranici/privacy"
            className="underline underline-offset-2 hover:text-brass-dark"
          >
            {t('privacyLink')}
          </Link>
        </span>
      </label>
      {error !== null ? (
        <p className="text-sm text-red-800" data-testid="inquiry-error">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="bg-ink px-4 py-2 text-sm tracking-[0.15em] uppercase text-stone transition hover:bg-brass-dark disabled:opacity-60"
        data-testid="inquiry-submit"
      >
        {status === 'submitting' ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}

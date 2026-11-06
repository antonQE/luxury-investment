'use client';

import { useTranslations } from 'next-intl';
import { type SyntheticEvent, useState } from 'react';

import { Link } from '@/i18n/navigation';
import { postInquiry } from '@/lib/api/post-inquiry';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function LandingCtaForm(props: {
  landingSlug: string;
  campaignKey: string;
  inquirySource?: string;
  submitLabel: string;
}) {
  const t = useTranslations('Consultation');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus('submitting');
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await postInquiry({
        type: 'consultation',
        propertySlug: props.landingSlug,
        name: form.get('name'),
        email: form.get('email'),
        phone: form.get('phone'),
        message: form.get('message'),
        consent: form.get('consent') === 'on',
        website: form.get('website') ?? '',
        source: 'landing',
        utmSource: 'landing',
        utmMedium: 'campaign',
        utmCampaign: props.campaignKey || props.landingSlug,
        utmContent: props.inquirySource ?? 'cta_form',
      });
      setStatus('success');
      formElement.reset();
    } catch {
      setStatus('error');
      setError(t('error'));
    }
  }

  if (status === 'success') {
    return (
      <p className="border border-line bg-paper p-4 text-sm" data-testid="landing-cta-success">
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
      data-testid="landing-cta-form"
    >
      <label className="grid gap-1 text-sm">
        <span>{t('name')}</span>
        <input
          name="name"
          required
          minLength={2}
          className="border border-line bg-transparent px-3 py-2"
          data-testid="landing-cta-name"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span>{t('email')}</span>
        <input
          name="email"
          type="email"
          required
          className="border border-line bg-transparent px-3 py-2"
          data-testid="landing-cta-email"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span>{t('phone')}</span>
        <input
          name="phone"
          required
          minLength={6}
          className="border border-line bg-transparent px-3 py-2"
          data-testid="landing-cta-phone"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span>{t('message')}</span>
        <textarea
          name="message"
          required
          rows={4}
          className="border border-line bg-transparent px-3 py-2"
          data-testid="landing-cta-message"
        />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input name="consent" type="checkbox" required className="mt-1" />
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
      <input
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />
      {error !== null ? (
        <p className="text-sm text-red-800" data-testid="landing-cta-error">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="justify-self-start bg-brass px-5 py-2 text-sm tracking-wide text-void uppercase transition hover:bg-brass-dark disabled:opacity-60"
        data-testid="landing-cta-submit"
      >
        {status === 'submitting' ? t('submitting') : props.submitLabel || t('submit')}
      </button>
    </form>
  );
}

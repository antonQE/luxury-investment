'use client';

import { useTranslations } from 'next-intl';
import { type SyntheticEvent, useState } from 'react';

import { Link } from '@/i18n/navigation';
import { postInquiry } from '@/lib/api/post-inquiry';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const SEARCH_REQUEST_SLUG = 'search-request';

export function SearchRequestForm({ filterSummary }: { filterSummary: string }) {
  const t = useTranslations('SearchRequest');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus('submitting');
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const rawMessage = form.get('message');
    const userMessage = typeof rawMessage === 'string' ? rawMessage.trim() : '';
    const message =
      filterSummary.trim() === ''
        ? userMessage
        : `${userMessage}\n\n---\n${t('filtersLabel')}: ${filterSummary}`;

    try {
      await postInquiry({
        type: 'inquiry',
        propertySlug: SEARCH_REQUEST_SLUG,
        name: form.get('name'),
        email: form.get('email'),
        phone: form.get('phone'),
        message,
        consent: form.get('consent') === 'on',
        website: form.get('website') ?? '',
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
      <p
        className="border border-line bg-paper p-4 text-sm text-left"
        data-testid="search-request-success"
      >
        {t('success')}
      </p>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className="mt-8 grid gap-3 border border-line bg-paper p-4 text-left"
      data-testid="search-request-form"
    >
      <p className="text-xs tracking-[0.2em] uppercase text-brass">{t('title')}</p>
      {filterSummary.trim() !== '' ? (
        <p className="text-xs text-ink-soft" data-testid="search-request-filters">
          {t('filtersLabel')}: {filterSummary}
        </p>
      ) : null}
      <label className="grid gap-1 text-sm">
        <span>{t('name')}</span>
        <input
          name="name"
          required
          minLength={2}
          className="border border-line bg-transparent px-3 py-2"
          data-testid="search-request-name"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span>{t('email')}</span>
        <input
          name="email"
          type="email"
          required
          className="border border-line bg-transparent px-3 py-2"
          data-testid="search-request-email"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span>{t('phone')}</span>
        <input
          name="phone"
          required
          minLength={6}
          className="border border-line bg-transparent px-3 py-2"
          data-testid="search-request-phone"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span>{t('message')}</span>
        <textarea
          name="message"
          required
          rows={3}
          className="border border-line bg-transparent px-3 py-2"
          data-testid="search-request-message"
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
        <p className="text-sm text-red-800" data-testid="search-request-error">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="justify-self-start bg-brass px-5 py-2 text-sm tracking-wide text-void uppercase transition hover:bg-brass-dark disabled:opacity-60"
        data-testid="search-request-submit"
      >
        {status === 'submitting' ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}

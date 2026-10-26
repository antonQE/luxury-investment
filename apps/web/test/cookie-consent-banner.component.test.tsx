// @vitest-environment jsdom

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { CookieConsentBanner } from '@/components/consent/CookieConsentBanner';
import { CONSENT_OPEN_EVENT, CONSENT_STORAGE_KEY } from '@/lib/consent/storage';

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('accepts all and hides the banner without looping', async () => {
    const user = userEvent.setup();
    const { container } = render(<CookieConsentBanner />);

    expect(screen.getByTestId('cookie-consent-banner')).toBeInTheDocument();
    await user.click(screen.getByTestId('cookie-accept-all'));

    expect(screen.queryByTestId('cookie-consent-banner')).not.toBeInTheDocument();
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toContain('"analytics":true');
    expect(container).toMatchSnapshot();
  });

  it('necessary-only stores analytics false and settings reopen the banner', async () => {
    const user = userEvent.setup();
    render(<CookieConsentBanner />);

    await user.click(screen.getByTestId('cookie-necessary-only'));
    expect(screen.queryByTestId('cookie-consent-banner')).not.toBeInTheDocument();
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toContain('"analytics":false');

    act(() => {
      window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
    });
    expect(screen.getByTestId('cookie-consent-banner')).toBeInTheDocument();
  });
});

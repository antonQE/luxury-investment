// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { postInquiry } = vi.hoisted(() => ({ postInquiry: vi.fn() }));

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

vi.mock('@/lib/api/post-inquiry', () => ({
  postInquiry,
}));

import { InquiryForm } from '@/components/property/InquiryForm';

function fillInquiry() {
  fireEvent.change(screen.getByTestId('inquiry-name'), { target: { value: 'Ada' } });
  fireEvent.change(screen.getByTestId('inquiry-email'), { target: { value: 'ada@example.com' } });
  fireEvent.change(screen.getByTestId('inquiry-phone'), { target: { value: '+359111' } });
  fireEvent.change(screen.getByTestId('inquiry-message'), { target: { value: 'Please call me' } });
  fireEvent.click(screen.getByTestId('inquiry-consent'));
}

describe('InquiryForm', () => {
  beforeEach(() => {
    postInquiry.mockReset();
  });

  it('submits a valid inquiry and shows success', async () => {
    postInquiry.mockResolvedValue(undefined);
    render(<InquiryForm propertySlug="demo-apartment" />);
    fillInquiry();
    fireEvent.submit(screen.getByTestId('inquiry-form'));

    await waitFor(() => {
      expect(screen.getByTestId('inquiry-success')).toBeInTheDocument();
    });
    expect(postInquiry).toHaveBeenCalledWith(
      expect.objectContaining({
        propertySlug: 'demo-apartment',
        name: 'Ada',
        email: 'ada@example.com',
        consent: true,
        website: '',
      }),
    );
  });

  it('shows error when the API fails', async () => {
    postInquiry.mockRejectedValue(new Error('fail'));
    render(<InquiryForm propertySlug="demo-apartment" />);
    fillInquiry();
    fireEvent.submit(screen.getByTestId('inquiry-form'));

    await waitFor(() => {
      expect(screen.getByTestId('inquiry-error')).toHaveTextContent('error');
    });
  });

  it('keeps the honeypot field empty for real users', () => {
    render(<InquiryForm propertySlug="demo-apartment" />);
    expect(screen.getByTestId('inquiry-honeypot')).toHaveValue('');
  });
});

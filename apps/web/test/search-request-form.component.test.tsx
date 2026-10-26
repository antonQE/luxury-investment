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

import { SearchRequestForm } from '@/components/search/SearchRequestForm';

describe('SearchRequestForm', () => {
  beforeEach(() => {
    postInquiry.mockReset();
  });

  it('shows filter summary and appends it to the message on submit', async () => {
    postInquiry.mockResolvedValue(undefined);
    render(<SearchRequestForm filterSummary="city=Nowhere" />);

    expect(screen.getByTestId('search-request-filters')).toHaveTextContent('city=Nowhere');

    fireEvent.change(screen.getByTestId('search-request-name'), { target: { value: 'Bojan' } });
    fireEvent.change(screen.getByTestId('search-request-email'), {
      target: { value: 'bo@example.com' },
    });
    fireEvent.change(screen.getByTestId('search-request-phone'), { target: { value: '+359222' } });
    fireEvent.change(screen.getByTestId('search-request-message'), {
      target: { value: 'Need help' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.submit(screen.getByTestId('search-request-form'));

    await waitFor(() => {
      expect(screen.getByTestId('search-request-success')).toBeInTheDocument();
    });
    expect(postInquiry).toHaveBeenCalledWith(
      expect.objectContaining({
        propertySlug: 'search-request',
        message: expect.stringContaining('city=Nowhere') as string,
      }),
    );
  });
});

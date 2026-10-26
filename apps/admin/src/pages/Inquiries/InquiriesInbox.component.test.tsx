// @vitest-environment jsdom

import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { theme } from '@/config/theme';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/api/endpoints/inquiries', () => ({
  inquiryKeys: { list: () => ['inquiries'] as const },
  fetchAdminInquiries: () =>
    Promise.resolve([
      {
        id: 'inq-1',
        type: 'inquiry',
        propertySlug: 'demo-apartment',
        name: 'Ivan',
        email: 'ivan@example.com',
        phone: '+359',
        message: 'Hello',
        status: 'new',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]),
  updateAdminInquiryStatus: vi.fn(),
}));

import InquiriesInbox from './InquiriesInbox';

describe('InquiriesInbox', () => {
  it('renders rows from the API', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <ChakraProvider value={theme}>
        <QueryClientProvider client={client}>
          <InquiriesInbox />
        </QueryClientProvider>
      </ChakraProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('inquiries-table')).toBeInTheDocument();
    });
    expect(screen.getByText('Ivan')).toBeInTheDocument();
    expect(screen.getByText('ivan@example.com')).toBeInTheDocument();
  });
});

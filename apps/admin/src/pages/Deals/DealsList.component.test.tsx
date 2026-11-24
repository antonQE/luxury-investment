// @vitest-environment jsdom

import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { theme } from '@/config/theme';

interface AuthUser {
  id: string;
  displayName: string;
  permissions: string[];
}

const { createAdminDeal, authState } = vi.hoisted(() => {
  const state: { user: AuthUser | null } = {
    user: {
      id: 'user-agent-1',
      displayName: 'Demo Agent',
      permissions: [],
    },
  };
  return { createAdminDeal: vi.fn(), authState: state };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: authState.user,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('@/api/endpoints/deals', () => ({
  dealKeys: { list: () => ['deals'] as const },
  fetchAdminDeals: () => Promise.resolve([]),
  createAdminDeal,
  updateAdminDeal: vi.fn(),
}));

vi.mock('@/api/endpoints/properties', () => ({
  propertyKeys: { list: () => ['properties'] as const },
  fetchAdminProperties: () =>
    Promise.resolve([
      {
        id: 'prop-1',
        referenceNumber: 'LI-001',
        titleBg: 'Апартамент',
        responsibleAgentUserId: null,
        agentName: '',
      },
    ]),
}));

vi.mock('@/api/endpoints/contacts', () => ({
  contactKeys: { list: () => ['contacts'] as const },
  fetchAdminContacts: () => Promise.resolve([{ id: 'contact-1', displayName: 'Buyer One' }]),
}));

import DealsList from './DealsList';

function renderDeals() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <ChakraProvider value={theme}>
      <QueryClientProvider client={client}>
        <DealsList />
      </QueryClientProvider>
    </ChakraProvider>,
  );
}

describe('DealsList agent', () => {
  beforeEach(() => {
    createAdminDeal.mockReset();
    createAdminDeal.mockResolvedValue({ id: 'deal-1' });
    authState.user = {
      id: 'user-agent-1',
      displayName: 'Demo Agent',
      permissions: [],
    };
  });

  it('defaults the agent select to the signed-in user', async () => {
    renderDeals();
    const page = within(screen.getByTestId('deals-admin-page'));

    await waitFor(() => {
      expect(page.getByTestId('deal-agent')).toHaveValue('user-agent-1');
    });
  });

  it('shows agentRequired when submit has no resolvable agent', async () => {
    authState.user = null;
    renderDeals();
    const page = within(screen.getByTestId('deals-admin-page'));

    await waitFor(() => {
      expect(page.getByTestId('deal-agent')).toHaveValue('');
    });

    // Bypass native required checks; assert our effectiveAgentId guard.
    const form = page.getByTestId('deal-create-submit').closest('form');
    if (!(form instanceof HTMLFormElement)) throw new Error('expected form');
    fireEvent(form, new Event('submit', { bubbles: true, cancelable: true }));

    await waitFor(() => {
      expect(page.getByText('deals.agentRequired')).toBeInTheDocument();
    });
    expect(createAdminDeal).not.toHaveBeenCalled();
  });
});

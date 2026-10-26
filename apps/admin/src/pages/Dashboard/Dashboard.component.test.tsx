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

const { fetchHealth } = vi.hoisted(() => ({ fetchHealth: vi.fn() }));

vi.mock('@/api/endpoints/health', () => ({
  healthKeys: { status: () => ['health'] as const },
  fetchHealth,
}));

import Dashboard from './Dashboard';

function renderDashboard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <ChakraProvider value={theme}>
      <QueryClientProvider client={client}>
        <Dashboard />
      </QueryClientProvider>
    </ChakraProvider>,
  );
}

describe('Dashboard health card', () => {
  it('shows loading then ok status', async () => {
    fetchHealth.mockResolvedValue({
      status: 'ok',
      version: '0.1.0',
      components: { db: 'up' },
    });
    renderDashboard();
    expect(screen.getByTestId('api-health-loading')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('api-health-status')).toHaveTextContent('ok');
    });
  });

  it('shows error when health fails', async () => {
    fetchHealth.mockRejectedValue(new Error('offline'));
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByTestId('api-health-error')).toBeInTheDocument();
    });
  });
});

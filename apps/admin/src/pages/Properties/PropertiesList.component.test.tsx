// @vitest-environment jsdom

import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { theme } from '@/config/theme';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/api/endpoints/properties', () => ({
  propertyKeys: { list: () => ['properties'] as const },
  fetchAdminProperties: () =>
    Promise.resolve([
      {
        id: 'prop-1',
        slug: 'named-broker',
        referenceNumber: 'LI-001',
        titleBg: 'Апартамент',
        market: 'sofia',
        listingStatus: 'published',
        agentName: 'Ivan Petrov',
      },
      {
        id: 'prop-2',
        slug: 'blank-broker',
        referenceNumber: 'LI-002',
        titleBg: 'Къща',
        market: 'sofia',
        listingStatus: 'draft',
        agentName: '   ',
      },
      {
        id: 'prop-3',
        slug: 'empty-broker',
        referenceNumber: 'LI-003',
        titleBg: 'Парцел',
        market: 'sofia',
        listingStatus: 'draft',
        agentName: '',
      },
    ]),
}));

vi.mock('@/api/endpoints/analytics', () => ({
  analyticsKeys: { propertyViews: (ids: string[]) => ['property-views', ids] as const },
  fetchPropertyViewStats: () =>
    Promise.resolve([{ propertyId: 'prop-1', viewsTotal: 7, viewsUnique: 3 }]),
}));

import PropertiesList from './PropertiesList';

function renderList() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <ChakraProvider value={theme}>
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <PropertiesList />
        </MemoryRouter>
      </QueryClientProvider>
    </ChakraProvider>,
  );
}

describe('PropertiesList broker column', () => {
  it('shows the broker header between market and views', async () => {
    renderList();
    const table = await screen.findByTestId('properties-table');
    const headers = within(table)
      .getAllByRole('columnheader')
      .map((h) => h.textContent);
    expect(headers).toEqual([
      'properties.reference',
      'properties.titleCol',
      'properties.status',
      'properties.market',
      'properties.broker',
      'properties.viewsTotal',
      'properties.viewsUnique',
      '',
    ]);
  });

  it('shows the broker name for a property with a broker', async () => {
    renderList();
    expect(await screen.findByTestId('property-broker-named-broker')).toHaveTextContent(
      'Ivan Petrov',
    );
  });

  it('shows a dash for empty or blank broker names', async () => {
    renderList();
    expect(await screen.findByTestId('property-broker-empty-broker')).toHaveTextContent('—');
    expect(screen.getByTestId('property-broker-blank-broker')).toHaveTextContent('—');
  });

  it('keeps the other columns, views and edit links', async () => {
    renderList();
    const row = (await screen.findByTestId('property-broker-named-broker')).closest('tr');
    if (!row) throw new Error('expected table row');
    const cells = within(row);
    expect(cells.getByText('LI-001')).toBeInTheDocument();
    expect(cells.getByText('Апартамент')).toBeInTheDocument();
    expect(cells.getByText('sofia')).toBeInTheDocument();
    expect(cells.getByTestId('property-edit-named-broker')).toBeInTheDocument();
    await waitFor(() => {
      expect(cells.getByTestId('property-views-total-named-broker')).toHaveTextContent('7');
    });
    expect(cells.getByTestId('property-views-unique-named-broker')).toHaveTextContent('3');
  });
});

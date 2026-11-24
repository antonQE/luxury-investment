// @vitest-environment jsdom

import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { theme } from '@/config/theme';
import { ROUTES } from '@/constants/routes';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

import { TasksSectionNav } from './TasksSectionNav';

describe('TasksSectionNav', () => {
  it('renders the three task tabs', () => {
    render(
      <ChakraProvider value={theme}>
        <MemoryRouter initialEntries={[ROUTES.STUDIO]}>
          <Routes>
            <Route path="*" element={<TasksSectionNav />} />
          </Routes>
        </MemoryRouter>
      </ChakraProvider>,
    );

    expect(screen.getByTestId('tasks-section-nav')).toBeInTheDocument();
    expect(screen.getByTestId('tasks-tab-marketing')).toBeInTheDocument();
    expect(screen.getByTestId('tasks-tab-studio')).toBeInTheDocument();
    expect(screen.getByTestId('tasks-tab-crm')).toBeInTheDocument();
  });
});

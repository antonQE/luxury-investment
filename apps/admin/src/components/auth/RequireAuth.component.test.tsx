// @vitest-environment jsdom

import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { theme } from '@/config/theme';
import { ROUTES } from '@/constants/routes';

const authState = vi.hoisted(() => ({
  user: null as { id: string; email: string } | null,
  loading: false,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: authState.user,
    loading: authState.loading,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

import { RequireAuth } from './RequireAuth';

function renderGuard() {
  return render(
    <ChakraProvider value={theme}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<div data-testid="login-destination">Login</div>} />
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<div data-testid="protected">OK</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  );
}

describe('RequireAuth', () => {
  it('shows loading while auth is resolving', () => {
    authState.loading = true;
    authState.user = null;
    renderGuard();
    expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
  });

  it('redirects to login when logged out', () => {
    authState.loading = false;
    authState.user = null;
    renderGuard();
    expect(screen.getByTestId('login-destination')).toBeInTheDocument();
    expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
  });

  it('renders the outlet when authenticated', () => {
    authState.loading = false;
    authState.user = { id: '1', email: 'admin@example.com' };
    renderGuard();
    expect(screen.getByTestId('protected')).toBeInTheDocument();
  });
});

// @vitest-environment jsdom

import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { theme } from '@/config/theme';
import { ApiError } from '@/types/api';

const { login } = vi.hoisted(() => ({ login: vi.fn() }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login,
    logout: vi.fn(),
  }),
}));

import Login from './Login';

function renderLogin() {
  return render(
    <ChakraProvider value={theme}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </ChakraProvider>,
  );
}

describe('Login', () => {
  beforeEach(() => {
    login.mockReset();
  });

  it('calls login on submit', async () => {
    login.mockResolvedValue(undefined);
    renderLogin();
    const page = within(screen.getByTestId('login-page'));

    fireEvent.change(page.getByTestId('login-email'), {
      target: { value: 'admin@example.com' },
    });
    fireEvent.change(page.getByTestId('login-password'), {
      target: { value: 'DemoAdmin!234' },
    });
    const form = page.getByTestId('login-submit').closest('form');
    if (!(form instanceof HTMLFormElement)) {
      throw new Error('expected login form');
    }
    fireEvent.submit(form);

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('admin@example.com', 'DemoAdmin!234');
    });
  });

  it('shows an error when login fails', async () => {
    login.mockRejectedValue(new ApiError('unauthorized', 401));
    renderLogin();
    const page = within(screen.getByTestId('login-page'));

    fireEvent.change(page.getByTestId('login-password'), { target: { value: 'wrong' } });
    const form = page.getByTestId('login-submit').closest('form');
    if (!(form instanceof HTMLFormElement)) {
      throw new Error('expected login form');
    }
    fireEvent.submit(form);

    await waitFor(() => {
      expect(page.getByTestId('login-error')).toHaveTextContent('login.invalid');
    });
  });
});

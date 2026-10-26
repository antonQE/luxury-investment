// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => (ns ? `${ns}.${key}` : key),
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push }),
}));

import { SearchForm } from '@/components/search/SearchForm';

describe('SearchForm', () => {
  beforeEach(() => {
    push.mockReset();
  });

  it('submits selected filters as query params', () => {
    render(<SearchForm />);

    fireEvent.change(screen.getByTestId('filter-transaction'), { target: { value: 'sale' } });
    fireEvent.change(screen.getByTestId('filter-city'), { target: { value: 'Sofia' } });
    fireEvent.submit(screen.getByTestId('search-form'));

    expect(push).toHaveBeenCalledWith('/obiavi?transactionType=sale&city=Sofia');
  });

  it('hero variant omits extended fields and can navigate without filters', () => {
    render(<SearchForm variant="hero" testId="home-search" />);

    expect(screen.getByTestId('home-search')).toBeInTheDocument();
    expect(screen.queryByTestId('filter-q')).not.toBeInTheDocument();
    expect(screen.queryByTestId('filter-city')).not.toBeInTheDocument();

    fireEvent.submit(screen.getByTestId('home-search'));
    expect(push).toHaveBeenCalledWith('/obiavi');
  });
});

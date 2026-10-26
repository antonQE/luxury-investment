// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/obiavi',
}));

import { NavigationProgress } from '@/components/ui/NavigationProgress';

describe('NavigationProgress', () => {
  it('shows on internal link click', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <NavigationProgress />
        <a href="/obiavi?city=Sofia">Listings</a>
      </div>,
    );

    expect(screen.queryByTestId('nav-progress')).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Listings' }));
    expect(screen.getByTestId('nav-progress')).toBeInTheDocument();
  });
});

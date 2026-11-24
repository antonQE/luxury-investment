// @vitest-environment jsdom

import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { trackSiteEvent, usePathname } = vi.hoisted(() => ({
  trackSiteEvent: vi.fn(),
  usePathname: vi.fn(() => '/bg/imoti'),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => usePathname(),
}));

vi.mock('@/lib/analytics/track', () => ({
  trackSiteEvent,
}));

import { SiteAnalytics } from '@/components/analytics/SiteAnalytics';

describe('SiteAnalytics', () => {
  beforeEach(() => {
    trackSiteEvent.mockReset();
    usePathname.mockReturnValue('/bg/imoti');
  });

  it('sends one page_view per path and dedupes remounts of the same path', () => {
    const { rerender } = render(<SiteAnalytics />);
    expect(trackSiteEvent).toHaveBeenCalledTimes(1);
    expect(trackSiteEvent).toHaveBeenCalledWith({
      path: '/imoti',
      eventType: 'page_view',
    });

    rerender(<SiteAnalytics />);
    expect(trackSiteEvent).toHaveBeenCalledTimes(1);

    usePathname.mockReturnValue('/en/imoti/demo');
    rerender(<SiteAnalytics />);
    expect(trackSiteEvent).toHaveBeenCalledTimes(2);
    expect(trackSiteEvent).toHaveBeenLastCalledWith({
      path: '/imoti/demo',
      eventType: 'page_view',
    });
  });

  it('tracks click payload from data-analytics and href', () => {
    render(
      <>
        <SiteAnalytics />
        <a href="/contact" data-analytics="nav-contact">
          Contact
        </a>
      </>,
    );
    trackSiteEvent.mockClear();

    act(() => {
      document
        .querySelector('a')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });

    expect(trackSiteEvent).toHaveBeenCalledWith({
      path: expect.any(String) as string,
      eventType: 'click',
      label: 'nav-contact',
      href: '/contact',
    });
  });
});

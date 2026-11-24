// @vitest-environment jsdom

import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { trackPropertyEvent } = vi.hoisted(() => ({
  trackPropertyEvent: vi.fn(),
}));

vi.mock('@/lib/analytics/track', () => ({
  trackPropertyEvent,
}));

import { PropertyViewBeacon } from '@/components/analytics/PropertyViewBeacon';

describe('PropertyViewBeacon', () => {
  beforeEach(() => {
    trackPropertyEvent.mockReset();
  });

  it('sends one page_view per propertyId and resends when id changes', () => {
    const { rerender } = render(<PropertyViewBeacon propertyId="prop-a" />);
    expect(trackPropertyEvent).toHaveBeenCalledTimes(1);
    expect(trackPropertyEvent).toHaveBeenCalledWith({
      propertyId: 'prop-a',
      eventType: 'page_view',
      source: 'property_page',
    });

    rerender(<PropertyViewBeacon propertyId="prop-a" />);
    expect(trackPropertyEvent).toHaveBeenCalledTimes(1);

    rerender(<PropertyViewBeacon propertyId="prop-b" />);
    expect(trackPropertyEvent).toHaveBeenCalledTimes(2);
    expect(trackPropertyEvent).toHaveBeenLastCalledWith({
      propertyId: 'prop-b',
      eventType: 'page_view',
      source: 'property_page',
    });
  });
});

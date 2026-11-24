'use client';

import { useEffect, useRef } from 'react';

import { trackPropertyEvent } from '@/lib/analytics/track';

/** Sends one property page_view per mount (admin-only counters). */
export function PropertyViewBeacon({ propertyId }: { propertyId: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackPropertyEvent({ propertyId, eventType: 'page_view', source: 'property_page' });
  }, [propertyId]);

  return null;
}

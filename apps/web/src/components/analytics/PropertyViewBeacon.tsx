'use client';

import { useEffect, useRef } from 'react';

import { trackPropertyEvent } from '@/lib/analytics/track';

/** Sends one property page_view per propertyId (admin-only counters). */
export function PropertyViewBeacon({ propertyId }: { propertyId: string }) {
  const lastSentId = useRef<string | null>(null);

  useEffect(() => {
    if (lastSentId.current === propertyId) return;
    lastSentId.current = propertyId;
    trackPropertyEvent({ propertyId, eventType: 'page_view', source: 'property_page' });
  }, [propertyId]);

  return null;
}

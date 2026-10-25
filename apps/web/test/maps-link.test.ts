import { describe, expect, it } from 'vitest';

import { mapsSearchUrl } from '../src/lib/maps';

describe('mapsSearchUrl', () => {
  it('builds a Google Maps search URL without coordinates', () => {
    expect(mapsSearchUrl('Лозенец, София, България')).toContain(
      'https://www.google.com/maps/search/?api=1&query=',
    );
    expect(mapsSearchUrl('Лозенец, София')).not.toMatch(/lat|lng|@\d/i);
  });
});

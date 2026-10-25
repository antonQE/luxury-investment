/** Google Maps search URL from a safe text query (city/district — never raw coords). */
export function mapsSearchUrl(mapQuery: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
}

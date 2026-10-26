/** Map stored property.country labels to ISO-ish calculator country codes. */
const ALIASES: Record<string, string> = {
  bg: 'BG',
  bulgaria: 'BG',
  българия: 'BG',
  ae: 'AE',
  uae: 'AE',
  dubai: 'AE',
  'dubai & abroad': 'AE',
  оае: 'AE',
  дубай: 'AE',
  gr: 'GR',
  greece: 'GR',
  гърция: 'GR',
  cy: 'CY',
  cyprus: 'CY',
  кипър: 'CY',
};

export function resolveCountryCode(raw: string): string | null {
  const key = raw.trim().toLowerCase();
  if (key === '') return null;
  if (/^[a-z]{2}$/i.test(raw.trim())) return raw.trim().toUpperCase();
  return ALIASES[key] ?? null;
}

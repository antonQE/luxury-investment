/**
 * Legacy / alias URL → current path (with trailing slash).
 * Full WordPress map lands in EPIC-17; sample rows keep `/oferti` working.
 */
const REDIRECTS: Readonly<Record<string, string>> = {
  '/oferti': '/obiavi/',
  '/oferti/': '/obiavi/',
  '/en/oferti': '/en/obiavi/',
  '/en/oferti/': '/en/obiavi/',
  // Sample legacy property permalink → current catalog slug (demo seed).
  '/obiavi/star-demo-tristaen/': '/obiavi/demo-tristaen-malinova-dolina/',
  '/en/obiavi/star-demo-tristaen/': '/en/obiavi/demo-tristaen-malinova-dolina/',
};

/** Returns the destination pathname for a 301, or `null` if no redirect. */
export function lookupRedirect(pathname: string): string | null {
  return REDIRECTS[pathname] ?? null;
}

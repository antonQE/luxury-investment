/**
 * Legacy / alias URL → current path (with trailing slash).
 * Full WordPress map is generated during EPIC-17 import (LI-051); rows here cover
 * known section aliases from the current-site inventory until then.
 */
const REDIRECTS: Readonly<Record<string, string>> = {
  // Properties list aliases
  '/oferti': '/obiavi/',
  '/oferti/': '/obiavi/',
  '/en/oferti': '/en/obiavi/',
  '/en/oferti/': '/en/obiavi/',

  // Agents → team
  '/agent': '/ekip/',
  '/agent/': '/ekip/',
  '/en/agent': '/en/ekip/',
  '/en/agent/': '/en/ekip/',

  // News → articles
  '/novini': '/stati/',
  '/novini/': '/stati/',
  '/en/novini': '/en/stati/',
  '/en/novini/': '/en/stati/',

  // Cyrillic services path (inventory) → latin slug
  '/услуги': '/uslugi/',
  '/услуги/': '/uslugi/',
  '/en/услуги': '/en/uslugi/',
  '/en/услуги/': '/en/uslugi/',

  // Taxonomy archive aliases → filtered listings (basic: list page)
  '/kategorii': '/obiavi/',
  '/kategorii/': '/obiavi/',
  '/en/kategorii': '/en/obiavi/',
  '/en/kategorii/': '/en/obiavi/',
  '/action': '/obiavi/',
  '/action/': '/obiavi/',
  '/en/action': '/en/obiavi/',
  '/en/action/': '/en/obiavi/',
  '/grad': '/obiavi/',
  '/grad/': '/obiavi/',
  '/en/grad': '/en/obiavi/',
  '/en/grad/': '/en/obiavi/',
  '/kvartal': '/obiavi/',
  '/kvartal/': '/obiavi/',
  '/en/kvartal': '/en/obiavi/',
  '/en/kvartal/': '/en/obiavi/',

  // Sample legacy property permalink → current catalog slug (demo seed).
  '/obiavi/star-demo-tristaen/': '/obiavi/demo-tristaen-malinova-dolina/',
  '/en/obiavi/star-demo-tristaen/': '/en/obiavi/demo-tristaen-malinova-dolina/',
};

/** Returns the destination pathname for a 301, or `null` if no redirect. */
export function lookupRedirect(pathname: string): string | null {
  return REDIRECTS[pathname] ?? null;
}

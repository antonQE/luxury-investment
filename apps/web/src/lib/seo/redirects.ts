/**
 * Legacy / alias URL → current path (with trailing slash).
 * Full WordPress map is generated during EPIC-17 import (LI-051); rows here cover
 * known section aliases from the current-site inventory until then.
 */
const REDIRECTS: Readonly<Record<string, string>> = {
  // Properties list aliases
  '/oferti': '/properties/',
  '/oferti/': '/properties/',
  '/en/oferti': '/en/properties/',
  '/en/oferti/': '/en/properties/',

  // Agents → team
  '/agent': '/team/',
  '/agent/': '/team/',
  '/en/agent': '/en/team/',
  '/en/agent/': '/en/team/',

  // News → articles
  '/novini': '/articles/',
  '/novini/': '/articles/',
  '/en/novini': '/en/articles/',
  '/en/novini/': '/en/articles/',

  // Cyrillic services path (inventory) → latin slug
  '/услуги': '/services/',
  '/услуги/': '/services/',
  '/en/услуги': '/en/services/',
  '/en/услуги/': '/en/services/',

  // Taxonomy archive aliases → filtered listings (basic: list page)
  '/kategorii': '/properties/',
  '/kategorii/': '/properties/',
  '/en/kategorii': '/en/properties/',
  '/en/kategorii/': '/en/properties/',
  '/action': '/properties/',
  '/action/': '/properties/',
  '/en/action': '/en/properties/',
  '/en/action/': '/en/properties/',
  '/grad': '/properties/',
  '/grad/': '/properties/',
  '/en/grad': '/en/properties/',
  '/en/grad/': '/en/properties/',
  '/kvartal': '/properties/',
  '/kvartal/': '/properties/',
  '/en/kvartal': '/en/properties/',
  '/en/kvartal/': '/en/properties/',
};

/** Returns the destination pathname for a 301, or `null` if no redirect. */
export function lookupRedirect(pathname: string): string | null {
  return REDIRECTS[pathname] ?? null;
}

/** Shared Next.js data-cache policy for public catalog/content. */
export const PUBLIC_REVALIDATE_SECONDS = 60;

export const CACHE_TAGS = {
  properties: 'properties',
  property: (id: string) => `property:${id}`,
  team: 'team',
  content: 'content',
  siteSettings: 'site-settings',
} as const;

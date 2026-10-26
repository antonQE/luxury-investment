/** Shared Next.js data-cache policy for public catalog/content. */
export const PUBLIC_REVALIDATE_SECONDS = 60;

export const CACHE_TAGS = {
  properties: 'properties',
  property: (slug: string) => `property:${slug}`,
  team: 'team',
  content: 'content',
} as const;

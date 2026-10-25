import type { MetadataRoute } from 'next';

import { serverEnv } from '@/lib/config/env';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = serverEnv().SITE_URL.replace(/\/+$/, '');
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

import 'server-only';

import type { Locale } from '@luxury-investment/shared';
import type { Metadata } from 'next';

import { serverEnv } from '@/lib/config/env';

import { absoluteUrl, hreflangLanguages } from './paths';

const OG_LOCALE: Record<Locale, string> = {
  bg: 'bg_BG',
  en: 'en_GB',
};

export interface PageSeoInput {
  locale: Locale;
  /** Path without locale prefix, e.g. `/obiavi/demo- loft`. */
  path: string;
  title: string;
  description: string;
  /** Absolute image URL (property primary) or omit for site default OG image. */
  imageUrl?: string | null;
  type?: 'website' | 'article';
}

function defaultOgImage(siteUrl: string): string {
  return `${siteUrl.replace(/\/+$/, '')}/og-default.jpg`;
}

/** Shared title, description, canonical, hreflang and Open Graph for public pages. */
export function buildPageMetadata(input: PageSeoInput): Metadata {
  const siteUrl = serverEnv().SITE_URL;
  const canonical = absoluteUrl(siteUrl, input.locale, input.path);
  const image =
    input.imageUrl && input.imageUrl.length > 0 ? input.imageUrl : defaultOgImage(siteUrl);
  const alternateLocale = input.locale === 'bg' ? ['en_GB'] : ['bg_BG'];

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical,
      languages: hreflangLanguages(siteUrl, input.path),
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName: 'Luxury Investment',
      locale: OG_LOCALE[input.locale],
      alternateLocale,
      type: input.type ?? 'website',
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}

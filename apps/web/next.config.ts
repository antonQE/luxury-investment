import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // The current site uses trailing slashes; keeping them avoids a redirect on every old URL.
  trailingSlash: true,
  transpilePackages: ['@luxury-investment/shared'],
  poweredByHeader: false,
  agentRules: false,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' }],
  },
};

export default withNextIntl(nextConfig);

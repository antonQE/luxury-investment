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
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'luxuryinvestment.bg', pathname: '/**' },
      { protocol: 'https', hostname: 'www.luxuryinvestment.bg', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '4000', pathname: '/**' },
    ],
  },
};

export default withNextIntl(nextConfig);

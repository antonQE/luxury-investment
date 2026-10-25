import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';
import { lookupRedirect } from './lib/seo/redirects';

const handleI18n = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const destination = lookupRedirect(request.nextUrl.pathname);
  if (destination !== null) {
    const url = request.nextUrl.clone();
    url.pathname = destination;
    return NextResponse.redirect(url, 301);
  }
  return handleI18n(request);
}

export const config = {
  // Everything except API routes, Next internals and files with an extension (images, robots.txt).
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};

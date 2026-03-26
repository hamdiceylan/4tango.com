import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isValidLanguage, parseAcceptLanguage } from '@/lib/i18n';

// Paths that should skip language prefix
const SKIP_LANGUAGE_PATHS = [
  '/api',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
  '/invite',
  '/registration',
  '/dashboard',
  '/events',
  '/settings',
  '/registrations',
  '/onboarding',
  '/login',
  '/signup',
  '/check-email',
  '/verify-email',
  '/complete-profile',
  '/privacy',
  '/terms',
  '/contact',
];

function shouldSkipLanguage(pathname: string): boolean {
  return SKIP_LANGUAGE_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'));
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Clone request headers and add pathname
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // Skip language handling for certain paths
  if (shouldSkipLanguage(pathname)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Check if path already has a language prefix
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];

  if (firstSegment && isValidLanguage(firstSegment)) {
    // Path already has valid language prefix
    requestHeaders.set('x-language', firstSegment);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Root path - redirect to language-specific home
  if (pathname === '/') {
    const acceptLanguage = request.headers.get('accept-language');
    const detectedLang = parseAcceptLanguage(acceptLanguage);
    return NextResponse.redirect(new URL(`/${detectedLang}`, request.url));
  }

  // Path without language prefix (e.g., /summer-tango-2024)
  // Redirect to language-prefixed version
  const acceptLanguage = request.headers.get('accept-language');
  const detectedLang = parseAcceptLanguage(acceptLanguage);

  // Redirect to /{lang}/{current-path}
  const newUrl = new URL(`/${detectedLang}${pathname}`, request.url);
  newUrl.search = request.nextUrl.search; // Preserve query params

  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)).*)',
  ],
};

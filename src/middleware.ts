import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isValidLanguage, parseAcceptLanguage } from '@/lib/i18n';

// Platform hosts that use path-based routing
const PLATFORM_HOSTS = new Set([
  '4tango.com',
  'www.4tango.com',
  'domains.4tango.com',
  'dev.4tango.com',
  'www.dev.4tango.com',
  'localhost',
  'localhost:3000',
  '127.0.0.1',
  '127.0.0.1:3000',
]);

// Paths that should skip language prefix (main website pages)
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
  '/dancer',
  '/custom-domain-not-found',
];

function shouldSkipLanguage(pathname: string): boolean {
  // Root path should not redirect to language
  if (pathname === '/') {
    return true;
  }
  return SKIP_LANGUAGE_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'));
}

function isPlatformHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase().split(':')[0];
  return PLATFORM_HOSTS.has(normalized) || PLATFORM_HOSTS.has(hostname.toLowerCase());
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hostHeader = request.headers.get('host') || '';
  const hostname = hostHeader.split(':')[0].toLowerCase();

  // Clone request headers and add pathname
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  requestHeaders.set('x-hostname', hostname);

  // Check if this is a custom domain request
  if (!isPlatformHost(hostHeader)) {
    // This is a custom domain - resolve the event
    try {
      // Call internal API to resolve the domain
      const baseUrl = request.nextUrl.origin;
      const resolveUrl = `${baseUrl}/api/internal/resolve-domain?hostname=${encodeURIComponent(hostname)}`;

      const resolveResponse = await fetch(resolveUrl, {
        headers: {
          'x-internal-request': 'true',
        },
      });

      if (resolveResponse.ok) {
        const data = await resolveResponse.json();

        if (data.found && data.slug) {
          // Set custom domain headers
          requestHeaders.set('x-custom-domain', hostname);
          requestHeaders.set('x-event-slug', data.slug);
          requestHeaders.set('x-event-id', data.eventId || '');

          // Determine the language to use
          const defaultLang = data.defaultLanguage || 'en';

          // For root path, rewrite to the event page with default language
          if (pathname === '/' || pathname === '') {
            const newUrl = request.nextUrl.clone();
            newUrl.pathname = `/${defaultLang}/${data.slug}`;
            return NextResponse.rewrite(newUrl, {
              request: {
                headers: requestHeaders,
              },
            });
          }

          // For /register path, rewrite to event registration
          if (pathname === '/register' || pathname === '/register/') {
            const newUrl = request.nextUrl.clone();
            newUrl.pathname = `/${defaultLang}/${data.slug}/register`;
            return NextResponse.rewrite(newUrl, {
              request: {
                headers: requestHeaders,
              },
            });
          }

          // For language-prefixed paths like /en or /fr, rewrite accordingly
          const pathSegments = pathname.split('/').filter(Boolean);
          if (pathSegments.length > 0 && isValidLanguage(pathSegments[0])) {
            const lang = pathSegments[0];
            const restPath = pathSegments.slice(1).join('/');

            // If it's just the language, show the event page
            if (restPath === '' || restPath === data.slug) {
              const newUrl = request.nextUrl.clone();
              newUrl.pathname = `/${lang}/${data.slug}`;
              return NextResponse.rewrite(newUrl, {
                request: {
                  headers: requestHeaders,
                },
              });
            }

            // For /en/register, rewrite to /en/{slug}/register
            if (restPath === 'register') {
              const newUrl = request.nextUrl.clone();
              newUrl.pathname = `/${lang}/${data.slug}/register`;
              return NextResponse.rewrite(newUrl, {
                request: {
                  headers: requestHeaders,
                },
              });
            }
          }

          // For other paths, let them through with custom domain headers
          return NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
        }
      }

      // Domain not found or not active - show custom domain not found page
      const newUrl = request.nextUrl.clone();
      newUrl.pathname = '/custom-domain-not-found';
      return NextResponse.rewrite(newUrl, {
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Error resolving custom domain:', error);
      // On error, continue with normal routing but log the issue
    }
  }

  // Regular platform host routing
  // Skip language handling for main website paths
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
    // Path already has valid language prefix (e.g., /en/summer-tango)
    requestHeaders.set('x-language', firstSegment);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Path without language prefix that looks like an event slug (e.g., /summer-tango-2024)
  // Redirect to language-prefixed version for event pages
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

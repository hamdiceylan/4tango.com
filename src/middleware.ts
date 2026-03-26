import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Clone request headers and add pathname
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  // Pass modified headers to the request
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};

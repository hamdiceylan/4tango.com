// Language detection utilities

import { headers } from 'next/headers';
import { parseAcceptLanguage, type Language, DEFAULT_LANGUAGE, isValidLanguage } from './index';

// Detect language from request headers (server-side)
export async function detectLanguage(): Promise<Language> {
  try {
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language');
    return parseAcceptLanguage(acceptLanguage);
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

// Get language from URL path segment
export function getLanguageFromPath(pathname: string): Language | null {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length > 0 && isValidLanguage(segments[0])) {
    return segments[0];
  }

  return null;
}

// Remove language prefix from path
export function stripLanguageFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length > 0 && isValidLanguage(segments[0])) {
    return '/' + segments.slice(1).join('/');
  }

  return pathname;
}

// Check if path should skip language prefix (API routes, static files, etc.)
export function shouldSkipLanguagePrefix(pathname: string): boolean {
  const skipPatterns = [
    /^\/api\//,
    /^\/_next\//,
    /^\/favicon\.ico$/,
    /^\/robots\.txt$/,
    /^\/sitemap\.xml$/,
    /^\/llms\.txt$/,
    /^\/invite\//,
    /^\/registration\//,
    /^\/dashboard/,
    /^\/events/,
    /^\/settings/,
    /^\/registrations/,
    /^\/onboarding/,
    /^\/login/,
    /^\/signup/,
    /^\/check-email/,
    /^\/verify-email/,
    /^\/complete-profile/,
    /^\/privacy$/,
    /^\/terms$/,
    /^\/contact$/,
  ];

  return skipPatterns.some((pattern) => pattern.test(pathname));
}

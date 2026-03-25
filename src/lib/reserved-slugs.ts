// Reserved slugs that cannot be used as event slugs
// These are routes that exist at the root level of the application

export const RESERVED_SLUGS = [
  // Dashboard and authenticated routes
  'dashboard',
  'events',
  'settings',
  'registrations',

  // Authentication routes
  'login',
  'signup',
  'check-email',
  'logout',

  // Static pages
  'privacy',
  'terms',
  'contact',
  'about',

  // Other reserved paths
  'registration',
  'api',
  'admin',
  'fonts',

  // Common reserved words
  'new',
  'edit',
  'delete',
  'create',
  'update',
  'search',
  'help',
  'support',
] as const;

export type ReservedSlug = typeof RESERVED_SLUGS[number];

/**
 * Check if a slug is reserved and cannot be used for events
 */
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase() as ReservedSlug);
}

/**
 * Validate a slug for use as an event slug
 * Returns an error message if invalid, or null if valid
 */
export function validateEventSlug(slug: string): string | null {
  // Check if empty
  if (!slug || slug.trim() === '') {
    return 'Slug cannot be empty';
  }

  // Check minimum length
  if (slug.length < 3) {
    return 'Slug must be at least 3 characters';
  }

  // Check maximum length
  if (slug.length > 100) {
    return 'Slug must be less than 100 characters';
  }

  // Check for valid characters (lowercase letters, numbers, hyphens)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return 'Slug can only contain lowercase letters, numbers, and hyphens';
  }

  // Check if reserved
  if (isReservedSlug(slug)) {
    return `"${slug}" is a reserved word and cannot be used as an event slug`;
  }

  return null;
}

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with single
    .replace(/^-|-$/g, '')         // Remove leading/trailing hyphens
    .substring(0, 100);            // Limit length
}

/**
 * List of platform-owned hostnames that should use path-based routing
 */
export const PLATFORM_HOSTS = new Set([
  // Production
  '4tango.com',
  'www.4tango.com',
  'domains.4tango.com',
  // Development
  'dev.4tango.com',
  'www.dev.4tango.com',
  // Local development
  'localhost',
  'localhost:3000',
  '127.0.0.1',
  '127.0.0.1:3000',
]);

/**
 * The hostname that customers should CNAME to
 */
export const CUSTOM_DOMAIN_TARGET = 'domains.4tango.com';

/**
 * Check if a hostname is a platform host (not a custom domain)
 */
export function isPlatformHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase().trim();
  return PLATFORM_HOSTS.has(normalized);
}

/**
 * Add additional platform hosts at runtime (e.g., from environment variables)
 */
export function addPlatformHost(hostname: string): void {
  PLATFORM_HOSTS.add(hostname.toLowerCase().trim());
}

// Add platform hosts from environment if configured
if (process.env.NEXT_PUBLIC_URL) {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_URL);
    addPlatformHost(url.host);
    addPlatformHost(url.hostname);
  } catch {
    // Ignore invalid URLs
  }
}

/**
 * Normalize a hostname input for storage and comparison
 *
 * Handles common input formats:
 * - https://www.example.com/path -> www.example.com
 * - WWW.EXAMPLE.COM -> www.example.com
 * - www.example.com:443 -> www.example.com
 */
export function normalizeHostname(input: string): string {
  if (!input) return '';

  let hostname = input.trim();

  // Remove protocol if present
  if (hostname.startsWith('http://') || hostname.startsWith('https://')) {
    try {
      const url = new URL(hostname);
      hostname = url.hostname;
    } catch {
      // If URL parsing fails, continue with manual parsing
      hostname = hostname.replace(/^https?:\/\//, '');
    }
  }

  // Remove port if present
  hostname = hostname.split(':')[0];

  // Remove path, query string, and fragment
  hostname = hostname.split('/')[0];
  hostname = hostname.split('?')[0];
  hostname = hostname.split('#')[0];

  // Convert to lowercase
  hostname = hostname.toLowerCase();

  // Remove trailing dots
  hostname = hostname.replace(/\.+$/, '');

  // Remove leading/trailing whitespace again
  hostname = hostname.trim();

  return hostname;
}

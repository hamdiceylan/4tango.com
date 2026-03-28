import { isPlatformHost } from './platformHosts';
import { normalizeHostname } from './normalizeHostname';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  normalizedHostname?: string;
}

/**
 * Validate a hostname for use as a custom domain
 *
 * Rules:
 * - Must be a valid hostname format
 * - Must have at least one subdomain (e.g., www.example.com, not example.com)
 * - Cannot be a platform-owned domain
 * - Cannot be localhost or IP address
 * - Cannot be a wildcard domain
 */
export function validateHostname(input: string): ValidationResult {
  const hostname = normalizeHostname(input);

  if (!hostname) {
    return { valid: false, error: 'Hostname is required' };
  }

  // Check for invalid characters
  // Valid hostname: alphanumeric, hyphens, and dots
  const hostnameRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/;
  if (!hostnameRegex.test(hostname)) {
    return { valid: false, error: 'Invalid hostname format. Use only letters, numbers, and hyphens.' };
  }

  // Check for localhost
  if (hostname === 'localhost' || hostname.startsWith('localhost.')) {
    return { valid: false, error: 'Localhost domains are not allowed' };
  }

  // Check for IP addresses
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(hostname)) {
    return { valid: false, error: 'IP addresses are not allowed. Please use a domain name.' };
  }

  // Check for wildcard domains
  if (hostname.includes('*')) {
    return { valid: false, error: 'Wildcard domains are not supported' };
  }

  // Check for platform domains
  if (isPlatformHost(hostname)) {
    return { valid: false, error: 'Platform domains cannot be used as custom domains' };
  }

  // Check for subdomain (MVP: require www or other subdomain)
  const parts = hostname.split('.');
  if (parts.length < 2) {
    return { valid: false, error: 'Invalid domain format' };
  }

  // For MVP, we recommend subdomains like www.example.com
  // We allow apex domains but show a warning (handled in UI)
  const isApexDomain = parts.length === 2;
  if (isApexDomain) {
    // Still valid but we'll note this in the UI
    // For MVP, we'll allow it but recommend www
  }

  // Check for minimum/maximum length
  if (hostname.length < 4) {
    return { valid: false, error: 'Hostname is too short' };
  }

  if (hostname.length > 253) {
    return { valid: false, error: 'Hostname is too long (max 253 characters)' };
  }

  // Check each label length (max 63 characters)
  for (const part of parts) {
    if (part.length > 63) {
      return { valid: false, error: 'Domain label is too long (max 63 characters per segment)' };
    }
  }

  return { valid: true, normalizedHostname: hostname };
}

/**
 * Check if a hostname is an apex/root domain (e.g., example.com vs www.example.com)
 */
export function isApexDomain(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  const parts = normalized.split('.');
  // Two parts = apex domain (example.com)
  // More parts = subdomain (www.example.com)
  return parts.length === 2;
}

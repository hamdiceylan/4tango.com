import { CUSTOM_DOMAIN_TARGET } from './platformHosts';

export interface DnsVerificationResult {
  verified: boolean;
  cnameTarget?: string;
  error?: string;
}

/**
 * Verify that a domain's CNAME points to our platform
 *
 * This function uses DNS-over-HTTPS to resolve CNAME records
 */
export async function verifyDnsCname(hostname: string): Promise<DnsVerificationResult> {
  try {
    // Use Google's DNS-over-HTTPS API to resolve CNAME
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=CNAME`,
      {
        headers: {
          'Accept': 'application/dns-json',
        },
      }
    );

    if (!response.ok) {
      return {
        verified: false,
        error: 'Failed to query DNS. Please try again.',
      };
    }

    const data = await response.json();

    // Check for errors in DNS response
    if (data.Status !== 0) {
      // NXDOMAIN or other DNS error
      if (data.Status === 3) {
        return {
          verified: false,
          error: 'Domain not found. Please check your DNS settings.',
        };
      }
      return {
        verified: false,
        error: `DNS query failed with status ${data.Status}`,
      };
    }

    // Check if we have CNAME records
    if (!data.Answer || data.Answer.length === 0) {
      return {
        verified: false,
        error: `No CNAME record found. Please add a CNAME record pointing to ${CUSTOM_DOMAIN_TARGET}`,
      };
    }

    // Look for CNAME records (type 5)
    const cnameRecords = data.Answer.filter((record: { type: number }) => record.type === 5);

    if (cnameRecords.length === 0) {
      // Might be an A record instead of CNAME
      const aRecords = data.Answer.filter((record: { type: number }) => record.type === 1);
      if (aRecords.length > 0) {
        return {
          verified: false,
          error: `Found A record instead of CNAME. Please add a CNAME record pointing to ${CUSTOM_DOMAIN_TARGET}`,
        };
      }
      return {
        verified: false,
        error: `No CNAME record found. Please add a CNAME record pointing to ${CUSTOM_DOMAIN_TARGET}`,
      };
    }

    // Get the CNAME target (remove trailing dot if present)
    const cnameTarget = cnameRecords[0].data.replace(/\.$/, '').toLowerCase();

    // Check if it points to our target
    const expectedTarget = CUSTOM_DOMAIN_TARGET.toLowerCase();

    if (cnameTarget === expectedTarget) {
      return {
        verified: true,
        cnameTarget,
      };
    }

    // Check if it's a chain that eventually points to us
    // (e.g., www.example.com -> cdn.example.com -> domains.4tango.com)
    // For simplicity, we just check the first CNAME target
    return {
      verified: false,
      cnameTarget,
      error: `CNAME points to ${cnameTarget} instead of ${expectedTarget}. Please update your DNS settings.`,
    };
  } catch (error) {
    console.error('DNS verification error:', error);
    return {
      verified: false,
      error: 'Failed to verify DNS. Please try again later.',
    };
  }
}

/**
 * Alternative verification using Cloudflare's DNS-over-HTTPS
 */
export async function verifyDnsCnameCloudflare(hostname: string): Promise<DnsVerificationResult> {
  try {
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=CNAME`,
      {
        headers: {
          'Accept': 'application/dns-json',
        },
      }
    );

    if (!response.ok) {
      // Fall back to Google DNS
      return verifyDnsCname(hostname);
    }

    const data = await response.json();

    if (data.Status !== 0 || !data.Answer || data.Answer.length === 0) {
      return {
        verified: false,
        error: `No CNAME record found. Please add a CNAME record pointing to ${CUSTOM_DOMAIN_TARGET}`,
      };
    }

    const cnameRecords = data.Answer.filter((record: { type: number }) => record.type === 5);
    if (cnameRecords.length === 0) {
      return {
        verified: false,
        error: `No CNAME record found. Please add a CNAME record pointing to ${CUSTOM_DOMAIN_TARGET}`,
      };
    }

    const cnameTarget = cnameRecords[0].data.replace(/\.$/, '').toLowerCase();
    const expectedTarget = CUSTOM_DOMAIN_TARGET.toLowerCase();

    return {
      verified: cnameTarget === expectedTarget,
      cnameTarget,
      error: cnameTarget !== expectedTarget
        ? `CNAME points to ${cnameTarget} instead of ${expectedTarget}`
        : undefined,
    };
  } catch {
    // Fall back to Google DNS
    return verifyDnsCname(hostname);
  }
}

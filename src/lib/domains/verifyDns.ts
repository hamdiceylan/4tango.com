import { CUSTOM_DOMAIN_TARGET } from './platformHosts';

export interface DnsVerificationResult {
  verified: boolean;
  cnameTarget?: string;
  isCloudflareProxied?: boolean;
  error?: string;
}

/**
 * Verify that a domain is properly configured to reach our platform
 *
 * Supports two modes:
 * 1. Direct CNAME to domains.4tango.com
 * 2. Cloudflare proxied (CNAME to domains.4tango.com with orange cloud)
 *
 * For Cloudflare proxied domains, DNS lookups return Cloudflare IPs,
 * so we verify by making an HTTP request to the domain instead.
 */
export async function verifyDnsCname(hostname: string): Promise<DnsVerificationResult> {
  try {
    // First, try direct CNAME verification
    const cnameResult = await verifyDirectCname(hostname);

    if (cnameResult.verified) {
      return cnameResult;
    }

    // If CNAME check fails, check if it's Cloudflare proxied
    const cloudflareResult = await verifyCloudflareProxied(hostname);

    if (cloudflareResult.verified) {
      return cloudflareResult;
    }

    // If both fail, return helpful error
    if (cloudflareResult.isCloudflareProxied) {
      return {
        verified: false,
        isCloudflareProxied: true,
        error: 'Cloudflare proxy detected but domain is not correctly configured. Make sure your CNAME points to ' + CUSTOM_DOMAIN_TARGET,
      };
    }

    // Return the original CNAME error
    return cnameResult;
  } catch (error) {
    console.error('DNS verification error:', error);
    return {
      verified: false,
      error: 'Failed to verify DNS. Please try again later.',
    };
  }
}

/**
 * Verify direct CNAME record points to our platform
 */
async function verifyDirectCname(hostname: string): Promise<DnsVerificationResult> {
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
      // Might be an A record instead of CNAME (could be Cloudflare proxied)
      return {
        verified: false,
        error: `No CNAME record found. DNS might be proxied through Cloudflare.`,
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

    return {
      verified: false,
      cnameTarget,
      error: `CNAME points to ${cnameTarget} instead of ${expectedTarget}. Please update your DNS settings.`,
    };
  } catch (error) {
    console.error('Direct CNAME verification error:', error);
    return {
      verified: false,
      error: 'Failed to verify DNS. Please try again later.',
    };
  }
}

/**
 * Verify domain is accessible via Cloudflare proxy
 *
 * When Cloudflare proxy is enabled, DNS returns Cloudflare IPs.
 * We verify by making an HTTP request and checking for:
 * 1. Cloudflare headers in response
 * 2. Our domain verification endpoint responds correctly
 */
async function verifyCloudflareProxied(hostname: string): Promise<DnsVerificationResult> {
  try {
    // Check DNS for Cloudflare IPs (they use A records when proxied)
    const dnsResponse = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`,
      {
        headers: {
          'Accept': 'application/dns-json',
        },
      }
    );

    if (!dnsResponse.ok) {
      return { verified: false, error: 'Failed to check DNS' };
    }

    const dnsData = await dnsResponse.json();

    if (!dnsData.Answer || dnsData.Answer.length === 0) {
      return { verified: false, error: 'No DNS records found' };
    }

    // Check for A records (Cloudflare proxied domains return A records)
    const aRecords = dnsData.Answer.filter((record: { type: number }) => record.type === 1);

    if (aRecords.length === 0) {
      return { verified: false, error: 'No A records found' };
    }

    // Try to make an HTTP request to verify the domain is reachable
    // We use the health endpoint which exists on our app
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const httpResponse = await fetch(`https://${hostname}/api/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': '4tango-domain-verifier',
        },
      });

      clearTimeout(timeout);

      // Check for Cloudflare headers
      const cfRay = httpResponse.headers.get('cf-ray');
      const isCloudflare = !!cfRay;

      if (httpResponse.ok) {
        try {
          const healthData = await httpResponse.json();
          // If we get our health check response, domain is working
          if (healthData.status === 'ok') {
            return {
              verified: true,
              isCloudflareProxied: isCloudflare,
            };
          }
        } catch {
          // JSON parse error - response is not from our app
        }
      }

      // Domain is proxied through Cloudflare but not reaching our app
      if (isCloudflare) {
        return {
          verified: false,
          isCloudflareProxied: true,
          error: 'Cloudflare is configured but domain is not reaching our servers. Make sure the CNAME target is correct.',
        };
      }

      return { verified: false, error: 'Could not verify domain configuration' };
    } catch (fetchError) {
      // HTTP request failed - could be SSL error or domain not configured
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';

      if (errorMessage.includes('certificate') || errorMessage.includes('SSL')) {
        return {
          verified: false,
          error: 'SSL certificate error. Make sure Cloudflare SSL/TLS is set to "Full" mode.',
        };
      }

      return {
        verified: false,
        error: 'Could not connect to domain. Please check your DNS and Cloudflare settings.',
      };
    }
  } catch (error) {
    console.error('Cloudflare verification error:', error);
    return {
      verified: false,
      error: 'Failed to verify Cloudflare configuration',
    };
  }
}


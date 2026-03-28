import {
  AmplifyClient,
  CreateDomainAssociationCommand,
  GetDomainAssociationCommand,
  DeleteDomainAssociationCommand,
  DomainStatus,
} from '@aws-sdk/client-amplify';

// Amplify app IDs
const AMPLIFY_APP_ID_PROD = process.env.AMPLIFY_APP_ID || 'd3jwiy3qjkzx5q';
const AMPLIFY_APP_ID_DEV = 'd35qopwzo3l31w';

const amplifyClient = new AmplifyClient({
  region: 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AMPLIFY_ACCESS_KEY_ID || process.env.SES_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AMPLIFY_SECRET_ACCESS_KEY || process.env.SES_SECRET_ACCESS_KEY || '',
  },
});

export interface DomainAssociationResult {
  success: boolean;
  domainName?: string;
  status?: string;
  certificateVerificationRecord?: {
    name: string;
    value: string;
  };
  subDomainDnsRecord?: {
    name: string;
    value: string;
  };
  error?: string;
}

/**
 * Create a domain association in Amplify
 * This automatically handles SSL certificate creation
 */
export async function createAmplifyDomainAssociation(
  domain: string
): Promise<DomainAssociationResult> {
  try {
    const appId = process.env.NODE_ENV === 'production' ? AMPLIFY_APP_ID_PROD : AMPLIFY_APP_ID_DEV;

    // Extract the base domain and subdomain prefix
    // e.g., "www.supersave.app" -> domain="supersave.app", prefix="www"
    const parts = domain.split('.');
    let domainName: string;
    let prefix: string;

    if (parts.length >= 3 && parts[0] === 'www') {
      // www.example.com -> domain=example.com, prefix=www
      domainName = parts.slice(1).join('.');
      prefix = 'www';
    } else if (parts.length >= 3) {
      // subdomain.example.com -> domain=example.com, prefix=subdomain
      domainName = parts.slice(1).join('.');
      prefix = parts[0];
    } else {
      // example.com -> domain=example.com, prefix=""
      domainName = domain;
      prefix = '';
    }

    const command = new CreateDomainAssociationCommand({
      appId,
      domainName,
      subDomainSettings: [
        {
          prefix,
          branchName: 'main',
        },
      ],
      enableAutoSubDomain: false,
    });

    const response = await amplifyClient.send(command);
    const domainAssociation = response.domainAssociation;

    if (!domainAssociation) {
      return { success: false, error: 'Failed to create domain association' };
    }

    // Parse the certificate verification DNS record
    let certRecord: DomainAssociationResult['certificateVerificationRecord'];
    if (domainAssociation.certificateVerificationDNSRecord) {
      // Format: "_abc123.example.com. CNAME _xyz789.acm-validations.aws."
      const parts = domainAssociation.certificateVerificationDNSRecord.split(' CNAME ');
      if (parts.length === 2) {
        certRecord = {
          name: parts[0].replace(/\.$/, ''), // Remove trailing dot
          value: parts[1].replace(/\.$/, ''),
        };
      }
    }

    // Get subdomain DNS record
    let subDomainRecord: DomainAssociationResult['subDomainDnsRecord'];
    const subDomain = domainAssociation.subDomains?.[0];
    if (subDomain?.dnsRecord) {
      // Format: "www CNAME xyz.cloudfront.net"
      const parts = subDomain.dnsRecord.trim().split(' CNAME ');
      if (parts.length === 2) {
        subDomainRecord = {
          name: parts[0] || '@',
          value: parts[1],
        };
      }
    }

    return {
      success: true,
      domainName: domainAssociation.domainName,
      status: domainAssociation.domainStatus,
      certificateVerificationRecord: certRecord,
      subDomainDnsRecord: subDomainRecord,
    };
  } catch (error) {
    console.error('Error creating Amplify domain association:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('already exists')) {
      return { success: false, error: 'Domain is already configured' };
    }
    if (errorMessage.includes('LimitExceededException')) {
      return { success: false, error: 'Domain limit exceeded. Please contact support.' };
    }
    if (errorMessage.includes('AccessDeniedException')) {
      return { success: false, error: 'Access denied. Please check AWS permissions.' };
    }

    return { success: false, error: `Failed to create domain: ${errorMessage}` };
  }
}

/**
 * Get the status of a domain association
 */
export async function getAmplifyDomainStatus(domainName: string): Promise<DomainAssociationResult> {
  try {
    const appId = process.env.NODE_ENV === 'production' ? AMPLIFY_APP_ID_PROD : AMPLIFY_APP_ID_DEV;

    // Extract base domain (e.g., www.supersave.app -> supersave.app)
    const parts = domainName.split('.');
    const baseDomain = parts.length >= 3 ? parts.slice(1).join('.') : domainName;

    const command = new GetDomainAssociationCommand({
      appId,
      domainName: baseDomain,
    });

    const response = await amplifyClient.send(command);
    const domainAssociation = response.domainAssociation;

    if (!domainAssociation) {
      return { success: false, error: 'Domain not found' };
    }

    // Parse certificate verification record
    let certRecord: DomainAssociationResult['certificateVerificationRecord'];
    if (domainAssociation.certificateVerificationDNSRecord) {
      const parts = domainAssociation.certificateVerificationDNSRecord.split(' CNAME ');
      if (parts.length === 2) {
        certRecord = {
          name: parts[0].replace(/\.$/, ''),
          value: parts[1].replace(/\.$/, ''),
        };
      }
    }

    // Get subdomain DNS record
    let subDomainRecord: DomainAssociationResult['subDomainDnsRecord'];
    const subDomain = domainAssociation.subDomains?.[0];
    if (subDomain?.dnsRecord) {
      const parts = subDomain.dnsRecord.trim().split(' CNAME ');
      if (parts.length === 2) {
        subDomainRecord = {
          name: parts[0] || '@',
          value: parts[1],
        };
      }
    }

    return {
      success: true,
      domainName: domainAssociation.domainName,
      status: domainAssociation.domainStatus,
      certificateVerificationRecord: certRecord,
      subDomainDnsRecord: subDomainRecord,
    };
  } catch (error) {
    console.error('Error getting Amplify domain status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('NotFoundException')) {
      return { success: false, error: 'Domain not found' };
    }

    return { success: false, error: `Failed to get domain status: ${errorMessage}` };
  }
}

/**
 * Delete a domain association
 */
export async function deleteAmplifyDomainAssociation(domainName: string): Promise<boolean> {
  try {
    const appId = process.env.NODE_ENV === 'production' ? AMPLIFY_APP_ID_PROD : AMPLIFY_APP_ID_DEV;

    // Extract base domain
    const parts = domainName.split('.');
    const baseDomain = parts.length >= 3 ? parts.slice(1).join('.') : domainName;

    const command = new DeleteDomainAssociationCommand({
      appId,
      domainName: baseDomain,
    });

    await amplifyClient.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting Amplify domain association:', error);
    return false;
  }
}

/**
 * Map Amplify domain status to our status
 */
export function mapAmplifyStatus(status: DomainStatus | string | undefined): {
  domainStatus: 'PENDING' | 'ACTIVE' | 'FAILED';
  sslStatus: 'PENDING' | 'ISSUED' | 'FAILED';
} {
  switch (status) {
    case DomainStatus.PENDING_VERIFICATION:
    case DomainStatus.IN_PROGRESS:
    case DomainStatus.CREATING:
    case DomainStatus.REQUESTING_CERTIFICATE:
      return { domainStatus: 'PENDING', sslStatus: 'PENDING' };

    case DomainStatus.PENDING_DEPLOYMENT:
      return { domainStatus: 'PENDING', sslStatus: 'ISSUED' };

    case DomainStatus.AVAILABLE:
      return { domainStatus: 'ACTIVE', sslStatus: 'ISSUED' };

    case DomainStatus.FAILED:
      return { domainStatus: 'FAILED', sslStatus: 'FAILED' };

    default:
      return { domainStatus: 'PENDING', sslStatus: 'PENDING' };
  }
}

/**
 * Check if Amplify is configured
 */
export function isAmplifyConfigured(): boolean {
  const hasAccessKey = !!(process.env.AMPLIFY_ACCESS_KEY_ID || process.env.SES_ACCESS_KEY_ID);
  const hasSecretKey = !!(process.env.AMPLIFY_SECRET_ACCESS_KEY || process.env.SES_SECRET_ACCESS_KEY);
  return hasAccessKey && hasSecretKey;
}

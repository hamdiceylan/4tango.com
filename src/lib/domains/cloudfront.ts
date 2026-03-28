import {
  CloudFrontClient,
  GetDistributionConfigCommand,
  UpdateDistributionCommand,
} from '@aws-sdk/client-cloudfront';

// CloudFront distribution ID for 4tango.com
// This is the Amplify-managed distribution
const CLOUDFRONT_DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID || '';

const cloudFrontClient = new CloudFrontClient({
  region: 'us-east-1', // CloudFront is global but API is in us-east-1
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export interface AddDomainResult {
  success: boolean;
  error?: string;
}

/**
 * Add a custom domain to CloudFront distribution
 * Requires the ACM certificate to be issued first
 */
export async function addDomainToCloudFront(
  domain: string,
  certificateArn: string
): Promise<AddDomainResult> {
  if (!CLOUDFRONT_DISTRIBUTION_ID) {
    return { success: false, error: 'CloudFront distribution ID not configured' };
  }

  try {
    // Get current distribution config
    const getConfigCommand = new GetDistributionConfigCommand({
      Id: CLOUDFRONT_DISTRIBUTION_ID,
    });

    const configResponse = await cloudFrontClient.send(getConfigCommand);
    const distributionConfig = configResponse.DistributionConfig;
    const etag = configResponse.ETag;

    if (!distributionConfig || !etag) {
      return { success: false, error: 'Failed to get CloudFront distribution config' };
    }

    // Check if domain is already in the aliases
    const currentAliases = distributionConfig.Aliases?.Items || [];
    if (currentAliases.includes(domain)) {
      // Domain already added, just need to ensure certificate is correct
      return { success: true };
    }

    // Add the new domain to aliases
    const newAliases = [...currentAliases, domain];

    // Update distribution with new domain
    const updateCommand = new UpdateDistributionCommand({
      Id: CLOUDFRONT_DISTRIBUTION_ID,
      IfMatch: etag,
      DistributionConfig: {
        ...distributionConfig,
        Aliases: {
          Quantity: newAliases.length,
          Items: newAliases,
        },
        ViewerCertificate: {
          ACMCertificateArn: certificateArn,
          SSLSupportMethod: 'sni-only',
          MinimumProtocolVersion: 'TLSv1.2_2021',
          CloudFrontDefaultCertificate: false,
        },
      },
    });

    await cloudFrontClient.send(updateCommand);

    return { success: true };
  } catch (error) {
    console.error('Error adding domain to CloudFront:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('CNAMEAlreadyExists')) {
      return { success: false, error: 'Domain is already associated with another CloudFront distribution' };
    }
    if (errorMessage.includes('InvalidViewerCertificate')) {
      return { success: false, error: 'Certificate is not valid for CloudFront. Make sure it is issued.' };
    }
    if (errorMessage.includes('AccessDenied')) {
      return { success: false, error: 'Access denied. CloudFront permissions not configured.' };
    }

    return { success: false, error: `Failed to add domain to CloudFront: ${errorMessage}` };
  }
}

/**
 * Remove a custom domain from CloudFront distribution
 */
export async function removeDomainFromCloudFront(domain: string): Promise<AddDomainResult> {
  if (!CLOUDFRONT_DISTRIBUTION_ID) {
    return { success: false, error: 'CloudFront distribution ID not configured' };
  }

  try {
    // Get current distribution config
    const getConfigCommand = new GetDistributionConfigCommand({
      Id: CLOUDFRONT_DISTRIBUTION_ID,
    });

    const configResponse = await cloudFrontClient.send(getConfigCommand);
    const distributionConfig = configResponse.DistributionConfig;
    const etag = configResponse.ETag;

    if (!distributionConfig || !etag) {
      return { success: false, error: 'Failed to get CloudFront distribution config' };
    }

    // Remove the domain from aliases
    const currentAliases = distributionConfig.Aliases?.Items || [];
    const newAliases = currentAliases.filter(alias => alias !== domain);

    if (newAliases.length === currentAliases.length) {
      // Domain wasn't in the list
      return { success: true };
    }

    // Update distribution without the domain
    const updateCommand = new UpdateDistributionCommand({
      Id: CLOUDFRONT_DISTRIBUTION_ID,
      IfMatch: etag,
      DistributionConfig: {
        ...distributionConfig,
        Aliases: {
          Quantity: newAliases.length,
          Items: newAliases.length > 0 ? newAliases : undefined,
        },
      },
    });

    await cloudFrontClient.send(updateCommand);

    return { success: true };
  } catch (error) {
    console.error('Error removing domain from CloudFront:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove domain',
    };
  }
}

/**
 * Check if CloudFront is properly configured
 */
export function isCloudFrontConfigured(): boolean {
  return !!CLOUDFRONT_DISTRIBUTION_ID && !!process.env.AWS_ACCESS_KEY_ID;
}

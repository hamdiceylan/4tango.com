import {
  ACMClient,
  RequestCertificateCommand,
  DescribeCertificateCommand,
  DeleteCertificateCommand,
  CertificateStatus,
} from '@aws-sdk/client-acm';

// ACM certificates for CloudFront must be in us-east-1
const acmClient = new ACMClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export interface CertificateRequestResult {
  success: boolean;
  certificateArn?: string;
  validationName?: string;
  validationValue?: string;
  error?: string;
}

export interface CertificateStatusResult {
  status: 'PENDING_VALIDATION' | 'ISSUED' | 'FAILED' | 'EXPIRED' | 'REVOKED' | 'UNKNOWN';
  validationName?: string;
  validationValue?: string;
  error?: string;
}

/**
 * Request a new ACM certificate for a domain
 * Uses DNS validation - returns the CNAME record user needs to add
 */
export async function requestCertificate(domain: string): Promise<CertificateRequestResult> {
  try {
    // Request certificate with DNS validation
    const requestCommand = new RequestCertificateCommand({
      DomainName: domain,
      ValidationMethod: 'DNS',
      // Add IdempotencyToken to prevent duplicate certificates
      IdempotencyToken: `4tango-${domain.replace(/\./g, '-')}`,
    });

    const requestResponse = await acmClient.send(requestCommand);
    const certificateArn = requestResponse.CertificateArn;

    if (!certificateArn) {
      return { success: false, error: 'Failed to create certificate' };
    }

    // Wait a moment for AWS to generate validation records
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get the validation records
    const describeCommand = new DescribeCertificateCommand({
      CertificateArn: certificateArn,
    });

    const describeResponse = await acmClient.send(describeCommand);
    const certificate = describeResponse.Certificate;

    if (!certificate?.DomainValidationOptions?.[0]) {
      return {
        success: true,
        certificateArn,
        error: 'Certificate created but validation records not yet available. Try verifying in a moment.',
      };
    }

    const validationOption = certificate.DomainValidationOptions[0];
    const resourceRecord = validationOption.ResourceRecord;

    if (!resourceRecord?.Name || !resourceRecord?.Value) {
      return {
        success: true,
        certificateArn,
        error: 'Validation records not yet available. Try verifying in a moment.',
      };
    }

    return {
      success: true,
      certificateArn,
      validationName: resourceRecord.Name,
      validationValue: resourceRecord.Value,
    };
  } catch (error) {
    console.error('Error requesting certificate:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Handle specific errors
    if (errorMessage.includes('LimitExceededException')) {
      return { success: false, error: 'Certificate limit exceeded. Please contact support.' };
    }
    if (errorMessage.includes('InvalidDomainValidationOptionsException')) {
      return { success: false, error: 'Invalid domain. Please check the domain name.' };
    }

    return { success: false, error: `Failed to request certificate: ${errorMessage}` };
  }
}

/**
 * Check the status of a certificate
 */
export async function getCertificateStatus(certificateArn: string): Promise<CertificateStatusResult> {
  try {
    const command = new DescribeCertificateCommand({
      CertificateArn: certificateArn,
    });

    const response = await acmClient.send(command);
    const certificate = response.Certificate;

    if (!certificate) {
      return { status: 'UNKNOWN', error: 'Certificate not found' };
    }

    const status = certificate.Status as CertificateStatus;
    const validationOption = certificate.DomainValidationOptions?.[0];
    const resourceRecord = validationOption?.ResourceRecord;

    const result: CertificateStatusResult = {
      status: mapCertificateStatus(status),
      validationName: resourceRecord?.Name,
      validationValue: resourceRecord?.Value,
    };

    // Add failure reason if applicable
    if (status === CertificateStatus.FAILED) {
      result.error = certificate.FailureReason || 'Certificate validation failed';
    }

    return result;
  } catch (error) {
    console.error('Error getting certificate status:', error);
    return {
      status: 'UNKNOWN',
      error: error instanceof Error ? error.message : 'Failed to check certificate',
    };
  }
}

/**
 * Delete a certificate (cleanup when domain is removed)
 */
export async function deleteCertificate(certificateArn: string): Promise<boolean> {
  try {
    const command = new DeleteCertificateCommand({
      CertificateArn: certificateArn,
    });

    await acmClient.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting certificate:', error);
    // Certificate might be in use by CloudFront - that's ok, it will be cleaned up later
    return false;
  }
}

function mapCertificateStatus(status: CertificateStatus | string | undefined): CertificateStatusResult['status'] {
  switch (status) {
    case CertificateStatus.PENDING_VALIDATION:
      return 'PENDING_VALIDATION';
    case CertificateStatus.ISSUED:
      return 'ISSUED';
    case CertificateStatus.FAILED:
      return 'FAILED';
    case CertificateStatus.EXPIRED:
      return 'EXPIRED';
    case CertificateStatus.REVOKED:
      return 'REVOKED';
    default:
      return 'UNKNOWN';
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission, AuthError, authErrorResponse } from '@/lib/auth-middleware';
import { createActivityLog } from '@/lib/activity-log';
import {
  getAmplifyDomainStatus,
  mapAmplifyStatus,
  isAmplifyConfigured,
} from '@/lib/domains/amplify';

// POST /api/events/[id]/custom-domain/check-dns - Check domain status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission('event:edit');

    // Verify the event belongs to this organizer
    const event = await prisma.event.findFirst({
      where: {
        id: params.id,
        organizerId: user.organizerId,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (!event.customDomain) {
      return NextResponse.json(
        { error: 'No custom domain configured' },
        { status: 400 }
      );
    }

    if (!isAmplifyConfigured()) {
      return NextResponse.json(
        { error: 'Domain management is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Get Amplify domain status
    const amplifyStatus = await getAmplifyDomainStatus(event.customDomain);

    if (!amplifyStatus.success) {
      await prisma.event.update({
        where: { id: params.id },
        data: {
          customDomainLastCheckedAt: new Date(),
          customDomainError: amplifyStatus.error || 'Failed to check domain status',
        },
      });

      return NextResponse.json({
        success: false,
        verified: false,
        status: 'PENDING',
        error: amplifyStatus.error || 'Domain not found in Amplify. Please save the domain again.',
      });
    }

    // Update validation records if available
    if (amplifyStatus.certificateVerificationRecord) {
      await prisma.event.update({
        where: { id: params.id },
        data: {
          customDomainValidationName: amplifyStatus.certificateVerificationRecord.name,
          customDomainValidationValue: amplifyStatus.certificateVerificationRecord.value,
        },
      });
    }

    // Map Amplify status to our status
    const { domainStatus, sslStatus } = mapAmplifyStatus(amplifyStatus.status);

    if (domainStatus === 'ACTIVE') {
      // Domain is active!
      await prisma.event.update({
        where: { id: params.id },
        data: {
          customDomainStatus: 'ACTIVE',
          customDomainSslStatus: 'ISSUED',
          customDomainVerifiedAt: new Date(),
          customDomainLastCheckedAt: new Date(),
          customDomainError: null,
        },
      });

      // Log activity
      await createActivityLog(user, {
        action: 'event.custom_domain.verify_success',
        entityType: 'event',
        entityId: params.id,
        entityLabel: event.title,
        metadata: {
          hostname: event.customDomain,
          amplifyStatus: amplifyStatus.status,
        },
        eventId: params.id,
      });

      return NextResponse.json({
        success: true,
        verified: true,
        status: 'ACTIVE',
        sslStatus: 'ISSUED',
        message: 'Domain verified and activated! Your custom domain is now live.',
      });
    }

    if (domainStatus === 'FAILED') {
      await prisma.event.update({
        where: { id: params.id },
        data: {
          customDomainStatus: 'FAILED',
          customDomainSslStatus: 'FAILED',
          customDomainLastCheckedAt: new Date(),
          customDomainError: 'Domain configuration failed. Please remove and try again.',
        },
      });

      return NextResponse.json({
        success: false,
        verified: false,
        status: 'FAILED',
        sslStatus: 'FAILED',
        error: 'Domain configuration failed. Please remove the domain and try again.',
      });
    }

    // Still pending
    await prisma.event.update({
      where: { id: params.id },
      data: {
        customDomainStatus: 'PENDING',
        customDomainSslStatus: sslStatus === 'ISSUED' ? 'ISSUED' : 'PENDING',
        customDomainLastCheckedAt: new Date(),
        customDomainError: null,
      },
    });

    // Build helpful message based on status
    let message = 'Domain verification in progress.';
    if (amplifyStatus.status === 'PENDING_VERIFICATION' || amplifyStatus.status === 'REQUESTING_CERTIFICATE') {
      message = 'Waiting for DNS verification. Please ensure both DNS records are added correctly.';
    } else if (amplifyStatus.status === 'PENDING_DEPLOYMENT') {
      message = 'Certificate verified! Domain is being deployed. This may take a few minutes.';
    } else if (amplifyStatus.status === 'IN_PROGRESS' || amplifyStatus.status === 'CREATING') {
      message = 'Domain setup in progress. Please wait...';
    }

    return NextResponse.json({
      success: false,
      verified: false,
      status: 'PENDING',
      sslStatus,
      amplifyStatus: amplifyStatus.status,
      error: message,
      validationCname: amplifyStatus.certificateVerificationRecord || null,
      subDomainDnsRecord: amplifyStatus.subDomainDnsRecord || null,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return authErrorResponse(error);
    }
    console.error('Error checking domain status:', error);
    return NextResponse.json(
      { error: 'Failed to check domain status' },
      { status: 500 }
    );
  }
}

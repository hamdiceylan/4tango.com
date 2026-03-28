import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission, AuthError, authErrorResponse } from '@/lib/auth-middleware';
import { verifyDnsCname } from '@/lib/domains/verifyDns';
import { createActivityLog } from '@/lib/activity-log';
import { CUSTOM_DOMAIN_TARGET } from '@/lib/domains/platformHosts';

// POST /api/events/[id]/custom-domain/check-dns - Verify DNS configuration
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

    // Verify DNS
    const dnsResult = await verifyDnsCname(event.customDomain);

    // Update the event based on verification result
    if (dnsResult.verified) {
      await prisma.event.update({
        where: { id: params.id },
        data: {
          customDomainStatus: 'DNS_VERIFIED',
          customDomainVerifiedAt: new Date(),
          customDomainLastCheckedAt: new Date(),
          customDomainError: null,
          // For MVP, immediately set to ACTIVE since we're not managing SSL ourselves
          // In production, SSL would be handled by CloudFront/ACM
          customDomainSslStatus: 'ISSUED',
        },
      });

      // Activate the domain
      await prisma.event.update({
        where: { id: params.id },
        data: {
          customDomainStatus: 'ACTIVE',
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
          cnameTarget: dnsResult.cnameTarget,
        },
        eventId: params.id,
      });

      return NextResponse.json({
        success: true,
        verified: true,
        status: 'ACTIVE',
        sslStatus: 'ISSUED',
        message: 'DNS verified and domain activated successfully!',
      });
    } else {
      // DNS verification failed
      await prisma.event.update({
        where: { id: params.id },
        data: {
          customDomainLastCheckedAt: new Date(),
          customDomainError: dnsResult.error || 'DNS verification failed',
        },
      });

      // Log activity
      await createActivityLog(user, {
        action: 'event.custom_domain.verify_failed',
        entityType: 'event',
        entityId: params.id,
        entityLabel: event.title,
        metadata: {
          hostname: event.customDomain,
          error: dnsResult.error,
          cnameTarget: dnsResult.cnameTarget,
        },
        eventId: params.id,
      });

      return NextResponse.json({
        success: false,
        verified: false,
        status: 'PENDING',
        error: dnsResult.error,
        expectedTarget: CUSTOM_DOMAIN_TARGET,
        actualTarget: dnsResult.cnameTarget || null,
      });
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return authErrorResponse(error);
    }
    console.error('Error checking DNS:', error);
    return NextResponse.json(
      { error: 'Failed to check DNS' },
      { status: 500 }
    );
  }
}

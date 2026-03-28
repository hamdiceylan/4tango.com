import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission, AuthError, authErrorResponse } from '@/lib/auth-middleware';
import { validateHostname, isApexDomain } from '@/lib/domains/validateHostname';
import { isCustomDomainInUse } from '@/lib/domains/resolveEventByHostname';
import { CUSTOM_DOMAIN_TARGET } from '@/lib/domains/platformHosts';
import { createActivityLog } from '@/lib/activity-log';

// GET /api/events/[id]/custom-domain - Get current domain status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission('event:view');

    // Verify the event belongs to this organizer
    const event = await prisma.event.findFirst({
      where: {
        id: params.id,
        organizerId: user.organizerId,
      },
      select: {
        id: true,
        customDomain: true,
        customDomainStatus: true,
        customDomainVerifiedAt: true,
        customDomainSslStatus: true,
        customDomainLastCheckedAt: true,
        customDomainError: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      hostname: event.customDomain,
      status: event.customDomainStatus,
      sslStatus: event.customDomainSslStatus,
      verifiedAt: event.customDomainVerifiedAt?.toISOString() || null,
      lastCheckedAt: event.customDomainLastCheckedAt?.toISOString() || null,
      error: event.customDomainError,
      dnsTarget: CUSTOM_DOMAIN_TARGET,
      isApex: event.customDomain ? isApexDomain(event.customDomain) : false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return authErrorResponse(error);
    }
    console.error('Error fetching custom domain:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom domain' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/custom-domain - Save or update custom domain
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission('event:edit');

    const body = await request.json();
    const { hostname: inputHostname } = body;

    if (!inputHostname) {
      return NextResponse.json(
        { error: 'Hostname is required' },
        { status: 400 }
      );
    }

    // Validate hostname
    const validation = validateHostname(inputHostname);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const hostname = validation.normalizedHostname!;

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

    // Check if domain is already in use by another event
    const inUse = await isCustomDomainInUse(hostname, params.id);
    if (inUse) {
      return NextResponse.json(
        { error: 'This domain is already in use by another event' },
        { status: 409 }
      );
    }

    // Update the event with the new custom domain
    const previousDomain = event.customDomain;
    const updatedEvent = await prisma.event.update({
      where: { id: params.id },
      data: {
        customDomain: hostname,
        customDomainStatus: 'PENDING',
        customDomainSslStatus: 'NONE',
        customDomainVerifiedAt: null,
        customDomainLastCheckedAt: null,
        customDomainError: null,
      },
    });

    // Log activity
    await createActivityLog(user, {
      action: previousDomain ? 'event.custom_domain.update' : 'event.custom_domain.add',
      entityType: 'event',
      entityId: params.id,
      entityLabel: event.title,
      changes: previousDomain
        ? { customDomain: { old: previousDomain, new: hostname } }
        : { customDomain: { old: null, new: hostname } },
      eventId: params.id,
    });

    return NextResponse.json({
      success: true,
      hostname: updatedEvent.customDomain,
      status: updatedEvent.customDomainStatus,
      dnsTarget: CUSTOM_DOMAIN_TARGET,
      isApex: isApexDomain(hostname),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return authErrorResponse(error);
    }
    console.error('Error saving custom domain:', error);
    return NextResponse.json(
      { error: 'Failed to save custom domain' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/custom-domain - Remove custom domain
export async function DELETE(
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

    const previousDomain = event.customDomain;

    if (!previousDomain) {
      return NextResponse.json(
        { error: 'No custom domain configured' },
        { status: 400 }
      );
    }

    // Remove the custom domain
    await prisma.event.update({
      where: { id: params.id },
      data: {
        customDomain: null,
        customDomainStatus: 'NONE',
        customDomainSslStatus: 'NONE',
        customDomainVerifiedAt: null,
        customDomainLastCheckedAt: null,
        customDomainError: null,
      },
    });

    // Log activity
    await createActivityLog(user, {
      action: 'event.custom_domain.remove',
      entityType: 'event',
      entityId: params.id,
      entityLabel: event.title,
      changes: { customDomain: { old: previousDomain, new: null } },
      eventId: params.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return authErrorResponse(error);
    }
    console.error('Error removing custom domain:', error);
    return NextResponse.json(
      { error: 'Failed to remove custom domain' },
      { status: 500 }
    );
  }
}

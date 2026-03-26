import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-middleware';

// Get dancer details with registration history for organizer
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission('registration:view');
    const { id } = await params;

    // Get dancer with registrations for this organizer's events
    const dancer = await prisma.dancer.findUnique({
      where: { id },
      include: {
        auth: {
          select: {
            provider: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
        tags: {
          where: {
            tag: {
              organizerId: user.organizerId,
            },
          },
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
    });

    if (!dancer) {
      return NextResponse.json({ error: 'Dancer not found' }, { status: 404 });
    }

    // Get registrations for this organizer's events
    const registrations = await prisma.registration.findMany({
      where: {
        dancerId: id,
        event: {
          organizerId: user.organizerId,
        },
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startAt: true,
            endAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get notes for this dancer from this organizer
    const notes = await prisma.dancerNote.findMany({
      where: {
        dancerId: id,
        organizerId: user.organizerId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate stats
    const stats = {
      totalRegistrations: registrations.length,
      confirmedRegistrations: registrations.filter(
        (r) => r.registrationStatus === 'CONFIRMED' || r.registrationStatus === 'CHECKED_IN'
      ).length,
      totalSpent: registrations
        .filter((r) => r.paymentStatus === 'PAID')
        .reduce((sum, r) => sum + (r.paymentAmount || 0), 0),
      firstRegistration: registrations.length > 0
        ? registrations[registrations.length - 1].createdAt
        : null,
    };

    return NextResponse.json({
      ...dancer,
      tags: dancer.tags.map((ta) => ta.tag),
      registrations,
      notes,
      stats,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error fetching dancer:', error);
    return NextResponse.json({ error: 'Failed to fetch dancer' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDancerSession } from '@/lib/auth';

// Get dancer's registration history
export async function GET() {
  try {
    const dancerUser = await getDancerSession();

    if (!dancerUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const registrations = await prisma.registration.findMany({
      where: { dancerId: dancerUser.id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            city: true,
            country: true,
            startAt: true,
            endAt: true,
            coverImageUrl: true,
            status: true,
            organizer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format response
    const formattedRegistrations = registrations.map((reg) => ({
      id: reg.id,
      accessToken: reg.accessToken,
      registrationStatus: reg.registrationStatus,
      paymentStatus: reg.paymentStatus,
      paymentAmount: reg.paymentAmount,
      roleSnapshot: reg.roleSnapshot,
      packageId: reg.packageId,
      createdAt: reg.createdAt,
      event: {
        id: reg.event.id,
        title: reg.event.title,
        slug: reg.event.slug,
        city: reg.event.city,
        country: reg.event.country,
        startAt: reg.event.startAt,
        endAt: reg.event.endAt,
        coverImageUrl: reg.event.coverImageUrl,
        status: reg.event.status,
        organizerName: reg.event.organizer.name,
      },
    }));

    return NextResponse.json(formattedRegistrations);
  } catch (error) {
    console.error('Error fetching dancer registrations:', error);
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-middleware';

export async function GET() {
  try {
    const user = await requirePermission('org:team:view');

    const invitations = await prisma.teamInvitation.findMany({
      where: {
        organizerId: user.organizerId,
        status: 'PENDING',
      },
      include: {
        invitedBy: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Mark expired invitations
    const now = new Date();
    const result = invitations.map((inv) => ({
      id: inv.id,
      email: inv.email,
      role: inv.role,
      invitedBy: inv.invitedBy.fullName,
      createdAt: inv.createdAt,
      expiresAt: inv.expiresAt,
      isExpired: inv.expiresAt < now,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
  }
}

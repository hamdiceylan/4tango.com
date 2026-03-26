import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSession } from '@/lib/auth';
import { cookies } from 'next/headers';
import { createActivityLog, ACTIVITY_ACTIONS } from '@/lib/activity-log';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, fullName, cognitoUserId } = body as {
      token: string;
      fullName?: string;
      cognitoUserId?: string;
    };

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Find the invitation
    const invitation = await prisma.teamInvitation.findUnique({
      where: { token },
      include: {
        organizer: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: `This invitation has already been ${invitation.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    if (invitation.expiresAt < new Date()) {
      // Update invitation status to expired
      await prisma.teamInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 });
    }

    // Check if user already exists in the organization
    const existingUser = await prisma.organizerUser.findFirst({
      where: {
        email: invitation.email,
        organizerId: invitation.organizerId,
      },
    });

    if (existingUser) {
      // Update invitation status
      await prisma.teamInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'You are already a member of this organization',
        organizerId: invitation.organizerId,
      });
    }

    // Create new organizer user
    const newUser = await prisma.organizerUser.create({
      data: {
        organizerId: invitation.organizerId,
        email: invitation.email,
        fullName: fullName || invitation.email.split('@')[0],
        role: invitation.role,
        cognitoUserId: cognitoUserId || null,
      },
    });

    // Update invitation status
    await prisma.teamInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    // Create session for the new user
    const sessionToken = await createSession(newUser.id, 'organizer');

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    // Log the activity (non-blocking)
    // Note: The new user is logging their own acceptance
    createActivityLog(
      {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        organizerId: invitation.organizerId,
        organizerName: invitation.organizer.name,
        role: newUser.role,
        onboardingCompleted: !!invitation.organizer.onboardingCompletedAt,
      },
      {
        action: ACTIVITY_ACTIONS.TEAM.ACCEPT_INVITE,
        entityType: "team_member",
        entityId: newUser.id,
        entityLabel: newUser.fullName,
        metadata: {
          role: newUser.role,
          invitedBy: invitation.invitedById,
        },
      }
    ).catch((err) => console.error("Failed to log activity:", err));

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
      },
      organizerId: invitation.organizerId,
      organizerName: invitation.organizer.name,
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 });
  }
}

// Get invitation details (public)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  const invitation = await prisma.teamInvitation.findUnique({
    where: { token },
    include: {
      organizer: {
        select: {
          name: true,
          logoUrl: true,
        },
      },
      invitedBy: {
        select: {
          fullName: true,
        },
      },
    },
  });

  if (!invitation) {
    return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });
  }

  const isExpired = invitation.expiresAt < new Date();
  const isValid = invitation.status === 'PENDING' && !isExpired;

  return NextResponse.json({
    email: invitation.email,
    role: invitation.role,
    status: isExpired && invitation.status === 'PENDING' ? 'EXPIRED' : invitation.status,
    isValid,
    organizer: invitation.organizer,
    invitedBy: invitation.invitedBy.fullName,
    expiresAt: invitation.expiresAt,
  });
}

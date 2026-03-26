import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-middleware';
import { getAssignableRoles } from '@/lib/permissions';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';
import type { OrganizerRole } from '@prisma/client';
import { createActivityLog, ACTIVITY_ACTIONS } from '@/lib/activity-log';

export async function POST(request: Request) {
  try {
    const user = await requirePermission('org:team:invite');
    const body = await request.json();
    const { email, role } = body as { email: string; role: OrganizerRole };

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Validate role
    const assignableRoles = getAssignableRoles(user.role);
    if (!assignableRoles.includes(role)) {
      return NextResponse.json(
        { error: 'You cannot assign this role' },
        { status: 403 }
      );
    }

    // Check if user already exists in organization
    const existingUser = await prisma.organizerUser.findFirst({
      where: {
        email: email.toLowerCase(),
        organizerId: user.organizerId,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'This email is already a team member' },
        { status: 400 }
      );
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.teamInvitation.findUnique({
      where: {
        organizerId_email: {
          organizerId: user.organizerId,
          email: email.toLowerCase(),
        },
      },
    });

    if (existingInvitation && existingInvitation.status === 'PENDING') {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email' },
        { status: 400 }
      );
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Create or update invitation (expires in 7 days)
    const invitation = await prisma.teamInvitation.upsert({
      where: {
        organizerId_email: {
          organizerId: user.organizerId,
          email: email.toLowerCase(),
        },
      },
      update: {
        role,
        token,
        invitedById: user.id,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        acceptedAt: null,
      },
      create: {
        organizerId: user.organizerId,
        email: email.toLowerCase(),
        role,
        token,
        invitedById: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Send invitation email
    const inviteUrl = `${process.env.NEXT_PUBLIC_URL || 'https://4tango.com'}/invite/${token}`;

    await sendEmail({
      to: email,
      subject: `You've been invited to join ${user.organizerName} on 4Tango`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've been invited!</h2>
          <p>${user.fullName} has invited you to join <strong>${user.organizerName}</strong> on 4Tango as a <strong>${role.replace('_', ' ')}</strong>.</p>
          <p>Click the button below to accept the invitation:</p>
          <a href="${inviteUrl}" style="display: inline-block; background: #f43f5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Accept Invitation</a>
          <p style="color: #666; font-size: 14px;">This invitation expires in 7 days.</p>
          <p style="color: #666; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      `,
    });

    // Log the activity (non-blocking)
    createActivityLog(user, {
      action: ACTIVITY_ACTIONS.TEAM.INVITE_MEMBER,
      entityType: "team_invitation",
      entityId: invitation.id,
      entityLabel: email,
      metadata: {
        role,
      },
    }).catch((err) => console.error("Failed to log activity:", err));

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 });
  }
}

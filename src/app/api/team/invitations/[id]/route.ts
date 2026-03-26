import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-middleware';
import { createActivityLog, ACTIVITY_ACTIONS } from '@/lib/activity-log';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Cancel/delete an invitation
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await requirePermission('org:team:invite');
    const { id } = await params;

    const invitation = await prisma.teamInvitation.findUnique({
      where: { id },
    });

    if (!invitation || invitation.organizerId !== user.organizerId) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only cancel pending invitations' },
        { status: 400 }
      );
    }

    await prisma.teamInvitation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // Log the activity (non-blocking)
    createActivityLog(user, {
      action: ACTIVITY_ACTIONS.TEAM.CANCEL_INVITE,
      entityType: "team_invitation",
      entityId: id,
      entityLabel: invitation.email,
      metadata: {
        role: invitation.role,
      },
    }).catch((err) => console.error("Failed to log activity:", err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to cancel invitation' }, { status: 500 });
  }
}

// Resend invitation
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const user = await requirePermission('org:team:invite');
    const { id } = await params;
    const { sendEmail } = await import('@/lib/email');
    const crypto = await import('crypto');

    const invitation = await prisma.teamInvitation.findUnique({
      where: { id },
    });

    if (!invitation || invitation.organizerId !== user.organizerId) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Generate new token and extend expiration
    const newToken = crypto.randomBytes(32).toString('hex');

    const updatedInvitation = await prisma.teamInvitation.update({
      where: { id },
      data: {
        token: newToken,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Resend email
    const inviteUrl = `${process.env.NEXT_PUBLIC_URL || 'https://4tango.com'}/invite/${newToken}`;

    await sendEmail({
      to: invitation.email,
      subject: `Reminder: You've been invited to join ${user.organizerName} on 4Tango`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've been invited!</h2>
          <p>${user.fullName} has invited you to join <strong>${user.organizerName}</strong> on 4Tango as a <strong>${invitation.role.replace('_', ' ')}</strong>.</p>
          <p>Click the button below to accept the invitation:</p>
          <a href="${inviteUrl}" style="display: inline-block; background: #f43f5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Accept Invitation</a>
          <p style="color: #666; font-size: 14px;">This invitation expires in 7 days.</p>
          <p style="color: #666; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      invitation: {
        id: updatedInvitation.id,
        email: updatedInvitation.email,
        expiresAt: updatedInvitation.expiresAt,
      },
    });
  } catch (error) {
    console.error('Error resending invitation:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to resend invitation' }, { status: 500 });
  }
}

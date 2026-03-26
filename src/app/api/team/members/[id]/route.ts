import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-middleware';
import { canManageRole, getAssignableRoles } from '@/lib/permissions';
import type { OrganizerRole } from '@prisma/client';
import { createActivityLog, ACTIVITY_ACTIONS } from '@/lib/activity-log';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Update team member role
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await requirePermission('org:team:manage');
    const { id } = await params;
    const body = await request.json();
    const { role } = body as { role: OrganizerRole };

    // Find the member
    const member = await prisma.organizerUser.findUnique({
      where: { id },
    });

    if (!member || member.organizerId !== user.organizerId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Cannot change own role
    if (member.id === user.id) {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 400 }
      );
    }

    // Check if user can manage the target member's current role
    if (!canManageRole(user.role, member.role)) {
      return NextResponse.json(
        { error: 'You cannot manage this team member' },
        { status: 403 }
      );
    }

    // Check if new role is assignable by current user
    const assignableRoles = getAssignableRoles(user.role);
    if (!assignableRoles.includes(role)) {
      return NextResponse.json(
        { error: 'You cannot assign this role' },
        { status: 403 }
      );
    }

    const updatedMember = await prisma.organizerUser.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });

    // Log the activity (non-blocking)
    createActivityLog(user, {
      action: ACTIVITY_ACTIONS.TEAM.UPDATE_ROLE,
      entityType: "team_member",
      entityId: id,
      entityLabel: member.fullName,
      changes: {
        role: { old: member.role, new: role },
      },
    }).catch((err) => console.error("Failed to log activity:", err));

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Error updating team member:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
  }
}

// Remove team member
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await requirePermission('org:team:manage');
    const { id } = await params;

    // Find the member
    const member = await prisma.organizerUser.findUnique({
      where: { id },
    });

    if (!member || member.organizerId !== user.organizerId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Cannot remove yourself
    if (member.id === user.id) {
      return NextResponse.json(
        { error: 'You cannot remove yourself from the team' },
        { status: 400 }
      );
    }

    // Check if user can manage the target member's role
    if (!canManageRole(user.role, member.role)) {
      return NextResponse.json(
        { error: 'You cannot remove this team member' },
        { status: 403 }
      );
    }

    // Cannot remove the only owner
    if (member.role === 'OWNER') {
      const ownerCount = await prisma.organizerUser.count({
        where: {
          organizerId: user.organizerId,
          role: 'OWNER',
        },
      });

      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove the only owner' },
          { status: 400 }
        );
      }
    }

    await prisma.organizerUser.delete({
      where: { id },
    });

    // Log the activity (non-blocking)
    createActivityLog(user, {
      action: ACTIVITY_ACTIONS.TEAM.REMOVE_MEMBER,
      entityType: "team_member",
      entityId: id,
      entityLabel: member.fullName,
      metadata: {
        email: member.email,
        role: member.role,
      },
    }).catch((err) => console.error("Failed to log activity:", err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing team member:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 });
  }
}

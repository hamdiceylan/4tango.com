import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-middleware';

// Assign a tag to a dancer
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  try {
    const user = await requirePermission('registration:manage');
    const { id: dancerId, tagId } = await params;

    // Verify dancer exists
    const dancer = await prisma.dancer.findUnique({
      where: { id: dancerId },
    });

    if (!dancer) {
      return NextResponse.json({ error: 'Dancer not found' }, { status: 404 });
    }

    // Verify tag exists and belongs to this organizer
    const tag = await prisma.dancerTag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    if (tag.organizerId !== user.organizerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if already assigned
    const existingAssignment = await prisma.dancerTagAssignment.findUnique({
      where: {
        dancerId_tagId: {
          dancerId,
          tagId,
        },
      },
    });

    if (existingAssignment) {
      return NextResponse.json({ error: 'Tag already assigned' }, { status: 400 });
    }

    // Create assignment
    await prisma.dancerTagAssignment.create({
      data: {
        dancerId,
        tagId,
      },
    });

    return NextResponse.json({ success: true, tag });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error assigning tag:', error);
    return NextResponse.json({ error: 'Failed to assign tag' }, { status: 500 });
  }
}

// Remove a tag from a dancer
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  try {
    const user = await requirePermission('registration:manage');
    const { id: dancerId, tagId } = await params;

    // Verify tag belongs to this organizer
    const tag = await prisma.dancerTag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    if (tag.organizerId !== user.organizerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find and delete assignment
    const assignment = await prisma.dancerTagAssignment.findUnique({
      where: {
        dancerId_tagId: {
          dancerId,
          tagId,
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Tag assignment not found' }, { status: 404 });
    }

    await prisma.dancerTagAssignment.delete({
      where: { id: assignment.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error removing tag:', error);
    return NextResponse.json({ error: 'Failed to remove tag' }, { status: 500 });
  }
}

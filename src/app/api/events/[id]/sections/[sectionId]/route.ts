import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/events/[id]/sections/[sectionId] - Get a single section
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    const section = await prisma.eventPageSection.findUnique({
      where: { id: params.sectionId },
    });

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error fetching section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch section' },
      { status: 500 }
    );
  }
}

// PATCH /api/events/[id]/sections/[sectionId] - Update a section
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    const body = await request.json();
    const { title, content, isVisible } = body;

    // Build update data object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (isVisible !== undefined) updateData.isVisible = isVisible;

    const section = await prisma.eventPageSection.update({
      where: { id: params.sectionId },
      data: updateData,
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { error: 'Failed to update section' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/sections/[sectionId] - Delete a section
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    await prisma.eventPageSection.delete({
      where: { id: params.sectionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    );
  }
}

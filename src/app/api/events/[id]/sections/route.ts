import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SectionType, getDefaultContent } from '@/lib/section-types';

// GET /api/events/[id]/sections - Get all sections for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sections = await prisma.eventPageSection.findMany({
      where: { eventId: params.id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/sections - Create a new section
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { type, title, content, isVisible = true } = body;

    // Validate section type
    const validTypes: SectionType[] = [
      'HERO', 'ABOUT', 'SCHEDULE', 'ACCOMMODATION', 'DJ_TEAM',
      'PHOTOGRAPHERS', 'PRICING', 'GALLERY', 'CONTACT',
      'CUSTOM_TEXT', 'CUSTOM_HTML'
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid section type' },
        { status: 400 }
      );
    }

    // Get the highest order number for this event
    const lastSection = await prisma.eventPageSection.findFirst({
      where: { eventId: params.id },
      orderBy: { order: 'desc' },
    });

    const newOrder = (lastSection?.order ?? -1) + 1;

    // Create section with default content if none provided
    const sectionContent = content || getDefaultContent(type as SectionType);

    const section = await prisma.eventPageSection.create({
      data: {
        eventId: params.id,
        type: type as SectionType,
        order: newOrder,
        title,
        content: sectionContent,
        isVisible,
      },
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id]/sections - Reorder sections
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { sectionIds } = body;

    if (!Array.isArray(sectionIds)) {
      return NextResponse.json(
        { error: 'sectionIds must be an array' },
        { status: 400 }
      );
    }

    // Update order for each section
    const updates = sectionIds.map((id: string, index: number) =>
      prisma.eventPageSection.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);

    // Fetch and return updated sections
    const sections = await prisma.eventPageSection.findMany({
      where: { eventId: params.id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error reordering sections:', error);
    return NextResponse.json(
      { error: 'Failed to reorder sections' },
      { status: 500 }
    );
  }
}

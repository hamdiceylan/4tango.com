import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/events/[id]/packages - Get all packages for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const packages = await prisma.eventPackage.findMany({
      where: { eventId: id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/packages - Create a new package
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      price,
      currency = 'EUR',
      capacity,
      isActive = true,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Package name is required' },
        { status: 400 }
      );
    }

    if (price === undefined || price < 0) {
      return NextResponse.json(
        { error: 'Valid price is required' },
        { status: 400 }
      );
    }

    // Get the highest order number for this event
    const lastPackage = await prisma.eventPackage.findFirst({
      where: { eventId: id },
      orderBy: { order: 'desc' },
    });

    const newOrder = (lastPackage?.order ?? -1) + 1;

    const eventPackage = await prisma.eventPackage.create({
      data: {
        eventId: id,
        name,
        description,
        price,
        currency,
        capacity,
        order: newOrder,
        isActive,
      },
    });

    return NextResponse.json(eventPackage, { status: 201 });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      { error: 'Failed to create package' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id]/packages - Reorder packages
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { packageIds } = body;

    if (!Array.isArray(packageIds)) {
      return NextResponse.json(
        { error: 'packageIds must be an array' },
        { status: 400 }
      );
    }

    // Update order for each package
    const updates = packageIds.map((pkgId: string, index: number) =>
      prisma.eventPackage.update({
        where: { id: pkgId },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);

    // Fetch and return updated packages
    const packages = await prisma.eventPackage.findMany({
      where: { eventId: id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error('Error reordering packages:', error);
    return NextResponse.json(
      { error: 'Failed to reorder packages' },
      { status: 500 }
    );
  }
}

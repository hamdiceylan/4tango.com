import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/events/[id]/packages/[packageId] - Get a single package
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; packageId: string }> }
) {
  try {
    const { packageId } = await params;
    const eventPackage = await prisma.eventPackage.findUnique({
      where: { id: packageId },
    });

    if (!eventPackage) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(eventPackage);
  } catch (error) {
    console.error('Error fetching package:', error);
    return NextResponse.json(
      { error: 'Failed to fetch package' },
      { status: 500 }
    );
  }
}

// PATCH /api/events/[id]/packages/[packageId] - Update a package
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; packageId: string }> }
) {
  try {
    const { packageId } = await params;
    const body = await request.json();
    const {
      name,
      description,
      price,
      currency,
      capacity,
      isActive,
    } = body;

    // Build update data only with provided fields
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (currency !== undefined) updateData.currency = currency;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (isActive !== undefined) updateData.isActive = isActive;

    const eventPackage = await prisma.eventPackage.update({
      where: { id: packageId },
      data: updateData,
    });

    return NextResponse.json(eventPackage);
  } catch (error) {
    console.error('Error updating package:', error);
    return NextResponse.json(
      { error: 'Failed to update package' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/packages/[packageId] - Delete a package
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; packageId: string }> }
) {
  try {
    const { packageId } = await params;

    await prisma.eventPackage.delete({
      where: { id: packageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      { error: 'Failed to delete package' },
      { status: 500 }
    );
  }
}

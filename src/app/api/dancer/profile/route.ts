import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDancerSession } from '@/lib/auth';

// Get dancer profile
export async function GET() {
  try {
    const dancerUser = await getDancerSession();

    if (!dancerUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dancer = await prisma.dancer.findUnique({
      where: { id: dancerUser.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        city: true,
        country: true,
        profilePictureUrl: true,
        bio: true,
        phoneNumber: true,
        websiteUrl: true,
        socialLinks: true,
        preferences: true,
        createdAt: true,
      },
    });

    if (!dancer) {
      return NextResponse.json({ error: 'Dancer not found' }, { status: 404 });
    }

    return NextResponse.json(dancer);
  } catch (error) {
    console.error('Error fetching dancer profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// Update dancer profile
export async function PATCH(request: Request) {
  try {
    const dancerUser = await getDancerSession();

    if (!dancerUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      role,
      city,
      country,
      bio,
      phoneNumber,
      websiteUrl,
      socialLinks,
      preferences,
    } = body;

    // Validate role
    const validRoles = ['LEADER', 'FOLLOWER', 'SWITCH'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const updatedDancer = await prisma.dancer.update({
      where: { id: dancerUser.id },
      data: {
        ...(fullName && { fullName }),
        ...(role && { role }),
        ...(city !== undefined && { city }),
        ...(country !== undefined && { country }),
        ...(bio !== undefined && { bio }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(websiteUrl !== undefined && { websiteUrl }),
        ...(socialLinks !== undefined && { socialLinks }),
        ...(preferences !== undefined && { preferences }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        city: true,
        country: true,
        profilePictureUrl: true,
        bio: true,
        phoneNumber: true,
        websiteUrl: true,
        socialLinks: true,
        preferences: true,
      },
    });

    return NextResponse.json(updatedDancer);
  } catch (error) {
    console.error('Error updating dancer profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

// Delete dancer account
export async function DELETE() {
  try {
    const dancerUser = await getDancerSession();

    if (!dancerUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all related data (registrations, auth, etc. will cascade)
    await prisma.dancer.delete({
      where: { id: dancerUser.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting dancer account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}

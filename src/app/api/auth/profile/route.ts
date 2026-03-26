import { NextResponse } from "next/server";
import { getDancerSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/auth/profile - Get current dancer profile
export async function GET() {
  try {
    const dancer = await getDancerSession();

    if (!dancer) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const fullDancer = await prisma.dancer.findUnique({
      where: { id: dancer.id },
    });

    if (!fullDancer) {
      return NextResponse.json(
        { error: "Dancer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: fullDancer.id,
      email: fullDancer.email,
      fullName: fullDancer.fullName,
      role: fullDancer.role,
      city: fullDancer.city,
      country: fullDancer.country,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// POST /api/auth/profile - Update dancer profile
export async function POST(request: Request) {
  try {
    const dancer = await getDancerSession();

    if (!dancer) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fullName, city, country, role } = body;

    // Validate required fields
    if (!fullName || !city || !country) {
      return NextResponse.json(
        { error: "Full name, city, and country are required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["LEADER", "FOLLOWER", "SWITCH"];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid dance role" },
        { status: 400 }
      );
    }

    // Update dancer profile
    const updatedDancer = await prisma.dancer.update({
      where: { id: dancer.id },
      data: {
        fullName,
        city,
        country,
        ...(role && { role }),
      },
    });

    return NextResponse.json({
      id: updatedDancer.id,
      email: updatedDancer.email,
      fullName: updatedDancer.fullName,
      role: updatedDancer.role,
      city: updatedDancer.city,
      country: updatedDancer.country,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

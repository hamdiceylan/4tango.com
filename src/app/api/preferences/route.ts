import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET user preferences
export async function GET() {
  try {
    const auth = await requireAuth();

    const preferences = await prisma.organizerPreferences.findUnique({
      where: { organizerId: auth.organizerId! },
    });

    return NextResponse.json({
      registrationColumns: preferences?.registrationColumns || null,
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

// PUT update preferences
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await request.json();

    const { registrationColumns } = body;

    const preferences = await prisma.organizerPreferences.upsert({
      where: { organizerId: auth.organizerId! },
      update: {
        registrationColumns: registrationColumns || undefined,
      },
      create: {
        organizerId: auth.organizerId!,
        registrationColumns: registrationColumns || {},
      },
    });

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}

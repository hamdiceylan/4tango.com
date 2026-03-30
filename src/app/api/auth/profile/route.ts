import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// GET /api/auth/profile - Get current organizer profile
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      type: "organizer",
      id: session.id,
      email: session.email,
      fullName: session.fullName,
      role: session.role,
      organizerId: session.organizerId,
      organizerName: session.organizerName,
      onboardingCompleted: session.onboardingCompleted,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

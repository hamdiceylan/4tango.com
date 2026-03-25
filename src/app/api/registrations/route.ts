import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/registrations - Get all registrations for organizer's events
export async function GET(request: Request) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status");

    const registrations = await prisma.registration.findMany({
      where: {
        event: {
          organizerId: user.organizerId,
          ...(eventId && { id: eventId }),
        },
        ...(status && { registrationStatus: status as "REGISTERED" | "CONFIRMED" | "CANCELLED" | "WAITLIST" }),
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startAt: true,
          }
        },
        dancer: true,
        customFieldValues: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(registrations.map(reg => ({
      id: reg.id,
      fullName: reg.fullNameSnapshot,
      email: reg.emailSnapshot,
      role: reg.roleSnapshot,
      city: reg.citySnapshot,
      country: reg.countrySnapshot,
      experience: reg.experience,
      partnerEmail: reg.partnerEmail,
      dietaryRestrictions: reg.dietaryRestrictions,
      notes: reg.notes,
      internalNote: reg.internalNote,
      registrationStatus: reg.registrationStatus,
      paymentStatus: reg.paymentStatus,
      paymentAmount: reg.paymentAmount,
      accessToken: reg.accessToken,
      event: {
        id: reg.event.id,
        title: reg.event.title,
        slug: reg.event.slug,
        startAt: reg.event.startAt.toISOString(),
      },
      createdAt: reg.createdAt.toISOString(),
      customFieldValues: reg.customFieldValues,
    })));
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

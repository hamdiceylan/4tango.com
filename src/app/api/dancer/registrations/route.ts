import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDancerSession } from "@/lib/auth";

// GET /api/dancer/registrations - List dancer's registrations
export async function GET() {
  try {
    const dancer = await getDancerSession();
    if (!dancer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const registrations = await prisma.registration.findMany({
      where: { dancerId: dancer.id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            city: true,
            country: true,
            startAt: true,
            endAt: true,
            logoUrl: true,
            currency: true,
            status: true,
          },
        },
        customFieldValues: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      registrations.map((reg) => ({
        id: reg.id,
        fullName: reg.fullNameSnapshot,
        email: reg.emailSnapshot,
        role: reg.roleSnapshot,
        city: reg.citySnapshot,
        country: reg.countrySnapshot,
        experience: reg.experience,
        notes: reg.notes,
        packageId: reg.packageId,
        registrationStatus: reg.registrationStatus,
        paymentStatus: reg.paymentStatus,
        paymentAmount: reg.paymentAmount,
        accessToken: reg.accessToken,
        createdAt: reg.createdAt.toISOString(),
        customFieldValues: reg.customFieldValues,
        event: {
          ...reg.event,
          startAt: reg.event.startAt.toISOString(),
          endAt: reg.event.endAt.toISOString(),
        },
      }))
    );
  } catch (error) {
    console.error("Error fetching dancer registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

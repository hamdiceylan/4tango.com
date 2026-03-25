import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/events/[id] - Get event details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findFirst({
      where: {
        id: params.id,
        organizerId: user.organizerId,
      },
      include: {
        pageSections: {
          orderBy: { order: "asc" }
        },
        formFields: {
          orderBy: { order: "asc" }
        },
        packages: {
          orderBy: { order: "asc" }
        },
        registrations: {
          include: {
            dancer: true,
            customFieldValues: true,
          },
          orderBy: { createdAt: "desc" }
        },
        _count: {
          select: { registrations: true }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...event,
      startAt: event.startAt.toISOString(),
      endAt: event.endAt.toISOString(),
      registrationOpensAt: event.registrationOpensAt?.toISOString() || null,
      registrationClosesAt: event.registrationClosesAt?.toISOString() || null,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      registrations: event.registrations.map(reg => ({
        id: reg.id,
        fullName: reg.fullNameSnapshot,
        email: reg.emailSnapshot,
        role: reg.roleSnapshot,
        city: reg.citySnapshot,
        country: reg.countrySnapshot,
        experience: reg.experience,
        registrationStatus: reg.registrationStatus,
        paymentStatus: reg.paymentStatus,
        paymentAmount: reg.paymentAmount,
        createdAt: reg.createdAt.toISOString(),
        accessToken: reg.accessToken,
        customFieldValues: reg.customFieldValues,
      })),
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// PATCH /api/events/[id] - Update event
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: params.id,
        organizerId: user.organizerId,
      }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      shortDescription,
      description,
      city,
      country,
      venueName,
      address,
      startAt,
      endAt,
      priceAmount,
      currency,
      capacityLimit,
      registrationOpensAt,
      registrationClosesAt,
      status,
      djs,
      primaryColor,
      logoUrl,
      bannerUrl,
      coverImageUrl,
    } = body;

    // Check slug uniqueness if changed
    if (slug && slug !== existingEvent.slug) {
      const slugExists = await prisma.event.findFirst({
        where: {
          slug,
          id: { not: params.id }
        }
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "An event with this URL slug already exists" },
          { status: 400 }
        );
      }
    }

    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-") }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(description !== undefined && { description }),
        ...(city !== undefined && { city }),
        ...(country !== undefined && { country }),
        ...(venueName !== undefined && { venueName }),
        ...(address !== undefined && { address }),
        ...(startAt !== undefined && { startAt: new Date(startAt) }),
        ...(endAt !== undefined && { endAt: new Date(endAt) }),
        ...(priceAmount !== undefined && { priceAmount }),
        ...(currency !== undefined && { currency }),
        ...(capacityLimit !== undefined && { capacityLimit }),
        ...(registrationOpensAt !== undefined && { registrationOpensAt: registrationOpensAt ? new Date(registrationOpensAt) : null }),
        ...(registrationClosesAt !== undefined && { registrationClosesAt: registrationClosesAt ? new Date(registrationClosesAt) : null }),
        ...(status !== undefined && { status }),
        ...(djs !== undefined && { djs }),
        ...(primaryColor !== undefined && { primaryColor }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(bannerUrl !== undefined && { bannerUrl }),
        ...(coverImageUrl !== undefined && { coverImageUrl }),
      }
    });

    return NextResponse.json({
      id: event.id,
      slug: event.slug,
      status: event.status,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const event = await prisma.event.findFirst({
      where: {
        id: params.id,
        organizerId: user.organizerId,
      }
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.event.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}

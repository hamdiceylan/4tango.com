import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/events - Get all events for the logged-in organizer
export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      where: { organizerId: user.organizerId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            registrations: true,
          }
        }
      }
    });

    return NextResponse.json(events.map(event => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      city: event.city,
      country: event.country,
      startAt: event.startAt.toISOString(),
      endAt: event.endAt.toISOString(),
      status: event.status,
      capacityLimit: event.capacityLimit,
      registrationCount: event._count.registrations,
      coverImageUrl: event.coverImageUrl,
      createdAt: event.createdAt.toISOString(),
    })));
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request: Request) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      djs,
      coverImageUrl,
    } = body;

    // Validate required fields
    if (!title || !slug || !city || !country || !startAt || !endAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existingEvent = await prisma.event.findUnique({
      where: { slug }
    });

    if (existingEvent) {
      return NextResponse.json(
        { error: "An event with this URL slug already exists" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        organizerId: user.organizerId,
        title,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        shortDescription: shortDescription || null,
        description: description || null,
        city,
        country,
        venueName: venueName || null,
        address: address || null,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        priceAmount: priceAmount || 0,
        currency: currency || "EUR",
        capacityLimit: capacityLimit || null,
        djs: djs || [],
        coverImageUrl: coverImageUrl || null,
        status: "DRAFT",
      }
    });

    return NextResponse.json({
      id: event.id,
      slug: event.slug,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

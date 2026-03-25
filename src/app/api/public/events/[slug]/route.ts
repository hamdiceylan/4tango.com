import { NextResponse } from "next/server";

// GET /api/events/[slug] - Get public event by slug
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // In production, fetch from database:
    // const event = await prisma.event.findUnique({
    //   where: { slug: params.slug, status: "PUBLISHED" },
    //   include: { organizer: { select: { name: true, email: true } } }
    // });

    // Mock response for now
    const event = {
      id: "1",
      title: "Spring Tango Marathon",
      slug: params.slug,
      shortDescription: "Three days of non-stop tango in the heart of Barcelona",
      description: "Join us for an unforgettable tango experience!",
      city: "Barcelona",
      country: "Spain",
      venueName: "Sala Apolo",
      address: "Carrer Nou de la Rambla, 113",
      startAt: "2026-04-15T18:00:00Z",
      endAt: "2026-04-17T06:00:00Z",
      priceAmount: 9500, // cents
      currency: "EUR",
      capacityLimit: 150,
      djs: ["DJ Pablo", "DJ Maria", "DJ Carlos"],
      organizer: {
        name: "Tango Barcelona",
        email: "info@tangobarcelona.com",
      },
    };

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Event not found" },
      { status: 404 }
    );
  }
}

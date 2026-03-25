import { NextResponse } from "next/server";

// POST /api/events/[slug]/register - Create registration
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, role } = body;
    // Additional fields for production use
    void body.experience;
    void body.city;
    void body.country;
    void body.partnerEmail;
    void body.dietaryRestrictions;
    void body.comments;

    // Validate required fields
    if (!firstName || !lastName || !email || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // In production:
    // 1. Find or create dancer record
    // const dancer = await prisma.dancer.upsert({
    //   where: { email },
    //   update: { fullName: `${firstName} ${lastName}`, role, city, country },
    //   create: { email, fullName: `${firstName} ${lastName}`, role, city, country }
    // });

    // 2. Find event by slug
    // const event = await prisma.event.findUnique({ where: { slug: params.slug } });

    // 3. Check capacity and balance

    // 4. Create registration
    // const registration = await prisma.registration.create({
    //   data: {
    //     eventId: event.id,
    //     dancerId: dancer.id,
    //     fullNameSnapshot: `${firstName} ${lastName}`,
    //     emailSnapshot: email,
    //     roleSnapshot: role,
    //     citySnapshot: city,
    //     countrySnapshot: country,
    //     experience,
    //     partnerEmail,
    //     dietaryRestrictions,
    //     notes: comments,
    //   }
    // });

    // 5. If paid event, create Stripe checkout session
    // 6. Send confirmation email

    // Mock response
    const registration = {
      id: "reg_" + Math.random().toString(36).substr(2, 9),
      confirmationNumber: "4T-2026-" + Math.random().toString().substr(2, 6),
      accessToken: Math.random().toString(36).substr(2, 20),
      eventSlug: params.slug,
      status: "registered",
    };

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error("Error creating registration:", error);
    return NextResponse.json(
      { error: "Failed to create registration" },
      { status: 500 }
    );
  }
}

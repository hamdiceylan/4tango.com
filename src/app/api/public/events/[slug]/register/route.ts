import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail, getRegistrationConfirmationEmailHtml } from "@/lib/email";
import { DancerRole } from "@prisma/client";

// POST /api/public/events/[slug]/register - Create registration
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      role,
      experience,
      city,
      country,
      partnerEmail,
      dietaryRestrictions,
      comments,
      packageId,
      customFields // Object with fieldId: value pairs
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find event by slug
    const event = await prisma.event.findUnique({
      where: { slug: params.slug },
      include: {
        formFields: true,
        packages: true,
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (event.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Event is not open for registration" },
        { status: 400 }
      );
    }

    // Check registration dates
    const now = new Date();
    if (event.registrationOpensAt && now < event.registrationOpensAt) {
      return NextResponse.json(
        { error: "Registration has not opened yet" },
        { status: 400 }
      );
    }
    if (event.registrationClosesAt && now > event.registrationClosesAt) {
      return NextResponse.json(
        { error: "Registration has closed" },
        { status: 400 }
      );
    }

    // Check capacity
    if (event.capacityLimit) {
      const registrationCount = await prisma.registration.count({
        where: {
          eventId: event.id,
          registrationStatus: { in: ["REGISTERED", "CONFIRMED"] }
        }
      });
      if (registrationCount >= event.capacityLimit) {
        return NextResponse.json(
          { error: "Event is at full capacity" },
          { status: 400 }
        );
      }
    }

    // Map role string to enum
    const dancerRole: DancerRole = role.toUpperCase() === "LEADER"
      ? "LEADER"
      : role.toUpperCase() === "SWITCH"
        ? "SWITCH"
        : "FOLLOWER";

    // Find or create dancer
    const dancer = await prisma.dancer.upsert({
      where: { email: email.toLowerCase() },
      update: {
        fullName: `${firstName} ${lastName}`,
        role: dancerRole,
        city: city || undefined,
        country: country || undefined,
      },
      create: {
        email: email.toLowerCase(),
        fullName: `${firstName} ${lastName}`,
        role: dancerRole,
        city: city || undefined,
        country: country || undefined,
      }
    });

    // Check if already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        eventId_dancerId: {
          eventId: event.id,
          dancerId: dancer.id,
        }
      }
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: "You are already registered for this event" },
        { status: 400 }
      );
    }

    // Create registration
    const registration = await prisma.registration.create({
      data: {
        eventId: event.id,
        dancerId: dancer.id,
        fullNameSnapshot: `${firstName} ${lastName}`,
        emailSnapshot: email.toLowerCase(),
        roleSnapshot: dancerRole,
        citySnapshot: city || null,
        countrySnapshot: country || null,
        experience: experience || null,
        partnerEmail: partnerEmail || null,
        dietaryRestrictions: dietaryRestrictions || null,
        notes: comments || null,
        packageId: packageId || null,
        registrationStatus: event.priceAmount > 0 ? "REGISTERED" : "CONFIRMED",
        paymentStatus: event.priceAmount > 0 ? "UNPAID" : "PAID",
        paymentAmount: event.priceAmount,
      }
    });

    // Save custom field values
    if (customFields && typeof customFields === "object") {
      const fieldValues = Object.entries(customFields).map(([fieldId, value]) => ({
        registrationId: registration.id,
        fieldId,
        value: String(value),
      }));

      if (fieldValues.length > 0) {
        await prisma.registrationFieldValue.createMany({
          data: fieldValues,
        });
      }
    }

    // Generate confirmation number
    const confirmationNumber = `4T-${event.startAt.getFullYear()}-${registration.id.slice(-6).toUpperCase()}`;

    // Send confirmation email
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://4tango.com";
    const registrationUrl = `${baseUrl}/registration/${registration.accessToken}`;

    try {
      await sendEmail({
        to: email,
        subject: `Registration Confirmed - ${event.title}`,
        html: getRegistrationConfirmationEmailHtml({
          eventTitle: event.title,
          eventDate: event.startAt.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          dancerName: `${firstName} ${lastName}`,
          confirmationNumber,
          registrationUrl,
        }),
      });

      // Update email sent timestamp
      await prisma.registration.update({
        where: { id: registration.id },
        data: { emailSentAt: new Date() }
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the registration if email fails
    }

    return NextResponse.json({
      id: registration.id,
      confirmationNumber,
      accessToken: registration.accessToken,
      eventSlug: params.slug,
      status: registration.registrationStatus.toLowerCase(),
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating registration:", error);
    return NextResponse.json(
      { error: "Failed to create registration" },
      { status: 500 }
    );
  }
}

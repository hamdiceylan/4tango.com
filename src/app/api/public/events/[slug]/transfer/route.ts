import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/public/events/[slug]/transfer - Submit transfer request
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, customFields } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "First name, last name, and email are required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { slug: params.slug },
      include: { transferFormFields: true },
    });

    if (!event || event.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Event not found or not open" },
        { status: 404 }
      );
    }

    const fullName = `${firstName} ${lastName}`;
    const normalizedEmail = email.toLowerCase().trim();

    // Create transfer request
    const transfer = await prisma.transferRequest.create({
      data: {
        eventId: event.id,
        fullName,
        email: normalizedEmail,
      },
    });

    // Save custom field values
    if (customFields && typeof customFields === "object") {
      const fieldValues = Object.entries(customFields)
        .filter(([, value]) => value !== "" && value !== undefined)
        .map(([fieldId, value]) => ({
          transferRequestId: transfer.id,
          fieldId,
          value: String(value),
        }));

      if (fieldValues.length > 0) {
        await prisma.transferFieldValue.createMany({ data: fieldValues });
      }
    }

    // Send notification to organizer
    try {
      const organizer = await prisma.organizer.findUnique({
        where: { id: event.organizerId },
      });
      if (organizer) {
        const { sendEmail: sendSesEmail, getDancerMagicLinkEmailHtml } = await import("@/lib/email");
        const contactEmail = event.contactEmail || organizer.email;
        await sendSesEmail({
          to: contactEmail,
          subject: `New Transfer Request - ${event.title} - ${fullName}`,
          html: `<p>New transfer request from <strong>${fullName}</strong> (${normalizedEmail}) for ${event.title}.</p><p>Log in to your dashboard to review.</p>`,
        });
      }
    } catch (emailError) {
      console.error("Failed to send transfer notification:", emailError);
    }

    return NextResponse.json(
      {
        id: transfer.id,
        accessToken: transfer.accessToken,
        message: "Transfer request submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating transfer request:", error);
    return NextResponse.json(
      { error: "Failed to submit transfer request" },
      { status: 500 }
    );
  }
}

// GET /api/public/events/[slug]/transfer - Get transfer form fields
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "en";

    const event = await prisma.event.findUnique({
      where: { slug: params.slug },
      include: {
        transferFormFields: { orderBy: { order: "asc" } },
        organizer: { select: { name: true } },
      },
    });

    if (!event || event.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const { localizeContent } = await import("@/lib/i18n/localize-content");
    const defaultLang = event.defaultLanguage as Parameters<typeof localizeContent>[2];

    return NextResponse.json({
      id: event.id,
      title: event.title,
      slug: event.slug,
      city: event.city,
      country: event.country,
      startAt: event.startAt.toISOString(),
      endAt: event.endAt.toISOString(),
      primaryColor: event.primaryColor,
      logoUrl: event.logoUrl,
      availableLanguages: event.availableLanguages,
      defaultLanguage: event.defaultLanguage,
      organizer: { name: event.organizer.name },
      formFields: event.transferFormFields.map((field) => ({
        id: field.id,
        fieldType: field.fieldType,
        name: field.name,
        label: localizeContent(field.labels || field.label, lang as Parameters<typeof localizeContent>[1], defaultLang),
        placeholder: localizeContent(field.placeholders || field.placeholder, lang as Parameters<typeof localizeContent>[1], defaultLang),
        helpText: localizeContent(field.helpTexts || field.helpText, lang as Parameters<typeof localizeContent>[1], defaultLang),
        isRequired: field.isRequired,
        order: field.order,
        options: field.options,
        conditionalOn: field.conditionalOn,
      })),
    });
  } catch (error) {
    console.error("Error fetching transfer form:", error);
    return NextResponse.json(
      { error: "Failed to fetch transfer form" },
      { status: 500 }
    );
  }
}

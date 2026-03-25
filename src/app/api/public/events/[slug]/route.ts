import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/public/events/[slug] - Get public event by slug
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { slug: params.slug },
      include: {
        organizer: {
          select: { name: true, email: true }
        },
        pageSections: {
          where: { isVisible: true },
          orderBy: { order: "asc" }
        },
        formFields: {
          orderBy: { order: "asc" }
        },
        packages: {
          where: { isActive: true },
          orderBy: { order: "asc" }
        },
        _count: {
          select: {
            registrations: {
              where: {
                registrationStatus: { in: ["REGISTERED", "CONFIRMED"] }
              }
            }
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Only show published events publicly (or allow preview with special header)
    const isPreview = request.headers.get("x-preview-mode") === "true";
    if (event.status !== "PUBLISHED" && !isPreview) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Calculate spots remaining
    const spotsRemaining = event.capacityLimit
      ? event.capacityLimit - event._count.registrations
      : null;

    return NextResponse.json({
      id: event.id,
      title: event.title,
      slug: event.slug,
      shortDescription: event.shortDescription,
      description: event.description,
      coverImageUrl: event.coverImageUrl,
      city: event.city,
      country: event.country,
      venueName: event.venueName,
      address: event.address,
      startAt: event.startAt.toISOString(),
      endAt: event.endAt.toISOString(),
      priceAmount: event.priceAmount,
      currency: event.currency,
      capacityLimit: event.capacityLimit,
      spotsRemaining,
      registrationOpensAt: event.registrationOpensAt?.toISOString() || null,
      registrationClosesAt: event.registrationClosesAt?.toISOString() || null,
      status: event.status,
      djs: event.djs,
      primaryColor: event.primaryColor,
      logoUrl: event.logoUrl,
      bannerUrl: event.bannerUrl,
      organizer: event.organizer,
      pageSections: event.pageSections.map(section => ({
        id: section.id,
        type: section.type,
        order: section.order,
        title: section.title,
        content: section.content,
        isVisible: section.isVisible,
      })),
      formFields: event.formFields.map(field => ({
        id: field.id,
        fieldType: field.fieldType,
        name: field.name,
        label: field.label,
        placeholder: field.placeholder,
        helpText: field.helpText,
        isRequired: field.isRequired,
        order: field.order,
        options: field.options,
        validation: field.validation,
        conditionalOn: field.conditionalOn,
      })),
      packages: event.packages.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        currency: pkg.currency,
        capacity: pkg.capacity,
        order: pkg.order,
      })),
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch event", details: errorMessage },
      { status: 500 }
    );
  }
}

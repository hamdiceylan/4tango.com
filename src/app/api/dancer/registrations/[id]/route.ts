import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDancerSession } from "@/lib/auth";

// Fields that are always locked (never editable by dancer)
const ALWAYS_LOCKED = ["emailSnapshot", "registrationStatus", "paymentStatus"];

// Fields locked after CONFIRMED status
const LOCKED_AFTER_CONFIRMED = [
  "fullNameSnapshot",
  "roleSnapshot",
  "citySnapshot",
  "countrySnapshot",
  "experience",
  "packageId",
];

// Statuses where all fields are read-only
const READ_ONLY_STATUSES = ["REJECTED", "CANCELLED"];

// GET /api/dancer/registrations/[id] - Get registration detail
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dancer = await getDancerSession();
    if (!dancer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const registration = await prisma.registration.findUnique({
      where: { id: params.id },
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
            formFields: {
              orderBy: { order: "asc" },
            },
            packages: {
              where: { isActive: true },
              orderBy: { order: "asc" },
            },
          },
        },
        customFieldValues: true,
      },
    });

    if (!registration || registration.dancerId !== dancer.id) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    // Determine which fields are editable
    const isReadOnly = READ_ONLY_STATUSES.includes(registration.registrationStatus);
    const isConfirmed = ["CONFIRMED", "CHECKED_IN"].includes(registration.registrationStatus);

    return NextResponse.json({
      id: registration.id,
      fullName: registration.fullNameSnapshot,
      email: registration.emailSnapshot,
      role: registration.roleSnapshot,
      city: registration.citySnapshot,
      country: registration.countrySnapshot,
      experience: registration.experience,
      notes: registration.notes,
      packageId: registration.packageId,
      registrationStatus: registration.registrationStatus,
      paymentStatus: registration.paymentStatus,
      paymentAmount: registration.paymentAmount,
      accessToken: registration.accessToken,
      createdAt: registration.createdAt.toISOString(),
      customFieldValues: registration.customFieldValues,
      event: {
        ...registration.event,
        startAt: registration.event.startAt.toISOString(),
        endAt: registration.event.endAt.toISOString(),
      },
      editability: {
        isReadOnly,
        isConfirmed,
        lockedFields: isReadOnly
          ? "all"
          : isConfirmed
            ? [...ALWAYS_LOCKED, ...LOCKED_AFTER_CONFIRMED]
            : ALWAYS_LOCKED,
      },
    });
  } catch (error) {
    console.error("Error fetching dancer registration:", error);
    return NextResponse.json(
      { error: "Failed to fetch registration" },
      { status: 500 }
    );
  }
}

// PATCH /api/dancer/registrations/[id] - Update registration
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dancer = await getDancerSession();
    if (!dancer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const registration = await prisma.registration.findUnique({
      where: { id: params.id },
    });

    if (!registration || registration.dancerId !== dancer.id) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    // Check if registration is editable
    if (READ_ONLY_STATUSES.includes(registration.registrationStatus)) {
      return NextResponse.json(
        { error: "This registration cannot be edited" },
        { status: 403 }
      );
    }

    const isConfirmed = ["CONFIRMED", "CHECKED_IN"].includes(registration.registrationStatus);
    const body = await request.json();
    const { customFields, notes, experience, fullName, role, city, country, packageId } = body;

    // Build update data, respecting locked fields
    const updateData: Record<string, unknown> = {};

    // Notes/comments — always editable (when not read-only)
    if (notes !== undefined) {
      updateData.notes = notes || null;
    }

    // Fields locked after confirmation
    if (!isConfirmed) {
      if (experience !== undefined) updateData.experience = experience || null;
      if (fullName !== undefined) updateData.fullNameSnapshot = fullName;
      if (role !== undefined) updateData.roleSnapshot = role;
      if (city !== undefined) updateData.citySnapshot = city || null;
      if (country !== undefined) updateData.countrySnapshot = country || null;
      if (packageId !== undefined) updateData.packageId = packageId || null;
    }

    // Update registration
    await prisma.registration.update({
      where: { id: params.id },
      data: updateData,
    });

    // Upsert custom field values
    if (customFields && typeof customFields === "object") {
      const upserts = Object.entries(customFields).map(([fieldId, value]) =>
        prisma.registrationFieldValue.upsert({
          where: {
            registrationId_fieldId: {
              registrationId: params.id,
              fieldId,
            },
          },
          update: { value: String(value) },
          create: {
            registrationId: params.id,
            fieldId,
            value: String(value),
          },
        })
      );

      await prisma.$transaction(upserts);
    }

    return NextResponse.json({ success: true, message: "Registration updated" });
  } catch (error) {
    console.error("Error updating dancer registration:", error);
    return NextResponse.json(
      { error: "Failed to update registration" },
      { status: 500 }
    );
  }
}

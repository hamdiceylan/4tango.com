import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/registrations/[id] - Get registration details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const registration = await prisma.registration.findFirst({
      where: {
        id: params.id,
        event: { organizerId: user.organizerId }
      },
      include: {
        event: true,
        dancer: true,
        customFieldValues: true,
        emailEvents: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    return NextResponse.json(registration);
  } catch (error) {
    console.error("Error fetching registration:", error);
    return NextResponse.json(
      { error: "Failed to fetch registration" },
      { status: 500 }
    );
  }
}

// PATCH /api/registrations/[id] - Update registration
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
    const existingReg = await prisma.registration.findFirst({
      where: {
        id: params.id,
        event: { organizerId: user.organizerId }
      },
      include: { event: true }
    });

    if (!existingReg) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      registrationStatus,
      paymentStatus,
      internalNote,
    } = body;

    const registration = await prisma.registration.update({
      where: { id: params.id },
      data: {
        ...(registrationStatus !== undefined && { registrationStatus }),
        ...(paymentStatus !== undefined && { paymentStatus }),
        ...(internalNote !== undefined && { internalNote }),
      },
      include: { event: true }
    });

    return NextResponse.json({
      id: registration.id,
      registrationStatus: registration.registrationStatus,
      paymentStatus: registration.paymentStatus,
    });
  } catch (error) {
    console.error("Error updating registration:", error);
    return NextResponse.json(
      { error: "Failed to update registration" },
      { status: 500 }
    );
  }
}

// DELETE /api/registrations/[id] - Cancel/delete registration
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
    const registration = await prisma.registration.findFirst({
      where: {
        id: params.id,
        event: { organizerId: user.organizerId }
      }
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    // Soft delete - set status to cancelled
    await prisma.registration.update({
      where: { id: params.id },
      data: { registrationStatus: "CANCELLED" }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling registration:", error);
    return NextResponse.json(
      { error: "Failed to cancel registration" },
      { status: 500 }
    );
  }
}

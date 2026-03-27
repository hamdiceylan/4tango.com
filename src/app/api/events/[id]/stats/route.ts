import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/events/[id]/stats - Get event statistics
export async function GET(
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
      },
      select: {
        id: true,
        title: true,
        slug: true,
        city: true,
        country: true,
        startAt: true,
        endAt: true,
        currency: true,
        capacityLimit: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get all registrations for this event
    const registrations = await prisma.registration.findMany({
      where: { eventId: params.id },
      select: {
        roleSnapshot: true,
        registrationStatus: true,
        paymentStatus: true,
        paymentAmount: true,
      },
    });

    // Calculate statistics
    const total = registrations.length;

    // Role breakdown
    const roleStats = {
      leader: registrations.filter((r) => r.roleSnapshot === "LEADER").length,
      follower: registrations.filter((r) => r.roleSnapshot === "FOLLOWER").length,
      switch: registrations.filter((r) => r.roleSnapshot === "SWITCH").length,
    };

    // Status breakdown
    const statusStats = {
      registered: registrations.filter((r) => r.registrationStatus === "REGISTERED").length,
      pendingReview: registrations.filter((r) => r.registrationStatus === "PENDING_REVIEW").length,
      approved: registrations.filter((r) => r.registrationStatus === "APPROVED").length,
      confirmed: registrations.filter((r) => r.registrationStatus === "CONFIRMED").length,
      waitlist: registrations.filter((r) => r.registrationStatus === "WAITLIST").length,
      rejected: registrations.filter((r) => r.registrationStatus === "REJECTED").length,
      cancelled: registrations.filter((r) => r.registrationStatus === "CANCELLED").length,
      checkedIn: registrations.filter((r) => r.registrationStatus === "CHECKED_IN").length,
    };

    // Payment breakdown
    const paidRegistrations = registrations.filter((r) => r.paymentStatus === "PAID");
    const paymentStats = {
      paid: paidRegistrations.length,
      unpaid: registrations.filter((r) => r.paymentStatus === "UNPAID").length,
      pending: registrations.filter((r) => r.paymentStatus === "PENDING").length,
      partiallyPaid: registrations.filter((r) => r.paymentStatus === "PARTIALLY_PAID").length,
      refunded: registrations.filter((r) => r.paymentStatus === "REFUNDED").length,
      revenue: paidRegistrations.reduce((sum, r) => sum + (r.paymentAmount || 0), 0),
    };

    return NextResponse.json({
      event: {
        ...event,
        startAt: event.startAt.toISOString(),
        endAt: event.endAt.toISOString(),
      },
      stats: {
        total,
        role: roleStats,
        status: statusStats,
        payment: paymentStats,
      },
    });
  } catch (error) {
    console.error("Error fetching event stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch event stats" },
      { status: 500 }
    );
  }
}

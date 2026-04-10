import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET /api/transfers - List transfer requests for organizer
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status");

    const where = {
      event: { organizerId: auth.organizerId },
      ...(eventId && { eventId }),
      ...(status && { status: status as "PENDING" | "CONFIRMED" | "CANCELLED" }),
    };

    const transfers = await prisma.transferRequest.findMany({
      where,
      include: {
        event: { select: { id: true, title: true, slug: true } },
        fieldValues: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      transfers.map((t) => ({
        id: t.id,
        fullName: t.fullName,
        email: t.email,
        status: t.status,
        internalNote: t.internalNote,
        createdAt: t.createdAt.toISOString(),
        event: t.event,
        fieldValues: t.fieldValues,
      }))
    );
  } catch (error) {
    console.error("Error fetching transfers:", error);
    return NextResponse.json({ error: "Failed to fetch transfers" }, { status: 500 });
  }
}

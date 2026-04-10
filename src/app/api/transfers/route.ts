import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/transfers - List transfer requests for organizer
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {
      event: { organizerId: user.organizerId },
    };
    if (eventId) where.eventId = eventId;
    if (status) where.status = status;

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
        phone: t.phone,
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

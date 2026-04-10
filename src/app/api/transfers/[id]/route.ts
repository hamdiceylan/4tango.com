import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/transfers/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const auth = user;

    const transfer = await prisma.transferRequest.findFirst({
      where: { id: params.id, event: { organizerId: auth.organizerId } },
      include: {
        event: {
          select: { id: true, title: true, slug: true, transferFormFields: { orderBy: { order: "asc" } } },
        },
        fieldValues: true,
      },
    });

    if (!transfer) {
      return NextResponse.json({ error: "Transfer not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...transfer,
      createdAt: transfer.createdAt.toISOString(),
      updatedAt: transfer.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching transfer:", error);
    return NextResponse.json({ error: "Failed to fetch transfer" }, { status: 500 });
  }
}

// PATCH /api/transfers/[id] - Update status or internal note
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const auth = user;
    const body = await request.json();
    const { status, internalNote } = body;

    const existing = await prisma.transferRequest.findFirst({
      where: { id: params.id, event: { organizerId: auth.organizerId } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Transfer not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (internalNote !== undefined) updateData.internalNote = internalNote;

    const transfer = await prisma.transferRequest.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ id: transfer.id, status: transfer.status });
  } catch (error) {
    console.error("Error updating transfer:", error);
    return NextResponse.json({ error: "Failed to update transfer" }, { status: 500 });
  }
}

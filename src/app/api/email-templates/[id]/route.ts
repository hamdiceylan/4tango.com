import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET single email template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    const { id } = await params;

    const template = await prisma.emailTemplate.findFirst({
      where: {
        id,
        organizerId: auth.organizerId!,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error fetching email template:", error);
    return NextResponse.json(
      { error: "Failed to fetch email template" },
      { status: 500 }
    );
  }
}

// PUT update email template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Verify template belongs to this organizer
    const existing = await prisma.emailTemplate.findFirst({
      where: {
        id,
        organizerId: auth.organizerId!,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const { name, subject, htmlContent, eventId, isActive, variables } = body;

    // If eventId is provided, verify it belongs to this organizer
    if (eventId) {
      const event = await prisma.event.findFirst({
        where: {
          id: eventId,
          organizerId: auth.organizerId!,
        },
      });
      if (!event) {
        return NextResponse.json(
          { error: "Event not found" },
          { status: 404 }
        );
      }
    }

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        name: name || undefined,
        subject: subject || undefined,
        htmlContent: htmlContent || undefined,
        eventId: eventId === null ? null : eventId || undefined,
        isActive: typeof isActive === "boolean" ? isActive : undefined,
        variables: variables || undefined,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error updating email template:", error);
    return NextResponse.json(
      { error: "Failed to update email template" },
      { status: 500 }
    );
  }
}

// DELETE email template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    const { id } = await params;

    // Verify template belongs to this organizer
    const existing = await prisma.emailTemplate.findFirst({
      where: {
        id,
        organizerId: auth.organizerId!,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    await prisma.emailTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting email template:", error);
    return NextResponse.json(
      { error: "Failed to delete email template" },
      { status: 500 }
    );
  }
}

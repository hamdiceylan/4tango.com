import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET all email templates for the organizer
export async function GET() {
  try {
    const auth = await requireAuth();

    const templates = await prisma.emailTemplate.findMany({
      where: { organizerId: auth.organizerId! },
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching email templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch email templates" },
      { status: 500 }
    );
  }
}

// POST create a new email template
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await request.json();

    const { name, subject, htmlContent, eventId, isActive, variables } = body;

    if (!name || !subject || !htmlContent) {
      return NextResponse.json(
        { error: "Name, subject, and content are required" },
        { status: 400 }
      );
    }

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

    const template = await prisma.emailTemplate.create({
      data: {
        organizerId: auth.organizerId!,
        name,
        subject,
        htmlContent,
        eventId: eventId || null,
        isActive: isActive ?? true,
        variables: variables || [],
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

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Error creating email template:", error);
    return NextResponse.json(
      { error: "Failed to create email template" },
      { status: 500 }
    );
  }
}

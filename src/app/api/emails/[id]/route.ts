import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { resendEmail } from "@/lib/email-service";

// GET /api/emails/[id] - Get single email details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth();

    const email = await prisma.emailEvent.findFirst({
      where: {
        id: params.id,
        organizerId: auth.organizerId,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        registration: {
          select: {
            id: true,
            fullNameSnapshot: true,
            emailSnapshot: true,
            accessToken: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!email) {
      return NextResponse.json(
        { error: "Email not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: email.id,
      recipientEmail: email.recipientEmail,
      recipientName: email.recipientName,
      subject: email.subject,
      htmlContent: email.htmlContent,
      emailType: email.emailType,
      status: email.status,
      messageId: email.messageId,
      trackingId: email.trackingId,
      sentAt: email.sentAt?.toISOString(),
      deliveredAt: email.deliveredAt?.toISOString(),
      openedAt: email.openedAt?.toISOString(),
      clickedAt: email.clickedAt?.toISOString(),
      bouncedAt: email.bouncedAt?.toISOString(),
      errorMessage: email.errorMessage,
      bounceType: email.bounceType,
      createdAt: email.createdAt.toISOString(),
      updatedAt: email.updatedAt.toISOString(),
      event: email.event,
      registration: email.registration,
      template: email.template,
    });
  } catch (error) {
    console.error("Error fetching email:", error);
    return NextResponse.json(
      { error: "Failed to fetch email" },
      { status: 500 }
    );
  }
}

// POST /api/emails/[id] - Resend email
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth();

    // Verify email belongs to organizer
    const email = await prisma.emailEvent.findFirst({
      where: {
        id: params.id,
        organizerId: auth.organizerId,
      },
    });

    if (!email) {
      return NextResponse.json(
        { error: "Email not found" },
        { status: 404 }
      );
    }

    const result = await resendEmail(params.id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email resent successfully",
        newEmailEventId: result.newEmailEventId,
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to resend email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error resending email:", error);
    return NextResponse.json(
      { error: "Failed to resend email" },
      { status: 500 }
    );
  }
}

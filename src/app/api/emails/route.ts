import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { sendEmail, sendTemplatedEmail, type TemplateVariables } from "@/lib/email-service";
import { EmailType, EmailStatus } from "@prisma/client";

// GET /api/emails - List all emails for organizer
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const registrationId = searchParams.get("registrationId");
    const status = searchParams.get("status") as EmailStatus | null;
    const emailType = searchParams.get("emailType") as EmailType | null;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    const where = {
      organizerId: auth.organizerId,
      ...(eventId && { eventId }),
      ...(registrationId && { registrationId }),
      ...(status && { status }),
      ...(emailType && { emailType }),
    };

    const [emails, total] = await Promise.all([
      prisma.emailEvent.findMany({
        where,
        include: {
          event: {
            select: {
              id: true,
              title: true,
            },
          },
          registration: {
            select: {
              id: true,
              fullNameSnapshot: true,
            },
          },
          template: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.emailEvent.count({ where }),
    ]);

    return NextResponse.json({
      emails: emails.map((email) => ({
        id: email.id,
        recipientEmail: email.recipientEmail,
        recipientName: email.recipientName,
        subject: email.subject,
        emailType: email.emailType,
        status: email.status,
        sentAt: email.sentAt?.toISOString(),
        deliveredAt: email.deliveredAt?.toISOString(),
        openedAt: email.openedAt?.toISOString(),
        clickedAt: email.clickedAt?.toISOString(),
        bouncedAt: email.bouncedAt?.toISOString(),
        errorMessage: email.errorMessage,
        createdAt: email.createdAt.toISOString(),
        event: email.event,
        registration: email.registration,
        template: email.template,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}

// POST /api/emails - Send email to registration(s)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await request.json();

    const {
      registrationIds,
      emailType,
      subject,
      htmlContent,
      templateId,
      variables,
    } = body;

    if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
      return NextResponse.json(
        { error: "At least one registration ID is required" },
        { status: 400 }
      );
    }

    // Verify registrations belong to organizer
    const registrations = await prisma.registration.findMany({
      where: {
        id: { in: registrationIds },
        event: { organizerId: auth.organizerId },
      },
      include: {
        event: true,
      },
    });

    if (registrations.length !== registrationIds.length) {
      return NextResponse.json(
        { error: "Some registrations were not found" },
        { status: 404 }
      );
    }

    const results: { registrationId: string; success: boolean; error?: string }[] = [];

    // Send emails (with rate limiting to avoid overwhelming SES)
    for (const registration of registrations) {
      const regVariables: TemplateVariables = {
        dancerName: registration.fullNameSnapshot,
        dancerEmail: registration.emailSnapshot,
        dancerRole: registration.roleSnapshot.toLowerCase(),
        eventTitle: registration.event.title,
        ...variables,
      };

      let result;
      if (templateId || (!subject && !htmlContent)) {
        // Use template system
        result = await sendTemplatedEmail({
          to: registration.emailSnapshot,
          toName: registration.fullNameSnapshot,
          organizerId: auth.organizerId,
          eventId: registration.eventId,
          registrationId: registration.id,
          emailType: (emailType as EmailType) || "CUSTOM",
          variables: regVariables,
          customSubject: subject,
          customContent: htmlContent,
        });
      } else {
        // Send custom email
        result = await sendEmail({
          to: registration.emailSnapshot,
          toName: registration.fullNameSnapshot,
          subject: subject || "Message from Event Organizer",
          htmlContent: htmlContent || "",
          organizerId: auth.organizerId,
          eventId: registration.eventId,
          registrationId: registration.id,
          emailType: (emailType as EmailType) || "CUSTOM",
          templateId,
          variables: regVariables,
        });
      }

      results.push({
        registrationId: registration.id,
        success: result.success,
        error: result.error,
      });

      // Small delay between emails to avoid rate limiting
      if (registrations.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: failed === 0,
      message: `Sent ${successful} email(s)${failed > 0 ? `, ${failed} failed` : ""}`,
      results,
    });
  } catch (error) {
    console.error("Error sending emails:", error);
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { replaceTemplateVariables, type TemplateVariables } from "@/lib/email-service";
import { getDefaultTemplate } from "@/lib/email-templates/defaults";
import { EmailType } from "@prisma/client";

// POST /api/emails/preview - Preview email template with sample data
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await request.json();

    const {
      templateId,
      emailType,
      subject,
      htmlContent,
      variables,
      registrationId,
    } = body;

    // Build sample variables
    let sampleVariables: TemplateVariables = {
      dancerName: "John Doe",
      dancerEmail: "john.doe@example.com",
      dancerRole: "leader",
      eventTitle: "Summer Tango Festival 2026",
      eventDates: "August 15-18, 2026",
      eventLocation: "Buenos Aires, Argentina",
      eventCity: "Buenos Aires",
      eventCountry: "Argentina",
      registrationStatus: "Confirmed",
      paymentStatus: "Paid",
      paymentAmount: "150.00 EUR",
      paymentLink: "https://4tango.com/registration/sample",
      confirmationNumber: "4T-2026-ABC123",
      registrationUrl: "https://4tango.com/registration/sample",
      organizerName: auth.organizerName,
      organizerEmail: "organizer@example.com",
      customMessage: "This is a sample custom message.",
      ...variables,
    };

    // If registrationId provided, use real data
    if (registrationId) {
      const registration = await prisma.registration.findFirst({
        where: {
          id: registrationId,
          event: { organizerId: auth.organizerId },
        },
        include: {
          event: true,
        },
      });

      if (registration) {
        sampleVariables = {
          ...sampleVariables,
          dancerName: registration.fullNameSnapshot,
          dancerEmail: registration.emailSnapshot,
          dancerRole: registration.roleSnapshot.toLowerCase(),
          eventTitle: registration.event.title,
          eventCity: registration.event.city,
          eventCountry: registration.event.country,
          eventLocation: `${registration.event.city}, ${registration.event.country}`,
          registrationStatus: registration.registrationStatus.replace(/_/g, " ").toLowerCase(),
          paymentStatus: registration.paymentStatus.replace(/_/g, " ").toLowerCase(),
          paymentAmount: registration.paymentAmount
            ? `${(registration.paymentAmount / 100).toFixed(2)} ${registration.event.currency}`
            : "N/A",
          confirmationNumber: `4T-${registration.event.startAt.getFullYear()}-${registration.id.slice(-6).toUpperCase()}`,
          registrationUrl: `https://4tango.com/registration/${registration.accessToken}`,
          paymentLink: `https://4tango.com/registration/${registration.accessToken}`,
        };
      }
    }

    let finalSubject: string;
    let finalHtml: string;

    // Get content from template, custom content, or defaults
    if (templateId) {
      const template = await prisma.emailTemplate.findFirst({
        where: {
          id: templateId,
          organizerId: auth.organizerId,
        },
      });

      if (!template) {
        return NextResponse.json(
          { error: "Template not found" },
          { status: 404 }
        );
      }

      finalSubject = subject || template.subject;
      finalHtml = htmlContent || template.htmlContent;
    } else if (emailType) {
      const defaultTemplate = getDefaultTemplate(emailType as EmailType);
      finalSubject = subject || defaultTemplate.subject;
      finalHtml = htmlContent || defaultTemplate.htmlContent;
    } else if (subject && htmlContent) {
      finalSubject = subject;
      finalHtml = htmlContent;
    } else {
      return NextResponse.json(
        { error: "Either templateId, emailType, or subject+htmlContent is required" },
        { status: 400 }
      );
    }

    // Replace variables
    const processedSubject = replaceTemplateVariables(finalSubject, sampleVariables);
    const processedHtml = replaceTemplateVariables(finalHtml, sampleVariables);

    return NextResponse.json({
      subject: processedSubject,
      htmlContent: processedHtml,
    });
  } catch (error) {
    console.error("Error generating email preview:", error);
    return NextResponse.json(
      { error: "Failed to generate preview" },
      { status: 500 }
    );
  }
}

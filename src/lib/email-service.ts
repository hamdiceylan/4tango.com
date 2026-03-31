import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import prisma from "@/lib/prisma";
import { EmailType } from "@prisma/client";
import { getDefaultTemplate } from "@/lib/email-templates/defaults";

const ses = new SESClient({
  region: process.env.SES_REGION || "eu-west-1",
  credentials: process.env.SES_ACCESS_KEY_ID && process.env.SES_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
  } : undefined,
});

const FROM_EMAIL = process.env.SES_FROM_EMAIL || "noreply@4tango.com";
const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://4tango.com";

// Template variable types
export interface TemplateVariables {
  dancerName?: string;
  dancerEmail?: string;
  dancerRole?: string;
  eventTitle?: string;
  eventDates?: string;
  eventLocation?: string;
  eventCity?: string;
  eventCountry?: string;
  registrationStatus?: string;
  paymentStatus?: string;
  paymentAmount?: string;
  paymentLink?: string;
  confirmationNumber?: string;
  registrationUrl?: string;
  organizerName?: string;
  organizerEmail?: string;
  customMessage?: string;
  [key: string]: string | undefined;
}

export interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  organizerId: string;
  eventId?: string;
  registrationId?: string;
  emailType: EmailType;
  templateId?: string;
  variables?: TemplateVariables;
}

export interface SendTemplatedEmailOptions {
  to: string;
  toName?: string;
  organizerId: string;
  eventId?: string;
  registrationId?: string;
  emailType: EmailType;
  variables: TemplateVariables;
  customSubject?: string;
  customContent?: string;
}

// Replace template variables in content
export function replaceTemplateVariables(
  content: string,
  variables: TemplateVariables
): string {
  let result = content;

  // Add common aliases for backwards compatibility
  const extendedVariables: TemplateVariables = {
    ...variables,
    // Aliases - support both eventName and eventTitle
    eventName: variables.eventTitle,
    name: variables.dancerName,
    email: variables.dancerEmail,
    role: variables.dancerRole,
  };

  // Replace all provided variables - support both {{var}} and {var} formats
  for (const [key, value] of Object.entries(extendedVariables)) {
    if (value !== undefined) {
      // Double curly braces {{var}}
      result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
      // Single curly braces {var}
      result = result.replace(new RegExp(`{${key}}`, "g"), value);
    }
  }

  // Safety: Remove any remaining unreplaced variables to prevent showing raw placeholders
  const remainingDoubleVars = result.match(/{{[a-zA-Z_]+}}/g);
  const remainingSingleVars = result.match(/{[a-zA-Z_]+}/g);

  if (remainingDoubleVars && remainingDoubleVars.length > 0) {
    console.warn("Unreplaced template variables (double braces):", remainingDoubleVars);
    result = result.replace(/{{[a-zA-Z_]+}}/g, "");
  }

  if (remainingSingleVars && remainingSingleVars.length > 0) {
    console.warn("Unreplaced template variables (single braces):", remainingSingleVars);
    result = result.replace(/{[a-zA-Z_]+}/g, "");
  }

  return result;
}

// Add tracking pixel and rewrite links for click tracking
export function prepareEmailForTracking(
  html: string,
  trackingId: string
): string {
  // Add tracking pixel before closing body tag
  const trackingPixel = `<img src="${BASE_URL}/api/track/open/${trackingId}" width="1" height="1" style="display:none;" alt="" />`;

  let result = html;

  // Add tracking pixel
  if (result.includes("</body>")) {
    result = result.replace("</body>", `${trackingPixel}</body>`);
  } else {
    result = result + trackingPixel;
  }

  // Rewrite links for click tracking (except unsubscribe and tracking URLs)
  result = result.replace(
    /href="(https?:\/\/[^"]+)"/g,
    (match, url) => {
      // Don't track internal tracking URLs
      if (url.includes("/api/track/")) {
        return match;
      }
      const encodedUrl = encodeURIComponent(url);
      return `href="${BASE_URL}/api/track/click/${trackingId}?url=${encodedUrl}"`;
    }
  );

  return result;
}

// Get template for email type, checking custom templates first
export async function getTemplateOrDefault(
  organizerId: string,
  emailType: EmailType,
  eventId?: string
): Promise<{ subject: string; htmlContent: string; templateId?: string }> {
  // First try event-specific template
  if (eventId) {
    const eventTemplate = await prisma.emailTemplate.findFirst({
      where: {
        organizerId,
        eventId,
        name: emailTypeToTemplateName(emailType),
        isActive: true,
      },
    });
    if (eventTemplate) {
      return {
        subject: eventTemplate.subject,
        htmlContent: eventTemplate.htmlContent,
        templateId: eventTemplate.id,
      };
    }
  }

  // Try organization-wide template
  const orgTemplate = await prisma.emailTemplate.findFirst({
    where: {
      organizerId,
      eventId: null,
      name: emailTypeToTemplateName(emailType),
      isActive: true,
    },
  });
  if (orgTemplate) {
    return {
      subject: orgTemplate.subject,
      htmlContent: orgTemplate.htmlContent,
      templateId: orgTemplate.id,
    };
  }

  // Fall back to default template
  const defaultTemplate = getDefaultTemplate(emailType);
  return {
    subject: defaultTemplate.subject,
    htmlContent: defaultTemplate.htmlContent,
  };
}

function emailTypeToTemplateName(emailType: EmailType): string {
  switch (emailType) {
    case "REGISTRATION_CONFIRMATION":
      return "Registration Confirmation";
    case "ORGANIZER_NOTIFICATION":
      return "Organizer Notification";
    case "PAYMENT_REMINDER":
      return "Payment Reminder";
    case "STATUS_UPDATE":
      return "Status Update";
    case "CUSTOM":
      return "Custom";
    default:
      return "Custom";
  }
}

// Main function to send email with tracking
export async function sendEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  emailEventId?: string;
  messageId?: string;
  error?: string;
}> {
  const {
    to,
    toName,
    subject,
    htmlContent,
    organizerId,
    eventId,
    registrationId,
    emailType,
    templateId,
    variables,
  } = options;

  // Process variables if provided
  let processedSubject = subject;
  let processedHtml = htmlContent;
  if (variables) {
    processedSubject = replaceTemplateVariables(subject, variables);
    processedHtml = replaceTemplateVariables(htmlContent, variables);
  }

  // Create EmailEvent record first (in QUEUED status)
  const emailEvent = await prisma.emailEvent.create({
    data: {
      organizerId,
      eventId,
      registrationId,
      emailType,
      templateId,
      recipientEmail: to,
      recipientName: toName,
      subject: processedSubject,
      htmlContent: processedHtml,
      status: "QUEUED",
    },
  });

  // Add tracking to the email
  const trackedHtml = prepareEmailForTracking(processedHtml, emailEvent.trackingId);

  try {
    const command = new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: [toName ? `${toName} <${to}>` : to],
      },
      Message: {
        Subject: {
          Data: processedSubject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: trackedHtml,
            Charset: "UTF-8",
          },
        },
      },
    });

    const result = await ses.send(command);

    // Update EmailEvent with success
    await prisma.emailEvent.update({
      where: { id: emailEvent.id },
      data: {
        status: "SENT",
        messageId: result.MessageId,
        sentAt: new Date(),
      },
    });

    return {
      success: true,
      emailEventId: emailEvent.id,
      messageId: result.MessageId,
    };
  } catch (error) {
    // Update EmailEvent with failure
    await prisma.emailEvent.update({
      where: { id: emailEvent.id },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });

    console.error("Failed to send email:", error);
    return {
      success: false,
      emailEventId: emailEvent.id,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Send email using template system
export async function sendTemplatedEmail(
  options: SendTemplatedEmailOptions
): Promise<{
  success: boolean;
  emailEventId?: string;
  messageId?: string;
  error?: string;
}> {
  const {
    to,
    toName,
    organizerId,
    eventId,
    registrationId,
    emailType,
    variables,
    customSubject,
    customContent,
  } = options;

  // Get template
  const template = await getTemplateOrDefault(organizerId, emailType, eventId);

  // Use custom subject/content if provided, otherwise use template
  const subject = customSubject || template.subject;
  const htmlContent = customContent || template.htmlContent;

  return sendEmail({
    to,
    toName,
    subject,
    htmlContent,
    organizerId,
    eventId,
    registrationId,
    emailType,
    templateId: template.templateId,
    variables,
  });
}

// Send registration confirmation email
export async function sendRegistrationConfirmation(params: {
  registration: {
    id: string;
    fullNameSnapshot: string;
    emailSnapshot: string;
    roleSnapshot: string;
    accessToken: string;
  };
  event: {
    id: string;
    title: string;
    startAt: Date;
    endAt: Date;
    city: string;
    country: string;
  };
  organizerId: string;
}): Promise<{ success: boolean; error?: string }> {
  const { registration, event, organizerId } = params;

  const confirmationNumber = `4T-${event.startAt.getFullYear()}-${registration.id.slice(-6).toUpperCase()}`;
  const registrationUrl = `${BASE_URL}/registration/${registration.accessToken}`;

  const variables: TemplateVariables = {
    dancerName: registration.fullNameSnapshot,
    dancerEmail: registration.emailSnapshot,
    dancerRole: registration.roleSnapshot.toLowerCase(),
    eventTitle: event.title,
    eventDates: formatDateRange(event.startAt, event.endAt),
    eventCity: event.city,
    eventCountry: event.country,
    eventLocation: `${event.city}, ${event.country}`,
    confirmationNumber,
    registrationUrl,
  };

  const result = await sendTemplatedEmail({
    to: registration.emailSnapshot,
    toName: registration.fullNameSnapshot,
    organizerId,
    eventId: event.id,
    registrationId: registration.id,
    emailType: "REGISTRATION_CONFIRMATION",
    variables,
  });

  return { success: result.success, error: result.error };
}

// Send organizer notification for new registration
export async function sendOrganizerNotification(params: {
  registration: {
    id: string;
    fullNameSnapshot: string;
    emailSnapshot: string;
    roleSnapshot: string;
  };
  event: {
    id: string;
    title: string;
  };
  organizer: {
    id: string;
    email: string;
    name: string;
  };
}): Promise<{ success: boolean; error?: string }> {
  const { registration, event, organizer } = params;

  const variables: TemplateVariables = {
    dancerName: registration.fullNameSnapshot,
    dancerEmail: registration.emailSnapshot,
    dancerRole: registration.roleSnapshot.toLowerCase(),
    eventTitle: event.title,
    organizerName: organizer.name,
  };

  const result = await sendTemplatedEmail({
    to: organizer.email,
    toName: organizer.name,
    organizerId: organizer.id,
    eventId: event.id,
    registrationId: registration.id,
    emailType: "ORGANIZER_NOTIFICATION",
    variables,
  });

  return { success: result.success, error: result.error };
}

// Send payment reminder
export async function sendPaymentReminder(params: {
  registration: {
    id: string;
    fullNameSnapshot: string;
    emailSnapshot: string;
    paymentAmount: number | null;
    accessToken: string;
  };
  event: {
    id: string;
    title: string;
    currency: string;
  };
  organizerId: string;
  urgency?: "friendly" | "urgent" | "final";
  customMessage?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { registration, event, organizerId, urgency = "friendly", customMessage } = params;

  const paymentLink = `${BASE_URL}/registration/${registration.accessToken}`;
  const paymentAmount = registration.paymentAmount
    ? `${(registration.paymentAmount / 100).toFixed(2)} ${event.currency}`
    : "TBD";

  const variables: TemplateVariables = {
    dancerName: registration.fullNameSnapshot,
    eventTitle: event.title,
    paymentAmount,
    paymentLink,
    customMessage: customMessage || "",
  };

  // Adjust subject based on urgency
  let customSubject: string | undefined;
  switch (urgency) {
    case "urgent":
      customSubject = `Urgent: Payment Required for ${event.title}`;
      break;
    case "final":
      customSubject = `Final Notice: Payment Due for ${event.title}`;
      break;
    default:
      customSubject = undefined; // Use template default
  }

  const result = await sendTemplatedEmail({
    to: registration.emailSnapshot,
    toName: registration.fullNameSnapshot,
    organizerId,
    eventId: event.id,
    registrationId: registration.id,
    emailType: "PAYMENT_REMINDER",
    variables,
    customSubject,
  });

  return { success: result.success, error: result.error };
}

// Helper to format date range
function formatDateRange(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const startStr = start.toLocaleDateString("en-US", options);
  const endStr = end.toLocaleDateString("en-US", options);

  if (startStr === endStr) {
    return startStr;
  }

  // If same month and year, shorten
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${end.toLocaleDateString("en-US", { day: "numeric", year: "numeric" })}`;
  }

  return `${startStr} - ${endStr}`;
}

// Resend an existing email
export async function resendEmail(emailEventId: string): Promise<{
  success: boolean;
  newEmailEventId?: string;
  error?: string;
}> {
  const originalEmail = await prisma.emailEvent.findUnique({
    where: { id: emailEventId },
  });

  if (!originalEmail) {
    return { success: false, error: "Email not found" };
  }

  return sendEmail({
    to: originalEmail.recipientEmail,
    toName: originalEmail.recipientName || undefined,
    subject: originalEmail.subject,
    htmlContent: originalEmail.htmlContent,
    organizerId: originalEmail.organizerId,
    eventId: originalEmail.eventId || undefined,
    registrationId: originalEmail.registrationId || undefined,
    emailType: originalEmail.emailType,
    templateId: originalEmail.templateId || undefined,
  });
}

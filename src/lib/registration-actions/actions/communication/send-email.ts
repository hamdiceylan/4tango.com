import { ActionDefinition, ActionContext, ActionInput, ActionResult } from "../../types";
import prisma from "@/lib/prisma";
import { sendEmail, type TemplateVariables } from "@/lib/email-service";
import { getDefaultTemplate } from "@/lib/email-templates/defaults";
import { EmailType } from "@prisma/client";

export const sendEmailAction: ActionDefinition = {
  id: "send-email",
  name: "Send Email",
  description: "Send a custom email to this dancer",
  category: "communication",
  icon: "envelope",

  isAvailable: () => true,

  inputFields: [
    {
      name: "emailType",
      label: "Email type",
      type: "select",
      options: [
        { value: "CUSTOM", label: "Custom message" },
        { value: "REGISTRATION_CONFIRMATION", label: "Registration Confirmation" },
        { value: "STATUS_UPDATE", label: "Status Update" },
      ],
      defaultValue: "CUSTOM",
    },
    {
      name: "subject",
      label: "Email subject",
      type: "text",
      placeholder: "Subject line...",
      required: true,
    },
    {
      name: "message",
      label: "Email message",
      type: "textarea",
      placeholder: "Your message to the dancer...",
      required: true,
    },
  ],

  execute: async (context: ActionContext, input: ActionInput): Promise<ActionResult> => {
    try {
      if (!input.subject || !input.message) {
        return {
          success: false,
          message: "Subject and message are required",
        };
      }

      // Fetch registration details
      const registration = await prisma.registration.findUnique({
        where: { id: context.registrationId },
        include: {
          event: true,
        },
      });

      if (!registration) {
        return {
          success: false,
          message: "Registration not found",
        };
      }

      const emailType = (input.emailType as EmailType) || "CUSTOM";
      const defaultTemplate = getDefaultTemplate(emailType);

      // Build variables
      const variables: TemplateVariables = {
        dancerName: registration.fullNameSnapshot,
        dancerEmail: registration.emailSnapshot,
        dancerRole: registration.roleSnapshot.toLowerCase(),
        eventTitle: registration.event.title,
        eventLocation: `${registration.event.city}, ${registration.event.country}`,
        registrationStatus: registration.registrationStatus.replace(/_/g, " ").toLowerCase(),
        paymentStatus: registration.paymentStatus.replace(/_/g, " ").toLowerCase(),
        customMessage: String(input.message),
      };

      // For custom emails, wrap the message in basic HTML
      const htmlContent = emailType === "CUSTOM"
        ? wrapCustomMessage(String(input.message), registration.event.title)
        : defaultTemplate.htmlContent;

      const result = await sendEmail({
        to: registration.emailSnapshot,
        toName: registration.fullNameSnapshot,
        subject: String(input.subject),
        htmlContent,
        organizerId: context.organizerId,
        eventId: context.eventId,
        registrationId: context.registrationId,
        emailType,
        variables,
      });

      if (result.success) {
        return {
          success: true,
          message: "Email sent successfully",
          data: {
            emailEventId: result.emailEventId,
            messageId: result.messageId,
          },
        };
      } else {
        return {
          success: false,
          message: result.error || "Failed to send email",
        };
      }
    } catch (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to send email",
      };
    }
  },
};

function wrapCustomMessage(message: string, eventTitle: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 24px; color: #18181b; font-size: 24px; font-weight: 600; text-align: center;">${eventTitle}</h1>
              <div style="color: #52525b; font-size: 16px; line-height: 24px; white-space: pre-wrap;">
${message}
              </div>
            </td>
          </tr>
        </table>
        <p style="margin: 24px 0 0; color: #71717a; font-size: 12px;">
          Powered by 4Tango
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

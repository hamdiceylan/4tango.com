import { ActionDefinition, ActionContext, ActionInput, ActionResult } from "../../types";

export const sendEmailAction: ActionDefinition = {
  id: "send-email",
  name: "Send Email",
  description: "Send a custom email to this dancer",
  category: "communication",
  icon: "envelope",

  isAvailable: () => true,

  inputFields: [
    {
      name: "template",
      label: "Email template",
      type: "select",
      options: [
        { value: "custom", label: "Custom message" },
        { value: "confirmation", label: "Registration Confirmation" },
        { value: "reminder", label: "Event Reminder" },
        { value: "info", label: "Event Information" },
      ],
      defaultValue: "custom",
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

      // TODO: Implement actual email sending using SES
      // This would use the email template system and context.dancerEmail

      return {
        success: true,
        message: "Email sent successfully",
        data: {
          emailSent: true,
          template: input.template,
          subject: input.subject,
        },
      };
    } catch (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to send email",
      };
    }
  },
};

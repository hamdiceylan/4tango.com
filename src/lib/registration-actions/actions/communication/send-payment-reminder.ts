import { ActionDefinition, ActionContext, ActionInput, ActionResult } from "../../types";

export const sendPaymentReminderAction: ActionDefinition = {
  id: "send-payment-reminder",
  name: "Send Payment Reminder",
  description: "Remind dancer about pending payment",
  category: "communication",
  icon: "currency-dollar",

  isAvailable: (context: ActionContext) => {
    return ["UNPAID", "PENDING", "PARTIALLY_PAID"].includes(
      context.currentPaymentStatus
    );
  },

  inputFields: [
    {
      name: "urgency",
      label: "Urgency level",
      type: "select",
      options: [
        { value: "friendly", label: "Friendly reminder" },
        { value: "urgent", label: "Urgent - payment overdue" },
        { value: "final", label: "Final notice" },
      ],
      defaultValue: "friendly",
    },
    {
      name: "includePaymentLink",
      label: "Include payment link",
      type: "select",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
      defaultValue: "yes",
    },
    {
      name: "customMessage",
      label: "Additional message",
      type: "textarea",
      placeholder: "Any additional information...",
    },
  ],

  execute: async (context: ActionContext, input: ActionInput): Promise<ActionResult> => {
    try {
      // TODO: Implement actual payment reminder email sending
      // This would use payment reminder templates with different urgency levels

      return {
        success: true,
        message: "Payment reminder sent",
        data: {
          urgency: input.urgency,
          paymentLinkIncluded: input.includePaymentLink === "yes",
          sentAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Error sending payment reminder:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to send payment reminder",
      };
    }
  },
};

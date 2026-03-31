import { ActionDefinition, ActionContext, ActionInput, ActionResult } from "../../types";
import prisma from "@/lib/prisma";
import { sendPaymentReminder } from "@/lib/email-service";

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
      name: "customMessage",
      label: "Additional message",
      type: "textarea",
      placeholder: "Any additional information...",
    },
  ],

  execute: async (context: ActionContext, input: ActionInput): Promise<ActionResult> => {
    try {
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

      const urgency = (input.urgency as "friendly" | "urgent" | "final") || "friendly";
      const customMessage = input.customMessage ? String(input.customMessage) : undefined;

      const result = await sendPaymentReminder({
        registration: {
          id: registration.id,
          fullNameSnapshot: registration.fullNameSnapshot,
          emailSnapshot: registration.emailSnapshot,
          paymentAmount: registration.paymentAmount,
          accessToken: registration.accessToken,
        },
        event: {
          id: registration.event.id,
          title: registration.event.title,
          currency: registration.event.currency,
        },
        organizerId: context.organizerId,
        urgency,
        customMessage,
      });

      if (result.success) {
        return {
          success: true,
          message: "Payment reminder sent",
          data: {
            urgency,
            sentAt: new Date().toISOString(),
          },
        };
      } else {
        return {
          success: false,
          message: result.error || "Failed to send payment reminder",
        };
      }
    } catch (error) {
      console.error("Error sending payment reminder:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to send payment reminder",
      };
    }
  },
};

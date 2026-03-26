import prisma from "@/lib/prisma";
import { ActionDefinition, ActionContext, ActionInput, ActionResult } from "../../types";

export const requestPaymentAction: ActionDefinition = {
  id: "request-payment",
  name: "Request Payment",
  description: "Send a payment request to the dancer",
  category: "payment",
  icon: "credit-card",

  isAvailable: (context: ActionContext) => {
    return ["UNPAID", "PARTIALLY_PAID", "PAYMENT_FAILED"].includes(
      context.currentPaymentStatus
    );
  },

  inputFields: [
    {
      name: "amount",
      label: "Amount to request (in cents)",
      type: "number",
      placeholder: "Leave empty for full remaining amount",
    },
    {
      name: "dueDate",
      label: "Payment due date",
      type: "text",
      placeholder: "e.g., 2024-12-31",
    },
    {
      name: "message",
      label: "Custom message",
      type: "textarea",
      placeholder: "Additional message for the payment request...",
    },
  ],

  execute: async (context: ActionContext, input: ActionInput): Promise<ActionResult> => {
    try {
      // Update payment status to pending
      await prisma.registration.update({
        where: { id: context.registrationId },
        data: {
          paymentStatus: "PENDING",
        },
      });

      // TODO: Implement actual payment request email sending
      // This would integrate with the email template system

      return {
        success: true,
        message: "Payment request sent",
        data: {
          newPaymentStatus: "PENDING",
          requestedAmount: input.amount || context.paymentAmount,
          dueDate: input.dueDate,
        },
      };
    } catch (error) {
      console.error("Error sending payment request:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to send payment request",
      };
    }
  },
};

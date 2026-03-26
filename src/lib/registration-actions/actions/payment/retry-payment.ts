import prisma from "@/lib/prisma";
import { ActionDefinition, ActionContext, ActionInput, ActionResult } from "../../types";

export const retryPaymentAction: ActionDefinition = {
  id: "retry-payment",
  name: "Retry Payment",
  description: "Retry a failed payment attempt",
  category: "payment",
  icon: "arrow-path",

  isAvailable: (context: ActionContext) => {
    return context.currentPaymentStatus === "PAYMENT_FAILED";
  },

  inputFields: [
    {
      name: "sendLink",
      label: "Send new payment link",
      type: "select",
      options: [
        { value: "yes", label: "Yes, send new payment link" },
        { value: "no", label: "No, just reset status" },
      ],
      defaultValue: "yes",
    },
    {
      name: "message",
      label: "Message to dancer",
      type: "textarea",
      placeholder: "We noticed your payment didn't go through...",
    },
  ],

  execute: async (context: ActionContext, input: ActionInput): Promise<ActionResult> => {
    try {
      await prisma.registration.update({
        where: { id: context.registrationId },
        data: {
          paymentStatus: "PENDING",
        },
      });

      if (input.sendLink === "yes") {
        // TODO: Implement payment link generation and email sending
      }

      return {
        success: true,
        message: input.sendLink === "yes"
          ? "Payment link sent to dancer"
          : "Payment status reset to pending",
        data: {
          newPaymentStatus: "PENDING",
          linkSent: input.sendLink === "yes",
        },
      };
    } catch (error) {
      console.error("Error retrying payment:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retry payment",
      };
    }
  },
};

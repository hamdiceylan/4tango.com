import prisma from "@/lib/prisma";
import { ActionDefinition, ActionContext, ActionInput, ActionResult } from "../../types";

export const confirmAction: ActionDefinition = {
  id: "confirm",
  name: "Confirm",
  description: "Mark this registration as fully confirmed",
  category: "status",
  icon: "check-badge",

  isAvailable: (context: ActionContext) => {
    // Can confirm if approved or registered (with payment if required)
    if (context.currentStatus === "CONFIRMED" || context.currentStatus === "CHECKED_IN") {
      return false;
    }
    // Typically confirm when paid
    if (context.currentPaymentStatus === "PAID" || context.currentPaymentStatus === "PARTIALLY_PAID") {
      return true;
    }
    // Also allow confirming free events
    if (!context.paymentAmount || context.paymentAmount === 0) {
      return true;
    }
    return false;
  },

  inputFields: [
    {
      name: "sendConfirmation",
      label: "Send confirmation email",
      type: "select",
      options: [
        { value: "yes", label: "Yes, send confirmation" },
        { value: "no", label: "No" },
      ],
      defaultValue: "yes",
    },
  ],

  execute: async (context: ActionContext, input: ActionInput): Promise<ActionResult> => {
    try {
      await prisma.registration.update({
        where: { id: context.registrationId },
        data: {
          registrationStatus: "CONFIRMED",
        },
      });

      if (input.sendConfirmation === "yes") {
        // TODO: Implement email sending
      }

      return {
        success: true,
        message: "Registration confirmed successfully",
        data: {
          newStatus: "CONFIRMED",
        },
      };
    } catch (error) {
      console.error("Error confirming registration:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to confirm registration",
      };
    }
  },
};

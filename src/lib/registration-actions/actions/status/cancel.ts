import prisma from "@/lib/prisma";
import { ActionDefinition, ActionContext, ActionInput, ActionResult } from "../../types";

export const cancelAction: ActionDefinition = {
  id: "cancel",
  name: "Cancel",
  description: "Cancel this registration",
  category: "status",
  icon: "x-mark",

  isAvailable: (context: ActionContext) => {
    return !["CANCELLED", "CHECKED_IN"].includes(context.currentStatus);
  },

  inputFields: [
    {
      name: "reason",
      label: "Cancellation reason",
      type: "textarea",
      placeholder: "Reason for cancellation...",
    },
    {
      name: "initiateRefund",
      label: "Initiate refund",
      type: "select",
      options: [
        { value: "yes", label: "Yes, process refund" },
        { value: "no", label: "No refund" },
      ],
      defaultValue: "no",
    },
    {
      name: "sendNotification",
      label: "Notify dancer",
      type: "select",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
      defaultValue: "yes",
    },
  ],

  requiresConfirmation: true,
  confirmationMessage: "Are you sure you want to cancel this registration? This action may affect the dancer's spot.",

  execute: async (context: ActionContext, input: ActionInput): Promise<ActionResult> => {
    try {
      const updateData: Record<string, unknown> = {
        registrationStatus: "CANCELLED",
      };

      if (input.reason) {
        updateData.internalNote = `Cancelled: ${input.reason as string}`;
      }

      // Handle refund if requested
      if (input.initiateRefund === "yes" && context.currentPaymentStatus === "PAID") {
        updateData.paymentStatus = "REFUND_PENDING";
      }

      await prisma.registration.update({
        where: { id: context.registrationId },
        data: updateData,
      });

      if (input.sendNotification === "yes") {
        // TODO: Implement email sending
      }

      return {
        success: true,
        message: "Registration cancelled",
        data: {
          newStatus: "CANCELLED",
          refundInitiated: input.initiateRefund === "yes",
        },
      };
    } catch (error) {
      console.error("Error cancelling registration:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to cancel registration",
      };
    }
  },
};

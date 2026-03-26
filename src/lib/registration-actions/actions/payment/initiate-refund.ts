import prisma from "@/lib/prisma";
import { ActionDefinition, ActionContext, ActionInput, ActionResult } from "../../types";

export const initiateRefundAction: ActionDefinition = {
  id: "initiate-refund",
  name: "Initiate Refund",
  description: "Start the refund process for this payment",
  category: "payment",
  icon: "arrow-uturn-left",

  isAvailable: (context: ActionContext) => {
    return ["PAID", "PARTIALLY_PAID"].includes(context.currentPaymentStatus);
  },

  inputFields: [
    {
      name: "refundAmount",
      label: "Refund amount (in cents)",
      type: "number",
      placeholder: "Leave empty for full refund",
    },
    {
      name: "reason",
      label: "Reason for refund",
      type: "textarea",
      placeholder: "Why is this refund being issued?",
    },
    {
      name: "cancelRegistration",
      label: "Cancel registration",
      type: "select",
      options: [
        { value: "yes", label: "Yes, cancel registration too" },
        { value: "no", label: "No, keep registration active" },
      ],
      defaultValue: "yes",
    },
  ],

  requiresConfirmation: true,
  confirmationMessage: "Are you sure you want to initiate a refund? This action may require manual processing.",

  execute: async (context: ActionContext, input: ActionInput): Promise<ActionResult> => {
    try {
      const updateData: Record<string, unknown> = {
        paymentStatus: "REFUND_PENDING",
      };

      if (input.reason) {
        updateData.internalNote = `Refund initiated: ${input.reason as string}`;
      }

      if (input.cancelRegistration === "yes") {
        updateData.registrationStatus = "CANCELLED";
      }

      await prisma.registration.update({
        where: { id: context.registrationId },
        data: updateData,
      });

      return {
        success: true,
        message: "Refund process initiated",
        data: {
          newPaymentStatus: "REFUND_PENDING",
          refundAmount: input.refundAmount || context.paymentAmount,
        },
      };
    } catch (error) {
      console.error("Error initiating refund:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to initiate refund",
      };
    }
  },
};

import prisma from "@/lib/prisma";
import { ActionDefinition, ActionContext, ActionInput, ActionResult } from "../../types";

export const markPaidAction: ActionDefinition = {
  id: "mark-paid",
  name: "Mark as Paid",
  description: "Record that payment has been received",
  category: "payment",
  icon: "banknotes",

  isAvailable: (context: ActionContext) => {
    return ["UNPAID", "PENDING", "PARTIALLY_PAID", "PAYMENT_FAILED"].includes(
      context.currentPaymentStatus
    );
  },

  inputFields: [
    {
      name: "paymentMethod",
      label: "Payment method",
      type: "select",
      options: [
        { value: "bank_transfer", label: "Bank Transfer" },
        { value: "cash", label: "Cash" },
        { value: "card", label: "Card" },
        { value: "other", label: "Other" },
      ],
      defaultValue: "bank_transfer",
    },
    {
      name: "reference",
      label: "Payment reference",
      type: "text",
      placeholder: "Transaction ID or reference...",
    },
    {
      name: "amount",
      label: "Amount paid (in cents)",
      type: "number",
      placeholder: "Leave empty for full amount",
    },
    {
      name: "autoConfirm",
      label: "Auto-confirm registration",
      type: "select",
      options: [
        { value: "yes", label: "Yes, confirm automatically" },
        { value: "no", label: "No, keep current status" },
      ],
      defaultValue: "yes",
    },
  ],

  execute: async (context: ActionContext, input: ActionInput): Promise<ActionResult> => {
    try {
      const updateData: Record<string, unknown> = {
        paymentStatus: "PAID",
        paymentProvider: input.paymentMethod as string,
        paymentReference: input.reference as string || null,
      };

      if (input.amount) {
        updateData.paymentAmount = parseInt(input.amount as string, 10);
      }

      // Auto-confirm if requested
      if (input.autoConfirm === "yes" && context.currentStatus !== "CONFIRMED") {
        updateData.registrationStatus = "CONFIRMED";
      }

      await prisma.registration.update({
        where: { id: context.registrationId },
        data: updateData,
      });

      return {
        success: true,
        message: "Payment recorded successfully",
        data: {
          newPaymentStatus: "PAID",
          autoConfirmed: input.autoConfirm === "yes",
        },
      };
    } catch (error) {
      console.error("Error recording payment:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to record payment",
      };
    }
  },
};

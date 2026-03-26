import prisma from "@/lib/prisma";
import { ActionDefinition, ActionContext, ActionInput, ActionResult } from "../../types";

export const markPartiallyPaidAction: ActionDefinition = {
  id: "mark-partially-paid",
  name: "Mark as Partially Paid",
  description: "Record a partial payment received",
  category: "payment",
  icon: "banknotes",

  isAvailable: (context: ActionContext) => {
    return ["UNPAID", "PENDING", "PAYMENT_FAILED"].includes(
      context.currentPaymentStatus
    );
  },

  inputFields: [
    {
      name: "amountPaid",
      label: "Amount received (in cents)",
      type: "number",
      required: true,
      placeholder: "Amount paid so far...",
    },
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
  ],

  execute: async (context: ActionContext, input: ActionInput): Promise<ActionResult> => {
    try {
      const amountPaid = parseInt(input.amountPaid as string, 10);

      if (isNaN(amountPaid) || amountPaid <= 0) {
        return {
          success: false,
          message: "Please enter a valid payment amount",
        };
      }

      await prisma.registration.update({
        where: { id: context.registrationId },
        data: {
          paymentStatus: "PARTIALLY_PAID",
          paymentAmount: amountPaid,
          paymentProvider: input.paymentMethod as string,
          paymentReference: input.reference as string || null,
        },
      });

      return {
        success: true,
        message: "Partial payment recorded",
        data: {
          newPaymentStatus: "PARTIALLY_PAID",
          amountPaid,
        },
      };
    } catch (error) {
      console.error("Error recording partial payment:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to record partial payment",
      };
    }
  },
};

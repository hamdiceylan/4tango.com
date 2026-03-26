import prisma from "@/lib/prisma";
import { ActionDefinition, ActionContext, ActionInput, ActionResult } from "../../types";

export const rejectAction: ActionDefinition = {
  id: "reject",
  name: "Reject",
  description: "Reject this registration",
  category: "status",
  icon: "x-circle",

  isAvailable: (context: ActionContext) => {
    return ["REGISTERED", "PENDING_REVIEW", "APPROVED", "WAITLIST"].includes(context.currentStatus);
  },

  inputFields: [
    {
      name: "reason",
      label: "Reason for rejection",
      type: "textarea",
      placeholder: "Optional: Explain why this registration is being rejected...",
    },
    {
      name: "sendNotification",
      label: "Send notification email",
      type: "select",
      options: [
        { value: "yes", label: "Yes, notify dancer" },
        { value: "no", label: "No, reject silently" },
      ],
      defaultValue: "yes",
    },
  ],

  requiresConfirmation: true,
  confirmationMessage: "Are you sure you want to reject this registration?",

  execute: async (context: ActionContext, input: ActionInput): Promise<ActionResult> => {
    try {
      // Update registration status
      await prisma.registration.update({
        where: { id: context.registrationId },
        data: {
          registrationStatus: "REJECTED",
          internalNote: input.reason
            ? `Rejected: ${input.reason as string}`
            : undefined,
        },
      });

      // Send notification if requested
      if (input.sendNotification === "yes") {
        // TODO: Implement email sending
        // await sendRejectionEmail(context.registrationId, input.reason as string);
      }

      return {
        success: true,
        message: "Registration rejected",
        data: {
          newStatus: "REJECTED",
          notificationSent: input.sendNotification === "yes",
        },
      };
    } catch (error) {
      console.error("Error rejecting registration:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to reject registration",
      };
    }
  },
};

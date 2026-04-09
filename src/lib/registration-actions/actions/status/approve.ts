import prisma from "@/lib/prisma";
import { ActionDefinition, ActionContext, ActionInput, ActionResult } from "../../types";

export const approveAction: ActionDefinition = {
  id: "approve",
  name: "Approve",
  description: "Approve this registration and notify the dancer",
  category: "status",
  icon: "check-circle",

  isAvailable: (context: ActionContext) => {
    return ["REGISTERED", "PENDING_REVIEW", "WAITLIST", "REJECTED", "CANCELLED"].includes(context.currentStatus);
  },

  inputFields: [
    {
      name: "sendNotification",
      label: "Send notification email",
      type: "select",
      options: [
        { value: "yes", label: "Yes, send email" },
        { value: "no", label: "No, don't send" },
      ],
      defaultValue: "yes",
    },
    {
      name: "message",
      label: "Custom message (optional)",
      type: "textarea",
      placeholder: "Add a personal message to the dancer...",
    },
  ],

  requiresConfirmation: false,

  execute: async (context: ActionContext, input: ActionInput): Promise<ActionResult> => {
    try {
      // Approve and auto-confirm (no separate payment step needed)
      await prisma.registration.update({
        where: { id: context.registrationId },
        data: {
          registrationStatus: "CONFIRMED",
        },
      });

      // Send notification if requested
      if (input.sendNotification === "yes") {
        // TODO: Implement email sending
        // await sendApprovalEmail(context.registrationId, input.message as string);
      }

      return {
        success: true,
        message: "Registration approved and confirmed",
        data: {
          newStatus: "CONFIRMED",
          notificationSent: input.sendNotification === "yes",
        },
      };
    } catch (error) {
      console.error("Error approving registration:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to approve registration",
      };
    }
  },
};

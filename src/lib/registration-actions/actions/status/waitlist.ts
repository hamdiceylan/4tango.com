import prisma from "@/lib/prisma";
import { ActionDefinition, ActionContext, ActionInput, ActionResult } from "../../types";

export const waitlistAction: ActionDefinition = {
  id: "waitlist",
  name: "Add to Waitlist",
  description: "Move this registration to the waiting list",
  category: "status",
  icon: "clock",

  isAvailable: (context: ActionContext) => {
    return ["REGISTERED", "PENDING_REVIEW"].includes(context.currentStatus);
  },

  inputFields: [
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
    {
      name: "message",
      label: "Message to dancer",
      type: "textarea",
      placeholder: "We'll notify you if a spot becomes available...",
    },
  ],

  execute: async (context: ActionContext, input: ActionInput): Promise<ActionResult> => {
    try {
      await prisma.registration.update({
        where: { id: context.registrationId },
        data: {
          registrationStatus: "WAITLIST",
        },
      });

      if (input.sendNotification === "yes") {
        // TODO: Implement email sending
      }

      return {
        success: true,
        message: "Added to waitlist",
        data: {
          newStatus: "WAITLIST",
        },
      };
    } catch (error) {
      console.error("Error adding to waitlist:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to add to waitlist",
      };
    }
  },
};

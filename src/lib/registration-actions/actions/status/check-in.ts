import prisma from "@/lib/prisma";
import { ActionDefinition, ActionContext, ActionResult } from "../../types";

export const checkInAction: ActionDefinition = {
  id: "check-in",
  name: "Check In",
  description: "Mark dancer as checked in at the event",
  category: "status",
  icon: "user-check",

  isAvailable: (context: ActionContext) => {
    return context.currentStatus === "CONFIRMED";
  },

  execute: async (context: ActionContext): Promise<ActionResult> => {
    try {
      await prisma.registration.update({
        where: { id: context.registrationId },
        data: {
          registrationStatus: "CHECKED_IN",
        },
      });

      return {
        success: true,
        message: "Dancer checked in successfully",
        data: {
          newStatus: "CHECKED_IN",
          checkedInAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Error checking in:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to check in",
      };
    }
  },
};

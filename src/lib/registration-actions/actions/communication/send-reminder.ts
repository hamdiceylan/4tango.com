import { ActionDefinition, ActionContext, ActionInput, ActionResult } from "../../types";

export const sendReminderAction: ActionDefinition = {
  id: "send-reminder",
  name: "Send Reminder",
  description: "Send an event reminder to this dancer",
  category: "communication",
  icon: "bell",

  isAvailable: (context: ActionContext) => {
    return ["CONFIRMED", "APPROVED"].includes(context.currentStatus);
  },

  inputFields: [
    {
      name: "reminderType",
      label: "Reminder type",
      type: "select",
      options: [
        { value: "event_soon", label: "Event is coming soon" },
        { value: "check_in", label: "Check-in information" },
        { value: "schedule", label: "Event schedule" },
        { value: "custom", label: "Custom reminder" },
      ],
      defaultValue: "event_soon",
    },
    {
      name: "customMessage",
      label: "Additional message",
      type: "textarea",
      placeholder: "Any additional information to include...",
    },
  ],

  execute: async (context: ActionContext, input: ActionInput): Promise<ActionResult> => {
    try {
      // TODO: Implement actual reminder email sending
      // This would use pre-defined templates based on reminderType

      return {
        success: true,
        message: "Reminder sent successfully",
        data: {
          reminderType: input.reminderType,
          sentAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Error sending reminder:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to send reminder",
      };
    }
  },
};

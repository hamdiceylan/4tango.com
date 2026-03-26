// Activity Log / Audit Trail System
// Tracks all important actions performed by team members

import prisma from "@/lib/prisma";
import type { AuthenticatedUser } from "@/lib/auth-middleware";
import type { AuthUser } from "@/lib/auth";
import type { ActivityCategory, Prisma } from "@prisma/client";

// User type that works with both auth modules
type ActivityLogUser = AuthenticatedUser | AuthUser;

// Action constants organized by category
export const ACTIVITY_ACTIONS = {
  REGISTRATION: {
    APPROVE: "registration.approve",
    REJECT: "registration.reject",
    CONFIRM: "registration.confirm",
    CANCEL: "registration.cancel",
    CHECK_IN: "registration.check_in",
    WAITLIST: "registration.waitlist",
  },
  PAYMENT: {
    MARK_PAID: "payment.mark_paid",
    MARK_PARTIALLY_PAID: "payment.mark_partially_paid",
    INITIATE_REFUND: "payment.initiate_refund",
  },
  COMMUNICATION: {
    SEND_EMAIL: "communication.send_email",
    SEND_REMINDER: "communication.send_reminder",
  },
  TEAM: {
    INVITE_MEMBER: "team.invite_member",
    ACCEPT_INVITE: "team.accept_invite",
    CANCEL_INVITE: "team.cancel_invite",
    UPDATE_ROLE: "team.update_role",
    REMOVE_MEMBER: "team.remove_member",
  },
  EVENT: {
    CREATE: "event.create",
    UPDATE: "event.update",
    DELETE: "event.delete",
  },
  BULK: {
    BULK_ACTION: "bulk.action",
  },
} as const;

// Human-readable labels for actions
export const ACTION_LABELS: Record<string, string> = {
  // Registration
  "registration.approve": "Approved registration",
  "registration.reject": "Rejected registration",
  "registration.confirm": "Confirmed registration",
  "registration.cancel": "Cancelled registration",
  "registration.check_in": "Checked in",
  "registration.waitlist": "Moved to waitlist",
  // Payment
  "payment.mark_paid": "Marked as paid",
  "payment.mark_partially_paid": "Marked as partially paid",
  "payment.initiate_refund": "Initiated refund",
  // Communication
  "communication.send_email": "Sent email",
  "communication.send_reminder": "Sent reminder",
  // Team
  "team.invite_member": "Invited team member",
  "team.accept_invite": "Accepted invitation",
  "team.cancel_invite": "Cancelled invitation",
  "team.update_role": "Updated role",
  "team.remove_member": "Removed team member",
  // Event
  "event.create": "Created event",
  "event.update": "Updated event",
  "event.delete": "Deleted event",
  // Bulk
  "bulk.action": "Bulk action",
};

// Category labels for display
export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  REGISTRATION: "Registration",
  PAYMENT: "Payment",
  COMMUNICATION: "Communication",
  TEAM: "Team",
  EVENT: "Event",
  SETTINGS: "Settings",
};

// Category colors for UI
export const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  REGISTRATION: "bg-blue-100 text-blue-700",
  PAYMENT: "bg-green-100 text-green-700",
  COMMUNICATION: "bg-purple-100 text-purple-700",
  TEAM: "bg-orange-100 text-orange-700",
  EVENT: "bg-rose-100 text-rose-700",
  SETTINGS: "bg-gray-100 text-gray-700",
};

// Determine category from action string
function getCategoryFromAction(action: string): ActivityCategory {
  const prefix = action.split(".")[0];
  const categoryMap: Record<string, ActivityCategory> = {
    registration: "REGISTRATION",
    payment: "PAYMENT",
    communication: "COMMUNICATION",
    team: "TEAM",
    event: "EVENT",
    bulk: "REGISTRATION", // Bulk actions are typically for registrations
    settings: "SETTINGS",
  };
  return categoryMap[prefix] || "SETTINGS";
}

// Input type for creating activity logs
export interface ActivityLogInput {
  action: string;
  entityType: string;
  entityId: string;
  entityLabel?: string;
  eventId?: string;
  registrationId?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// Create an activity log entry (async, non-blocking)
export async function createActivityLog(
  user: ActivityLogUser,
  input: ActivityLogInput
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        organizerId: user.organizerId,
        actorId: user.id,
        actorEmail: user.email,
        actorName: user.fullName,
        action: input.action,
        category: getCategoryFromAction(input.action),
        entityType: input.entityType,
        entityId: input.entityId,
        entityLabel: input.entityLabel,
        eventId: input.eventId,
        registrationId: input.registrationId,
        changes: input.changes as Prisma.InputJsonValue | undefined,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  } catch (error) {
    // Log error but don't throw - activity logging should not block operations
    console.error("Failed to create activity log:", error);
  }
}

// Helper to compute changes between two objects
export function computeChanges<T extends Record<string, unknown>>(
  oldValues: T,
  newValues: T,
  fieldsToTrack?: (keyof T)[]
): Record<string, { old: unknown; new: unknown }> | undefined {
  const changes: Record<string, { old: unknown; new: unknown }> = {};
  const fields = fieldsToTrack || (Object.keys(oldValues) as (keyof T)[]);

  for (const field of fields) {
    const oldVal = oldValues[field];
    const newVal = newValues[field];

    // Compare values (handle null/undefined)
    if (oldVal !== newVal) {
      changes[field as string] = {
        old: oldVal ?? null,
        new: newVal ?? null,
      };
    }
  }

  return Object.keys(changes).length > 0 ? changes : undefined;
}

// Map registration action IDs to activity action strings
export function mapActionIdToActivityAction(actionId: string): string {
  const actionMap: Record<string, string> = {
    approve: ACTIVITY_ACTIONS.REGISTRATION.APPROVE,
    reject: ACTIVITY_ACTIONS.REGISTRATION.REJECT,
    confirm: ACTIVITY_ACTIONS.REGISTRATION.CONFIRM,
    cancel: ACTIVITY_ACTIONS.REGISTRATION.CANCEL,
    "check-in": ACTIVITY_ACTIONS.REGISTRATION.CHECK_IN,
    waitlist: ACTIVITY_ACTIONS.REGISTRATION.WAITLIST,
    "mark-paid": ACTIVITY_ACTIONS.PAYMENT.MARK_PAID,
    "mark-partially-paid": ACTIVITY_ACTIONS.PAYMENT.MARK_PARTIALLY_PAID,
    "initiate-refund": ACTIVITY_ACTIONS.PAYMENT.INITIATE_REFUND,
    "send-email": ACTIVITY_ACTIONS.COMMUNICATION.SEND_EMAIL,
    "send-reminder": ACTIVITY_ACTIONS.COMMUNICATION.SEND_REMINDER,
    "send-payment-reminder": ACTIVITY_ACTIONS.COMMUNICATION.SEND_REMINDER,
  };
  return actionMap[actionId] || `registration.${actionId}`;
}

// Field labels for displaying changes
export const FIELD_LABELS: Record<string, string> = {
  registrationStatus: "Registration Status",
  paymentStatus: "Payment Status",
  paymentAmount: "Payment Amount",
  role: "Role",
  status: "Status",
  title: "Title",
  description: "Description",
  startAt: "Start Date",
  endAt: "End Date",
  city: "City",
  country: "Country",
  priceAmount: "Price",
  capacityLimit: "Capacity",
};

// Registration action types

import { RegistrationStatus, PaymentStatus } from "@prisma/client";

// Action categories
export type ActionCategory = "status" | "payment" | "communication";

// Action availability context
export interface ActionContext {
  registrationId: string;
  currentStatus: RegistrationStatus;
  currentPaymentStatus: PaymentStatus;
  eventId: string;
  organizerId: string;
  paymentAmount?: number | null;
}

// Action input (varies by action)
export interface ActionInput {
  [key: string]: unknown;
}

// Action result
export interface ActionResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

// Action definition
export interface ActionDefinition {
  id: string;
  name: string;
  description: string;
  category: ActionCategory;
  icon: string;
  // Determines if action is available given current state
  isAvailable: (context: ActionContext) => boolean;
  // Input fields required for this action
  inputFields?: ActionInputField[];
  // Whether this action requires confirmation
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  // The action to execute
  execute: (context: ActionContext, input: ActionInput) => Promise<ActionResult>;
}

// Input field definition
export interface ActionInputField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: unknown;
}

// Bulk action support
export interface BulkActionResult {
  total: number;
  successful: number;
  failed: number;
  results: {
    registrationId: string;
    success: boolean;
    message: string;
  }[];
}

// Status transitions
export const STATUS_TRANSITIONS: Record<RegistrationStatus, RegistrationStatus[]> = {
  REGISTERED: ["PENDING_REVIEW", "APPROVED", "CONFIRMED", "WAITLIST", "REJECTED", "CANCELLED"],
  PENDING_REVIEW: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["CONFIRMED", "CANCELLED", "REJECTED"],
  CONFIRMED: ["CHECKED_IN", "CANCELLED"],
  WAITLIST: ["APPROVED", "CANCELLED"],
  REJECTED: ["PENDING_REVIEW", "APPROVED"],
  CANCELLED: ["REGISTERED", "PENDING_REVIEW"],
  CHECKED_IN: [],
};

// Payment status transitions
export const PAYMENT_STATUS_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  UNPAID: ["PENDING", "PAID", "PARTIALLY_PAID"],
  PENDING: ["PAID", "PAYMENT_FAILED", "UNPAID"],
  PAID: ["REFUND_PENDING", "PARTIALLY_PAID"],
  PARTIALLY_PAID: ["PAID", "REFUND_PENDING"],
  PAYMENT_FAILED: ["PENDING", "PAID"],
  REFUNDED: [],
  REFUND_PENDING: ["REFUNDED", "PAID"],
};

// Helper to check if status transition is valid
export function canTransitionTo(
  currentStatus: RegistrationStatus,
  targetStatus: RegistrationStatus
): boolean {
  return STATUS_TRANSITIONS[currentStatus]?.includes(targetStatus) ?? false;
}

// Helper to check if payment status transition is valid
export function canTransitionPaymentTo(
  currentStatus: PaymentStatus,
  targetStatus: PaymentStatus
): boolean {
  return PAYMENT_STATUS_TRANSITIONS[currentStatus]?.includes(targetStatus) ?? false;
}

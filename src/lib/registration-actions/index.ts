// Registration Actions System
// Central export for all registration action functionality

// Types
export * from "./types";

// Registry
export {
  actionRegistry,
  getAction,
  getAvailableActions,
  getAvailableActionsByCategory,
  getGroupedAvailableActions,
} from "./registry";

// Status actions
export { approveAction } from "./actions/status/approve";
export { rejectAction } from "./actions/status/reject";
export { confirmAction } from "./actions/status/confirm";
export { cancelAction } from "./actions/status/cancel";
export { checkInAction } from "./actions/status/check-in";
export { waitlistAction } from "./actions/status/waitlist";

// Payment actions
export { markPaidAction } from "./actions/payment/mark-paid";
export { markPartiallyPaidAction } from "./actions/payment/mark-partially-paid";
export { requestPaymentAction } from "./actions/payment/request-payment";
export { initiateRefundAction } from "./actions/payment/initiate-refund";
export { retryPaymentAction } from "./actions/payment/retry-payment";

// Communication actions
export { sendEmailAction } from "./actions/communication/send-email";
export { sendReminderAction } from "./actions/communication/send-reminder";
export { sendPaymentReminderAction } from "./actions/communication/send-payment-reminder";

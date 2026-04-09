// Action registry - centralizes all registration actions

import { ActionDefinition, ActionContext, ActionCategory } from "./types";

// Status actions
import { approveAction } from "./actions/status/approve";
import { rejectAction } from "./actions/status/reject";
import { cancelAction } from "./actions/status/cancel";
import { checkInAction } from "./actions/status/check-in";
import { waitlistAction } from "./actions/status/waitlist";

// Payment actions
import { markPaidAction } from "./actions/payment/mark-paid";
import { markPartiallyPaidAction } from "./actions/payment/mark-partially-paid";

// Communication actions
import { sendEmailAction } from "./actions/communication/send-email";

// All registered actions
const allActions: ActionDefinition[] = [
  // Status actions
  approveAction,
  rejectAction,
  waitlistAction,
  cancelAction,
  checkInAction,
  // Payment actions
  markPaidAction,
  markPartiallyPaidAction,
  // Communication actions
  sendEmailAction,
];

// Action registry class
class ActionRegistry {
  private actions: Map<string, ActionDefinition>;

  constructor() {
    this.actions = new Map();
    allActions.forEach((action) => {
      this.actions.set(action.id, action);
    });
  }

  // Get action by ID
  getAction(id: string): ActionDefinition | undefined {
    return this.actions.get(id);
  }

  // Get all actions
  getAllActions(): ActionDefinition[] {
    return Array.from(this.actions.values());
  }

  // Get available actions for a given context
  getAvailableActions(context: ActionContext): ActionDefinition[] {
    return this.getAllActions().filter((action) => action.isAvailable(context));
  }

  // Get actions by category
  getActionsByCategory(category: ActionCategory): ActionDefinition[] {
    return this.getAllActions().filter((action) => action.category === category);
  }

  // Get available actions by category
  getAvailableActionsByCategory(
    context: ActionContext,
    category: ActionCategory
  ): ActionDefinition[] {
    return this.getAvailableActions(context).filter(
      (action) => action.category === category
    );
  }

  // Register a new action (for extensibility)
  registerAction(action: ActionDefinition): void {
    this.actions.set(action.id, action);
  }

  // Unregister an action
  unregisterAction(id: string): boolean {
    return this.actions.delete(id);
  }
}

// Export singleton instance
export const actionRegistry = new ActionRegistry();

// Export convenience functions
export function getAction(id: string): ActionDefinition | undefined {
  return actionRegistry.getAction(id);
}

export function getAvailableActions(context: ActionContext): ActionDefinition[] {
  return actionRegistry.getAvailableActions(context);
}

export function getAvailableActionsByCategory(
  context: ActionContext,
  category: ActionCategory
): ActionDefinition[] {
  return actionRegistry.getAvailableActionsByCategory(context, category);
}

// Export grouped actions for UI display
export function getGroupedAvailableActions(
  context: ActionContext
): Record<ActionCategory, ActionDefinition[]> {
  return {
    status: getAvailableActionsByCategory(context, "status"),
    payment: getAvailableActionsByCategory(context, "payment"),
    communication: getAvailableActionsByCategory(context, "communication"),
  };
}

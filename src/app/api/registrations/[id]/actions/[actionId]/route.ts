import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getAction, getAvailableActions } from "@/lib/registration-actions/registry";
import { ActionContext, ActionInput } from "@/lib/registration-actions/types";
import {
  createActivityLog,
  computeChanges,
  mapActionIdToActivityAction,
} from "@/lib/activity-log";

// GET available actions for a registration
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; actionId: string }> }
) {
  try {
    const auth = await requireAuth();
    const { id } = await params;

    // Fetch registration with event
    const registration = await prisma.registration.findUnique({
      where: { id },
      include: {
        event: {
          select: { organizerId: true },
        },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Verify organizer owns this event
    if (registration.event.organizerId !== auth.organizerId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Build action context
    const context: ActionContext = {
      registrationId: registration.id,
      currentStatus: registration.registrationStatus,
      currentPaymentStatus: registration.paymentStatus,
      eventId: registration.eventId,
      organizerId: auth.organizerId!,
      paymentAmount: registration.paymentAmount,
    };

    // Fetch available templates for the send-email action
    const templates = await prisma.emailTemplate.findMany({
      where: {
        organizerId: auth.organizerId,
        isActive: true,
        OR: [
          { eventId: null }, // Organization-wide templates
          { eventId: registration.eventId }, // Event-specific templates
        ],
      },
      select: {
        id: true,
        name: true,
        subject: true,
      },
      orderBy: { name: 'asc' },
    });

    const templateOptions = [
      { value: "", label: "No template (custom message)" },
      ...templates.map((t) => ({ value: t.id, label: t.name })),
    ];

    // Get available actions
    const availableActions = getAvailableActions(context).map((action) => {
      const baseAction = {
        id: action.id,
        name: action.name,
        description: action.description,
        category: action.category,
        icon: action.icon,
        inputFields: action.inputFields || [],
        requiresConfirmation: action.requiresConfirmation || false,
        confirmationMessage: action.confirmationMessage,
      };

      // Add template selector to send-email action
      if (action.id === "send-email" && templates.length > 0) {
        return {
          ...baseAction,
          inputFields: [
            {
              name: "templateId",
              label: "Template",
              type: "select",
              options: templateOptions,
            },
            ...(baseAction.inputFields || []),
          ],
        };
      }

      return baseAction;
    });

    return NextResponse.json({ actions: availableActions });
  } catch (error) {
    console.error("Error fetching available actions:", error);
    return NextResponse.json(
      { error: "Failed to fetch available actions" },
      { status: 500 }
    );
  }
}

// POST execute an action
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; actionId: string }> }
) {
  try {
    const auth = await requireAuth();
    const { id, actionId } = await params;

    // Parse input
    let input: ActionInput = {};
    try {
      const body = await request.json();
      input = body.input || {};
    } catch {
      // No input provided, that's okay
    }

    // Fetch registration with event
    const registration = await prisma.registration.findUnique({
      where: { id },
      include: {
        event: {
          select: { organizerId: true },
        },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Verify organizer owns this event
    if (registration.event.organizerId !== auth.organizerId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get the action
    const action = getAction(actionId);
    if (!action) {
      return NextResponse.json(
        { error: "Action not found" },
        { status: 404 }
      );
    }

    // Build action context
    const context: ActionContext = {
      registrationId: registration.id,
      currentStatus: registration.registrationStatus,
      currentPaymentStatus: registration.paymentStatus,
      eventId: registration.eventId,
      organizerId: auth.organizerId!,
      paymentAmount: registration.paymentAmount,
    };

    // Check if action is available
    if (!action.isAvailable(context)) {
      return NextResponse.json(
        { error: "Action not available for current registration state" },
        { status: 400 }
      );
    }

    // Capture state before action for change tracking
    const beforeState = {
      registrationStatus: registration.registrationStatus,
      paymentStatus: registration.paymentStatus,
    };

    // Execute the action
    const result = await action.execute(context, input);

    if (result.success) {
      // Fetch updated registration for change tracking
      const updatedRegistration = await prisma.registration.findUnique({
        where: { id },
        select: {
          registrationStatus: true,
          paymentStatus: true,
        },
      });

      // Log the activity (non-blocking)
      createActivityLog(auth, {
        action: mapActionIdToActivityAction(actionId),
        entityType: "registration",
        entityId: id,
        entityLabel: registration.fullNameSnapshot,
        eventId: registration.eventId,
        registrationId: id,
        changes: updatedRegistration
          ? computeChanges(beforeState, updatedRegistration)
          : undefined,
        metadata: input && Object.keys(input).length > 0 ? input : undefined,
      }).catch((err) => console.error("Failed to log activity:", err));

      return NextResponse.json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error executing action:", error);
    return NextResponse.json(
      { error: "Failed to execute action" },
      { status: 500 }
    );
  }
}

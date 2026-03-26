import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getAction, getAvailableActions } from "@/lib/registration-actions/registry";
import { ActionContext, ActionInput } from "@/lib/registration-actions/types";

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

    // Get available actions
    const availableActions = getAvailableActions(context).map((action) => ({
      id: action.id,
      name: action.name,
      description: action.description,
      category: action.category,
      icon: action.icon,
      inputFields: action.inputFields || [],
      requiresConfirmation: action.requiresConfirmation || false,
      confirmationMessage: action.confirmationMessage,
    }));

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

    // Execute the action
    const result = await action.execute(context, input);

    if (result.success) {
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

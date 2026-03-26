import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getAction } from "@/lib/registration-actions/registry";
import { ActionContext, ActionInput, BulkActionResult } from "@/lib/registration-actions/types";
import {
  createActivityLog,
  computeChanges,
  mapActionIdToActivityAction,
  ACTIVITY_ACTIONS,
} from "@/lib/activity-log";

// POST execute a bulk action on multiple registrations
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();

    const body = await request.json();
    const { registrationIds, actionId, input = {} }: {
      registrationIds: string[];
      actionId: string;
      input?: ActionInput;
    } = body;

    if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
      return NextResponse.json(
        { error: "No registrations specified" },
        { status: 400 }
      );
    }

    // Limit bulk actions to prevent timeout
    if (registrationIds.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 registrations per bulk action" },
        { status: 400 }
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

    // Fetch all registrations with their events
    const registrations = await prisma.registration.findMany({
      where: {
        id: { in: registrationIds },
      },
      include: {
        event: {
          select: { organizerId: true },
        },
      },
    });

    // Verify all registrations belong to this organizer
    const unauthorizedIds = registrations
      .filter((r) => r.event.organizerId !== auth.organizerId)
      .map((r) => r.id);

    if (unauthorizedIds.length > 0) {
      return NextResponse.json(
        { error: "Unauthorized access to some registrations", details: unauthorizedIds },
        { status: 403 }
      );
    }

    // Execute action for each registration
    const results: BulkActionResult["results"] = [];
    let successful = 0;
    let failed = 0;

    for (const registration of registrations) {
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
        results.push({
          registrationId: registration.id,
          success: false,
          message: "Action not available for current state",
        });
        failed++;
        continue;
      }

      // Execute the action
      try {
        const result = await action.execute(context, input);
        results.push({
          registrationId: registration.id,
          success: result.success,
          message: result.message,
        });
        if (result.success) {
          successful++;
        } else {
          failed++;
        }
      } catch (error) {
        results.push({
          registrationId: registration.id,
          success: false,
          message: error instanceof Error ? error.message : "Unknown error",
        });
        failed++;
      }
    }

    const bulkResult: BulkActionResult = {
      total: registrations.length,
      successful,
      failed,
      results,
    };

    // Log the bulk action (non-blocking)
    if (successful > 0) {
      // Get event ID from first registration for filtering
      const eventId = registrations[0]?.eventId;
      const successfulNames = registrations
        .filter((r) => results.find((res) => res.registrationId === r.id && res.success))
        .map((r) => r.fullNameSnapshot)
        .slice(0, 5); // Limit to first 5 names

      createActivityLog(auth, {
        action: ACTIVITY_ACTIONS.BULK.BULK_ACTION,
        entityType: "registration",
        entityId: "bulk",
        entityLabel: `${successful} registration${successful > 1 ? "s" : ""}`,
        eventId,
        metadata: {
          actionId,
          total: registrations.length,
          successful,
          failed,
          affectedNames: successfulNames.join(", ") + (successful > 5 ? ` and ${successful - 5} more` : ""),
        },
      }).catch((err) => console.error("Failed to log bulk activity:", err));
    }

    return NextResponse.json(bulkResult);
  } catch (error) {
    console.error("Error executing bulk action:", error);
    return NextResponse.json(
      { error: "Failed to execute bulk action" },
      { status: 500 }
    );
  }
}

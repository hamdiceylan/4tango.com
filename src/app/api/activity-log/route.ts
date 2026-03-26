import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-middleware";
import type { ActivityCategory, Prisma } from "@prisma/client";

// GET /api/activity-log - List activity logs with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission("org:settings:view");

    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const skip = (page - 1) * limit;

    // Filters
    const action = searchParams.get("action");
    const category = searchParams.get("category") as ActivityCategory | null;
    const actorId = searchParams.get("actorId");
    const eventId = searchParams.get("eventId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const search = searchParams.get("search");

    // Build where clause
    const where: Prisma.ActivityLogWhereInput = {
      organizerId: user.organizerId,
    };

    if (action) {
      where.action = action;
    }

    if (category) {
      where.category = category;
    }

    if (actorId) {
      where.actorId = actorId;
    }

    if (eventId) {
      where.eventId = eventId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Include the entire day
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        where.createdAt.lt = endDate;
      }
    }

    if (search) {
      where.OR = [
        { entityLabel: { contains: search, mode: "insensitive" } },
        { actorName: { contains: search, mode: "insensitive" } },
        { actorEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch logs and count in parallel
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          actorId: true,
          actorEmail: true,
          actorName: true,
          action: true,
          category: true,
          entityType: true,
          entityId: true,
          entityLabel: true,
          changes: true,
          metadata: true,
          eventId: true,
          registrationId: true,
          createdAt: true,
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}

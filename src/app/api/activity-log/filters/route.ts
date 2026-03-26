import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-middleware";

// GET /api/activity-log/filters - Get filter options for activity log
export async function GET() {
  try {
    const user = await requirePermission("org:settings:view");

    // Fetch actors and events for filter dropdowns in parallel
    const [actors, events] = await Promise.all([
      // Get unique actors who have activity logs
      prisma.activityLog.findMany({
        where: { organizerId: user.organizerId },
        select: {
          actorId: true,
          actorName: true,
          actorEmail: true,
        },
        distinct: ["actorId"],
        orderBy: { actorName: "asc" },
      }),
      // Get events that have activity logs
      prisma.event.findMany({
        where: { organizerId: user.organizerId },
        select: {
          id: true,
          title: true,
        },
        orderBy: { startAt: "desc" },
      }),
    ]);

    // Deduplicate actors (in case of name changes)
    const uniqueActors = actors.reduce(
      (acc, actor) => {
        if (!acc.find((a) => a.actorId === actor.actorId)) {
          acc.push(actor);
        }
        return acc;
      },
      [] as typeof actors
    );

    return NextResponse.json({
      actors: uniqueActors.map((a) => ({
        id: a.actorId,
        name: a.actorName,
        email: a.actorEmail,
      })),
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
      })),
    });
  } catch (error) {
    console.error("Error fetching activity log filters:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to fetch filter options" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 1x1 transparent GIF
const TRACKING_PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

// GET /api/track/open/[trackingId] - Track email opens
export async function GET(
  request: Request,
  { params }: { params: { trackingId: string } }
) {
  try {
    const { trackingId } = params;

    // Update the email event if it exists and hasn't been opened yet
    await prisma.emailEvent.updateMany({
      where: {
        trackingId,
        openedAt: null,
      },
      data: {
        openedAt: new Date(),
        status: "OPENED",
      },
    });

    // Return transparent 1x1 GIF
    return new NextResponse(TRACKING_PIXEL, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Error tracking email open:", error);
    // Still return the pixel even if tracking fails
    return new NextResponse(TRACKING_PIXEL, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
      },
    });
  }
}

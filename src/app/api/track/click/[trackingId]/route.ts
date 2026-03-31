import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/track/click/[trackingId] - Track email link clicks
export async function GET(
  request: Request,
  { params }: { params: { trackingId: string } }
) {
  try {
    const { trackingId } = params;
    const url = new URL(request.url);
    const destinationUrl = url.searchParams.get("url");

    if (!destinationUrl) {
      return NextResponse.json(
        { error: "Missing destination URL" },
        { status: 400 }
      );
    }

    // Decode the URL
    const decodedUrl = decodeURIComponent(destinationUrl);

    // Update the email event
    await prisma.emailEvent.updateMany({
      where: {
        trackingId,
        clickedAt: null,
      },
      data: {
        clickedAt: new Date(),
        status: "CLICKED",
      },
    });

    // Redirect to the original URL
    return NextResponse.redirect(decodedUrl, {
      status: 302,
    });
  } catch (error) {
    console.error("Error tracking email click:", error);

    // Try to redirect anyway if we have a URL
    const url = new URL(request.url);
    const destinationUrl = url.searchParams.get("url");
    if (destinationUrl) {
      return NextResponse.redirect(decodeURIComponent(destinationUrl), {
        status: 302,
      });
    }

    return NextResponse.json(
      { error: "Invalid tracking request" },
      { status: 400 }
    );
  }
}

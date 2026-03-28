import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

// POST only - GET would be triggered by Next.js Link prefetching
export async function POST() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://4tango.com";

  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (sessionToken) {
      // Delete session from database
      await prisma.session.deleteMany({
        where: { token: sessionToken },
      });
    }

    // Clear cookies and return success
    const response = NextResponse.json({ success: true });
    response.cookies.delete("session");
    response.cookies.delete("refresh_token");

    return response;
  } catch (error) {
    console.error("Error logging out:", error);
    const response = NextResponse.json({ success: true });
    response.cookies.delete("session");
    response.cookies.delete("refresh_token");
    return response;
  }
}

// GET redirects to home after clearing session (for direct browser navigation)
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://4tango.com";

  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (sessionToken) {
      await prisma.session.deleteMany({
        where: { token: sessionToken },
      });
    }

    const response = NextResponse.redirect(`${baseUrl}/login`);
    response.cookies.delete("session");
    response.cookies.delete("refresh_token");

    return response;
  } catch (error) {
    console.error("Error logging out:", error);
    const response = NextResponse.redirect(`${baseUrl}/login`);
    response.cookies.delete("session");
    response.cookies.delete("refresh_token");
    return response;
  }
}

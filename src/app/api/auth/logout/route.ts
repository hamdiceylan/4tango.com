import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
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

    // Redirect to home and clear cookie
    const response = NextResponse.redirect(`${baseUrl}/`);
    response.cookies.delete("session");

    return response;
  } catch (error) {
    console.error("Error logging out:", error);
    const response = NextResponse.redirect(`${baseUrl}/`);
    response.cookies.delete("session");
    return response;
  }
}

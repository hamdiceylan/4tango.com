import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "@/lib/auth";

// POST /api/dancer/auth/logout
export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("dancer_session")?.value;

    if (sessionToken) {
      await deleteSession(sessionToken);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("dancer_session", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error during dancer logout:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}

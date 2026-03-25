import { NextResponse } from "next/server";
import crypto from "crypto";

// GET /api/auth/verify?token=xxx - Verify magic link
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // In production:
    // 1. Find token in database
    // const magicLinkToken = await prisma.magicLinkToken.findUnique({
    //   where: { token }
    // });

    // 2. Check if token is valid and not expired
    // if (!magicLinkToken || magicLinkToken.expiresAt < new Date() || magicLinkToken.usedAt) {
    //   return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    // }

    // 3. Mark token as used
    // await prisma.magicLinkToken.update({
    //   where: { id: magicLinkToken.id },
    //   data: { usedAt: new Date() }
    // });

    // 4. Find organizer
    // const organizer = await prisma.organizer.findUnique({
    //   where: { email: magicLinkToken.email }
    // });

    // 5. Create session
    const sessionToken = crypto.randomBytes(32).toString("hex");
    // await prisma.session.create({
    //   data: {
    //     userId: organizer.id,
    //     userType: "organizer",
    //     token: sessionToken,
    //     expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    //   }
    // });

    // In development, redirect to dashboard
    const response = NextResponse.redirect(new URL("/dashboard", request.url));

    // Set session cookie
    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Error verifying magic link:", error);
    return NextResponse.json(
      { error: "Failed to verify token" },
      { status: 500 }
    );
  }
}

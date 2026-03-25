import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

// GET /api/auth/verify?token=xxx - Verify magic link
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", request.url));
    }

    // Find token in database
    const magicLinkToken = await prisma.magicLinkToken.findUnique({
      where: { token }
    });

    // Check if token is valid and not expired
    if (!magicLinkToken) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", request.url));
    }

    if (magicLinkToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.magicLinkToken.delete({ where: { id: magicLinkToken.id } });
      return NextResponse.redirect(new URL("/login?error=expired_token", request.url));
    }

    if (magicLinkToken.usedAt) {
      return NextResponse.redirect(new URL("/login?error=token_used", request.url));
    }

    // Mark token as used
    await prisma.magicLinkToken.update({
      where: { id: magicLinkToken.id },
      data: { usedAt: new Date() }
    });

    // Find organizer user
    const organizerUser = await prisma.organizerUser.findUnique({
      where: { email: magicLinkToken.email },
      include: { organizer: true }
    });

    if (!organizerUser) {
      return NextResponse.redirect(new URL("/login?error=no_account", request.url));
    }

    // Create session
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.session.create({
      data: {
        userId: organizerUser.id,
        userType: "organizer",
        token: sessionToken,
        expiresAt,
      }
    });

    // Redirect to dashboard
    const response = NextResponse.redirect(new URL("/dashboard", request.url));

    // Set session cookie
    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error verifying magic link:", error);
    return NextResponse.redirect(new URL("/login?error=verification_failed", request.url));
  }
}

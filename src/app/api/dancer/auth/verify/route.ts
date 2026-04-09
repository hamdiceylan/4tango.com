import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/auth";

// GET /api/dancer/auth/verify?token=xxx - Verify dancer magic link
export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://4tango.com";

  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(`${baseUrl}/dancer/login?error=invalid_token`);
    }

    // Find token in database
    const magicLinkToken = await prisma.magicLinkToken.findUnique({
      where: { token },
    });

    if (!magicLinkToken) {
      return NextResponse.redirect(`${baseUrl}/dancer/login?error=invalid_token`);
    }

    if (magicLinkToken.expiresAt < new Date()) {
      await prisma.magicLinkToken.delete({ where: { id: magicLinkToken.id } });
      return NextResponse.redirect(`${baseUrl}/dancer/login?error=expired_token`);
    }

    if (magicLinkToken.usedAt) {
      return NextResponse.redirect(`${baseUrl}/dancer/login?error=token_used`);
    }

    // Mark token as used
    await prisma.magicLinkToken.update({
      where: { id: magicLinkToken.id },
      data: { usedAt: new Date() },
    });

    // Find dancer
    const dancer = await prisma.dancer.findUnique({
      where: { email: magicLinkToken.email },
    });

    if (!dancer) {
      return NextResponse.redirect(`${baseUrl}/dancer/login?error=no_account`);
    }

    // Mark email as verified
    if (!dancer.emailVerified) {
      await prisma.dancer.update({
        where: { id: dancer.id },
        data: { emailVerified: true },
      });
    }

    // Create session
    const sessionToken = await createSession(dancer.id, "dancer");

    // Redirect to registrations
    const response = NextResponse.redirect(`${baseUrl}/dancer/registrations`);

    response.cookies.set("dancer_session", sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error verifying dancer magic link:", error);
    return NextResponse.redirect(`${baseUrl}/dancer/login?error=verification_failed`);
  }
}

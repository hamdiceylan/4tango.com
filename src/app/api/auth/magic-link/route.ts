import { NextResponse } from "next/server";
import crypto from "crypto";

// POST /api/auth/magic-link - Request magic link
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    // Token expires in 10 minutes (used in production database save)
    void (Date.now() + 10 * 60 * 1000);

    // In production:
    // 1. Check if organizer exists
    // const organizer = await prisma.organizer.findUnique({ where: { email } });
    // if (!organizer) {
    //   // Create new organizer for signup flow
    //   await prisma.organizer.create({ data: { email, name: "" } });
    // }

    // 2. Save token to database
    // await prisma.magicLinkToken.create({
    //   data: { email, token, expiresAt }
    // });

    // 3. Send email via SES
    // const magicLink = `${process.env.NEXT_PUBLIC_URL}/auth/verify?token=${token}`;
    // await sendEmail(email, "Sign in to 4Tango", `Click here to sign in: ${magicLink}`);

    console.log(`Magic link token for ${email}: ${token}`);

    return NextResponse.json({
      message: "Magic link sent",
      // In development, return token for testing
      ...(process.env.NODE_ENV === "development" && { token }),
    });
  } catch (error) {
    console.error("Error sending magic link:", error);
    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    );
  }
}

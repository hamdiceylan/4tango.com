import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendEmail, getMagicLinkEmailHtml } from "@/lib/email";

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

    const normalizedEmail = email.toLowerCase().trim();

    // Check if organizer exists
    const organizer = await prisma.organizer.findFirst({
      where: {
        users: {
          some: { email: normalizedEmail }
        }
      }
    });

    if (!organizer) {
      // For security, don't reveal if email exists or not
      // But still return success to prevent email enumeration
      return NextResponse.json({
        message: "If an account exists, a magic link has been sent",
      });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete any existing tokens for this email
    await prisma.magicLinkToken.deleteMany({
      where: { email: normalizedEmail }
    });

    // Save new token to database
    await prisma.magicLinkToken.create({
      data: {
        email: normalizedEmail,
        token,
        expiresAt,
      }
    });

    // Generate magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://4tango.com";
    const magicLink = `${baseUrl}/auth/verify?token=${token}`;

    // Send email via SES
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Sign in to 4Tango",
        html: getMagicLinkEmailHtml(magicLink),
        text: `Click here to sign in to 4Tango: ${magicLink}\n\nThis link will expire in 15 minutes.`,
      });
    } catch (emailError) {
      console.error("Failed to send magic link email:", emailError);
      // Delete the token since email failed
      await prisma.magicLinkToken.delete({ where: { token } });
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    // Log in development for testing
    if (process.env.NODE_ENV === "development") {
      console.log(`Magic link for ${normalizedEmail}: ${magicLink}`);
    }

    return NextResponse.json({
      message: "If an account exists, a magic link has been sent",
    });
  } catch (error) {
    console.error("Error sending magic link:", error);
    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    );
  }
}

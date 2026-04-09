import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendEmail, getDancerMagicLinkEmailHtml } from "@/lib/email";

// POST /api/dancer/auth/magic-link - Request dancer magic link
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

    // Check if dancer exists
    const dancer = await prisma.dancer.findUnique({
      where: { email: normalizedEmail },
    });

    if (!dancer) {
      // Don't reveal if email exists — prevent enumeration
      return NextResponse.json({
        message: "If you have registrations, a magic link has been sent to your email",
      });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete any existing tokens for this email
    await prisma.magicLinkToken.deleteMany({
      where: { email: normalizedEmail },
    });

    // Save new token
    await prisma.magicLinkToken.create({
      data: {
        email: normalizedEmail,
        token,
        expiresAt,
      },
    });

    // Generate magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://4tango.com";
    const magicLink = `${baseUrl}/api/dancer/auth/verify?token=${token}`;

    // Send email
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Access Your Registrations - 4Tango",
        html: getDancerMagicLinkEmailHtml(magicLink),
        text: `Click here to access your registrations: ${magicLink}\n\nThis link will expire in 15 minutes.`,
      });
    } catch (emailError) {
      console.error("Failed to send dancer magic link email:", emailError);
      await prisma.magicLinkToken.delete({ where: { token } });
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`Dancer magic link for ${normalizedEmail}: ${magicLink}`);
    }

    return NextResponse.json({
      message: "If you have registrations, a magic link has been sent to your email",
    });
  } catch (error) {
    console.error("Error sending dancer magic link:", error);
    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    );
  }
}

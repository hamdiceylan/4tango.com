import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendEmail, getMagicLinkEmailHtml } from "@/lib/email";

// POST /api/auth/signup - Create new organizer account
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, organizationName } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await prisma.organizerUser.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Create organizer and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organizer (organization)
      const organizer = await tx.organizer.create({
        data: {
          name: organizationName || name,
          email: normalizedEmail,
        }
      });

      // Create organizer user
      const organizerUser = await tx.organizerUser.create({
        data: {
          organizerId: organizer.id,
          email: normalizedEmail,
          fullName: name,
          role: "ADMIN",
        }
      });

      return { organizer, organizerUser };
    });

    // Generate magic link token for immediate login
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

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

    // Send welcome email with magic link
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Welcome to 4Tango - Verify your email",
        html: getMagicLinkEmailHtml(magicLink),
        text: `Welcome to 4Tango! Click here to verify your email and sign in: ${magicLink}\n\nThis link will expire in 15 minutes.`,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail signup if email fails - user can request new magic link
    }

    return NextResponse.json({
      message: "Account created successfully. Please check your email to sign in.",
      organizerId: result.organizer.id,
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}

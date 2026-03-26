import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/auth";

// GET /api/auth/dancer/verify-email?token=xxx - Verify email and auto-login
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find dancer with this token
    const dancer = await prisma.dancer.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!dancer) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Mark email as verified and clear token
    await prisma.dancer.update({
      where: { id: dancer.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
      },
    });

    // Create session for auto-login
    const sessionToken = await createSession(dancer.id, "dancer");

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: dancer.id,
        email: dancer.email,
        fullName: dancer.fullName,
      },
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}

// POST /api/auth/dancer/verify-email - Resend verification email
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

    const dancer = await prisma.dancer.findUnique({
      where: { email: normalizedEmail },
    });

    if (!dancer) {
      // Don't reveal if email exists
      return NextResponse.json({
        message: "If an account exists with this email, a verification link will be sent.",
      });
    }

    if (dancer.emailVerified) {
      return NextResponse.json({
        message: "Email is already verified. You can log in.",
      });
    }

    // Generate new token
    const crypto = await import("crypto");
    const verifyToken = crypto.randomBytes(32).toString("hex");

    await prisma.dancer.update({
      where: { id: dancer.id },
      data: { emailVerifyToken: verifyToken },
    });

    // Send verification email
    const { sendEmail } = await import("@/lib/email");
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://4tango.com";
    const verifyLink = `${baseUrl}/dancer/verify-email?token=${verifyToken}`;

    await sendEmail({
      to: normalizedEmail,
      subject: "Verify your 4Tango account",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify your email</h2>
          <p>Click the button below to verify your email address:</p>
          <a href="${verifyLink}" style="display: inline-block; background: #f43f5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Verify Email</a>
          <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
        </div>
      `,
      text: `Verify your email by visiting: ${verifyLink}`,
    });

    return NextResponse.json({
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (error) {
    console.error("Error resending verification email:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}

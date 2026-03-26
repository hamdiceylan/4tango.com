import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// POST /api/auth/dancer/signup - Create new dancer account with email/password
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, role } = body;

    // Validate required fields
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingDancer = await prisma.dancer.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingDancer) {
      // If dancer exists but has no password (social login only), allow them to set one
      if (!existingDancer.passwordHash) {
        const passwordHash = await bcrypt.hash(password, 12);
        const verifyToken = crypto.randomBytes(32).toString("hex");

        await prisma.dancer.update({
          where: { id: existingDancer.id },
          data: {
            passwordHash,
            fullName: existingDancer.fullName || fullName,
            emailVerifyToken: verifyToken,
          },
        });

        // Send verification email
        await sendVerificationEmail(normalizedEmail, verifyToken, fullName);

        return NextResponse.json({
          message: "Password set successfully. Please check your email to verify your account.",
          needsVerification: true,
        });
      }

      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate email verification token
    const verifyToken = crypto.randomBytes(32).toString("hex");

    // Create dancer
    const dancer = await prisma.dancer.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        fullName,
        role: role || "FOLLOWER",
        emailVerifyToken: verifyToken,
        emailVerified: false,
      },
    });

    // Send verification email
    await sendVerificationEmail(normalizedEmail, verifyToken, fullName);

    return NextResponse.json(
      {
        message: "Account created successfully. Please check your email to verify your account.",
        dancerId: dancer.id,
        needsVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating dancer account:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}

async function sendVerificationEmail(email: string, token: string, name: string) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://4tango.com";
  const verifyLink = `${baseUrl}/dancer/verify-email?token=${token}`;

  try {
    await sendEmail({
      to: email,
      subject: "Verify your 4Tango account",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to 4Tango, ${name}!</h2>
          <p>Thank you for creating an account. Please verify your email address by clicking the button below:</p>
          <a href="${verifyLink}" style="display: inline-block; background: #f43f5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Verify Email</a>
          <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
          <p style="color: #666; font-size: 14px;">If you didn't create this account, you can safely ignore this email.</p>
        </div>
      `,
      text: `Welcome to 4Tango, ${name}! Please verify your email by visiting: ${verifyLink}`,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Don't fail signup if email fails
  }
}

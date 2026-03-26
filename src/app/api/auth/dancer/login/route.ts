import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/auth";

// POST /api/auth/dancer/login - Login dancer with email/password
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find dancer by email
    const dancer = await prisma.dancer.findUnique({
      where: { email: normalizedEmail },
    });

    if (!dancer) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if dancer has a password (might be social login only)
    if (!dancer.passwordHash) {
      return NextResponse.json(
        { error: "This account uses social login. Please sign in with Google, Apple, or Facebook." },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, dancer.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!dancer.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before logging in. Check your inbox for the verification link." },
        { status: 401 }
      );
    }

    // Create session
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
      user: {
        id: dancer.id,
        email: dancer.email,
        fullName: dancer.fullName,
        role: dancer.role,
        profilePictureUrl: dancer.profilePictureUrl,
      },
    });
  } catch (error) {
    console.error("Error logging in dancer:", error);
    return NextResponse.json(
      { error: "Failed to log in" },
      { status: 500 }
    );
  }
}

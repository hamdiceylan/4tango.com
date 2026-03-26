import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import type { OrganizerRole } from "@prisma/client";

// Organizer user session
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  organizerId: string;
  organizerName: string;
  role: OrganizerRole;
  onboardingCompleted: boolean;
}

// Dancer user session
export interface DancerUser {
  id: string;
  email: string;
  fullName: string;
  city?: string | null;
  country?: string | null;
}

// Combined session type
export type SessionUser =
  | { type: 'organizer'; user: AuthUser }
  | { type: 'dancer'; user: DancerUser };

// Get the current session (organizer only, for backward compatibility)
export async function getSession(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return null;
    }

    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
    });

    if (!session || session.expiresAt < new Date()) {
      // Delete expired session
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      return null;
    }

    if (session.userType === "organizer") {
      const organizerUser = await prisma.organizerUser.findUnique({
        where: { id: session.userId },
        include: { organizer: true },
      });

      if (!organizerUser) {
        return null;
      }

      return {
        id: organizerUser.id,
        email: organizerUser.email,
        fullName: organizerUser.fullName,
        organizerId: organizerUser.organizerId,
        organizerName: organizerUser.organizer.name,
        role: organizerUser.role,
        onboardingCompleted: !!organizerUser.organizer.onboardingCompletedAt,
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

// Get any session type (organizer or dancer)
export async function getAnySession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return null;
    }

    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      return null;
    }

    if (session.userType === "organizer") {
      const organizerUser = await prisma.organizerUser.findUnique({
        where: { id: session.userId },
        include: { organizer: true },
      });

      if (!organizerUser) {
        return null;
      }

      return {
        type: 'organizer',
        user: {
          id: organizerUser.id,
          email: organizerUser.email,
          fullName: organizerUser.fullName,
          organizerId: organizerUser.organizerId,
          organizerName: organizerUser.organizer.name,
          role: organizerUser.role,
          onboardingCompleted: !!organizerUser.organizer.onboardingCompletedAt,
        },
      };
    }

    if (session.userType === "dancer") {
      const dancer = await prisma.dancer.findUnique({
        where: { id: session.userId },
      });

      if (!dancer) {
        return null;
      }

      return {
        type: 'dancer',
        user: {
          id: dancer.id,
          email: dancer.email,
          fullName: dancer.fullName,
          city: dancer.city,
          country: dancer.country,
        },
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

// Get dancer session
export async function getDancerSession(): Promise<DancerUser | null> {
  const session = await getAnySession();
  if (session?.type === 'dancer') {
    return session.user;
  }
  return null;
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireDancerAuth(): Promise<DancerUser> {
  const user = await getDancerSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

// Create a session for a user
export async function createSession(
  userId: string,
  userType: 'organizer' | 'dancer'
): Promise<string> {
  const crypto = await import('crypto');
  const sessionToken = crypto.randomBytes(32).toString('hex');

  await prisma.session.create({
    data: {
      userId,
      userType,
      token: sessionToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  return sessionToken;
}

// Delete a session
export async function deleteSession(token: string): Promise<void> {
  await prisma.session.delete({
    where: { token },
  }).catch(() => {
    // Ignore if session doesn't exist
  });
}

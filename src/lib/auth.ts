import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  organizerId: string;
  organizerName: string;
}

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
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

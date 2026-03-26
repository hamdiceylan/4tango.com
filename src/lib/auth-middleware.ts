// Authentication middleware with permission checking

import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { type Permission, hasPermission, getPermissions } from '@/lib/permissions';
import type { OrganizerRole } from '@prisma/client';

// Extended auth user with role and permissions
export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  organizerId: string;
  organizerName: string;
  role: OrganizerRole;
  permissions: Permission[];
  onboardingCompleted: boolean;
}

// Get authenticated user with role and permissions
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

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

    if (session.userType !== 'organizer') {
      return null;
    }

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
      permissions: getPermissions(organizerUser.role),
      onboardingCompleted: !!organizerUser.organizer.onboardingCompletedAt,
    };
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

// Require authentication
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new AuthError('Unauthorized', 401);
  }
  return user;
}

// Require specific permission
export async function requirePermission(permission: Permission): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  if (!hasPermission(user.role, permission)) {
    throw new AuthError('Forbidden', 403);
  }
  return user;
}

// Require any of the specified permissions
export async function requireAnyPermission(permissions: Permission[]): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  const hasAny = permissions.some((p) => hasPermission(user.role, p));
  if (!hasAny) {
    throw new AuthError('Forbidden', 403);
  }
  return user;
}

// Require all of the specified permissions
export async function requireAllPermissions(permissions: Permission[]): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  const hasAll = permissions.every((p) => hasPermission(user.role, p));
  if (!hasAll) {
    throw new AuthError('Forbidden', 403);
  }
  return user;
}

// Custom auth error class
export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

// Helper to create JSON response from auth error
export function authErrorResponse(error: AuthError): Response {
  return Response.json(
    { error: error.message },
    { status: error.status }
  );
}

// Wrapper for API route handlers with permission checking
export function withPermission<T>(
  permission: Permission,
  handler: (user: AuthenticatedUser, request: Request) => Promise<T>
) {
  return async (request: Request): Promise<Response> => {
    try {
      const user = await requirePermission(permission);
      const result = await handler(user, request);
      return Response.json(result);
    } catch (error) {
      if (error instanceof AuthError) {
        return authErrorResponse(error);
      }
      console.error('API Error:', error);
      return Response.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

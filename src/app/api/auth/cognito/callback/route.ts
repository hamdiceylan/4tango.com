import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  exchangeCodeForTokens,
  authenticateWithCognitoTokens,
  createSessionFromCognitoAuth,
} from '@/lib/auth-cognito';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle error from Cognito
    if (error) {
      console.error('Cognito auth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
      );
    }

    // Validate authorization code
    if (!code) {
      return NextResponse.redirect(
        new URL('/login?error=missing_code', request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Authenticate user (creates or links user in database)
    const authResult = await authenticateWithCognitoTokens(tokens);

    // Create session
    const sessionToken = await createSessionFromCognitoAuth(authResult);

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    // Store refresh token if available (optional, for token refresh)
    if (tokens.refreshToken) {
      cookieStore.set('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }

    // Redirect based on user type and state
    if (authResult.userType === 'dancer') {
      if (authResult.needsProfileCompletion) {
        // New dancer needs to complete profile
        return NextResponse.redirect(new URL('/complete-profile', request.url));
      }
      // Dancer goes to their registrations or home
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Organizer flow
    if (authResult.isNewUser) {
      // New organizer goes to onboarding
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    // Existing organizer goes to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Cognito callback error:', error);
    const message = error instanceof Error ? error.message : 'Authentication failed';
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, request.url)
    );
  }
}

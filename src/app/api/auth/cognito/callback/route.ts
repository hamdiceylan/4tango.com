import { NextResponse } from 'next/server';
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

    // Determine redirect URL for organizers
    const redirectUrl = authResult.isNewUser ? '/onboarding' : '/dashboard';

    // Create redirect response
    const response = NextResponse.redirect(new URL(redirectUrl, request.url));

    // Set session cookie on the response
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    // Store refresh token on the response if available
    if (tokens.refreshToken) {
      response.cookies.set('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Cognito callback error:', error);
    const message = error instanceof Error ? error.message : 'Authentication failed';
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, request.url)
    );
  }
}

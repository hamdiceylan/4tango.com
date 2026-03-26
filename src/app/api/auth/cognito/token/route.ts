import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  signInOrganizerWithPassword,
  signUpOrganizerWithPassword,
  confirmSignUp,
  forgotPassword,
  confirmForgotPassword,
  authenticateWithCognitoTokens,
  createSessionFromCognitoAuth,
} from '@/lib/auth-cognito';

// POST /api/auth/cognito/token
// Handle various Cognito operations
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'signin':
        return handleSignIn(body);
      case 'signup':
        return handleSignUp(body);
      case 'confirm':
        return handleConfirmSignUp(body);
      case 'forgot':
        return handleForgotPassword(body);
      case 'reset':
        return handleResetPassword(body);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Cognito token error:', error);
    const message = error instanceof Error ? error.message : 'Operation failed';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

// Sign in with email/password
async function handleSignIn(body: {
  email: string;
  password: string;
}) {
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  // Sign in with Cognito
  const tokens = await signInOrganizerWithPassword(email, password);

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

  // Store refresh token
  if (tokens.refreshToken) {
    cookieStore.set('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });
  }

  return NextResponse.json({
    success: true,
    userType: authResult.userType,
    isNewUser: authResult.isNewUser,
    redirect: authResult.isNewUser ? '/onboarding' : '/dashboard',
  });
}

// Sign up with email/password
async function handleSignUp(body: {
  email: string;
  password: string;
  fullName: string;
}) {
  const { email, password, fullName } = body;

  if (!email || !password || !fullName) {
    return NextResponse.json(
      { error: 'Email, password, and full name are required' },
      { status: 400 }
    );
  }

  // Validate password
  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    );
  }

  // Sign up with Cognito
  const result = await signUpOrganizerWithPassword(email, password, fullName);

  return NextResponse.json({
    success: true,
    confirmed: result.confirmed,
    message: result.confirmed
      ? 'Account created successfully'
      : 'Please check your email for a verification code',
  });
}

// Confirm sign up with verification code
async function handleConfirmSignUp(body: {
  email: string;
  code: string;
}) {
  const { email, code } = body;

  if (!email || !code) {
    return NextResponse.json(
      { error: 'Email and verification code are required' },
      { status: 400 }
    );
  }

  await confirmSignUp(email, code);

  return NextResponse.json({
    success: true,
    message: 'Email verified successfully. You can now sign in.',
  });
}

// Forgot password - send reset code
async function handleForgotPassword(body: { email: string }) {
  const { email } = body;

  if (!email) {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 }
    );
  }

  await forgotPassword(email);

  return NextResponse.json({
    success: true,
    message: 'If an account exists with this email, you will receive a password reset code.',
  });
}

// Reset password with code
async function handleResetPassword(body: {
  email: string;
  code: string;
  newPassword: string;
}) {
  const { email, code, newPassword } = body;

  if (!email || !code || !newPassword) {
    return NextResponse.json(
      { error: 'Email, verification code, and new password are required' },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    );
  }

  await confirmForgotPassword(email, code, newPassword);

  return NextResponse.json({
    success: true,
    message: 'Password reset successfully. You can now sign in with your new password.',
  });
}

// Cognito authentication functions

import prisma from '@/lib/prisma';
import {
  getCognitoConfig,
  getCognitoUrls,
  CognitoTokens,
  decodeIdToken,
  getProviderFromToken,
  getAppUrl,
} from '@/lib/cognito';

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string): Promise<CognitoTokens> {
  const config = getCognitoConfig();
  const urls = getCognitoUrls(config);
  const appUrl = getAppUrl();

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    code: code,
    redirect_uri: `${appUrl}/api/auth/cognito/callback`,
  });

  const response = await fetch(urls.token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Token exchange failed:', error);
    throw new Error('Failed to exchange authorization code for tokens');
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
  };
}

// Refresh tokens using refresh token
export async function refreshTokens(refreshToken: string): Promise<CognitoTokens> {
  const config = getCognitoConfig();
  const urls = getCognitoUrls(config);

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: config.clientId,
    refresh_token: refreshToken,
  });

  const response = await fetch(urls.token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh tokens');
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    refreshToken: data.refresh_token || refreshToken, // Refresh token may not be returned
    expiresIn: data.expires_in,
    tokenType: data.token_type,
  };
}

// User types
export type CognitoUserType = 'organizer' | 'dancer';

export interface CognitoAuthResult {
  userType: CognitoUserType;
  cognitoUserId: string;
  email: string;
  name?: string;
  provider?: string;
  isNewUser: boolean;
  needsProfileCompletion: boolean;
  userId: string; // OrganizerUser.id or Dancer.id
  organizerId?: string; // For organizers
}

// Authenticate or register a user from Cognito tokens
export async function authenticateWithCognitoTokens(
  tokens: CognitoTokens
): Promise<CognitoAuthResult> {
  // Decode the ID token to get user info
  const payload = decodeIdToken(tokens.idToken);
  const cognitoUserId = payload.sub;
  const email = payload.email;
  const name = payload.name;
  const provider = getProviderFromToken(payload);
  const organizationName = payload['custom:organizerId']; // Stores org name from signup

  // Check if this is an organizer (email/password users are typically organizers)
  // Social login users are typically dancers
  const isOrganizerLogin = !provider; // No provider means email/password login

  if (isOrganizerLogin) {
    return authenticateOrganizer(cognitoUserId, email, name, organizationName);
  } else {
    return authenticateDancer(cognitoUserId, email, name, provider);
  }
}

// Authenticate or register an organizer
async function authenticateOrganizer(
  cognitoUserId: string,
  email: string,
  name?: string,
  organizationName?: string
): Promise<CognitoAuthResult> {
  // Check if organizer user exists with this Cognito ID
  let organizerUser = await prisma.organizerUser.findUnique({
    where: { cognitoUserId },
    include: { organizer: true },
  });

  if (organizerUser) {
    return {
      userType: 'organizer',
      cognitoUserId,
      email: organizerUser.email,
      name: organizerUser.fullName,
      isNewUser: false,
      needsProfileCompletion: false,
      userId: organizerUser.id,
      organizerId: organizerUser.organizerId,
    };
  }

  // Check if organizer user exists with this email (migration case)
  organizerUser = await prisma.organizerUser.findUnique({
    where: { email },
    include: { organizer: true },
  });

  if (organizerUser) {
    // Link the Cognito ID to the existing user
    await prisma.organizerUser.update({
      where: { id: organizerUser.id },
      data: { cognitoUserId },
    });

    return {
      userType: 'organizer',
      cognitoUserId,
      email: organizerUser.email,
      name: organizerUser.fullName,
      isNewUser: false,
      needsProfileCompletion: false,
      userId: organizerUser.id,
      organizerId: organizerUser.organizerId,
    };
  }

  // New organizer - create organizer and organizer user
  const fullName = name || email.split('@')[0];
  const orgName = organizationName || fullName;
  const organizer = await prisma.organizer.create({
    data: {
      name: orgName,
      email,
      users: {
        create: {
          email,
          fullName,
          role: 'admin',
          cognitoUserId,
        },
      },
    },
    include: {
      users: true,
    },
  });

  return {
    userType: 'organizer',
    cognitoUserId,
    email,
    name: fullName,
    isNewUser: true,
    needsProfileCompletion: false, // Organizers use onboarding wizard instead
    userId: organizer.users[0].id,
    organizerId: organizer.id,
  };
}

// Authenticate or register a dancer
async function authenticateDancer(
  cognitoUserId: string,
  email: string,
  name?: string,
  provider?: string | null
): Promise<CognitoAuthResult> {
  // Check if dancer auth exists with this Cognito ID
  const existingAuth = await prisma.dancerAuth.findUnique({
    where: { cognitoUserId },
    include: { dancer: true },
  });

  if (existingAuth) {
    // Update last login
    await prisma.dancerAuth.update({
      where: { id: existingAuth.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      userType: 'dancer',
      cognitoUserId,
      email: existingAuth.dancer.email,
      name: existingAuth.dancer.fullName,
      provider: provider || undefined,
      isNewUser: false,
      needsProfileCompletion: !existingAuth.dancer.country, // Need country for dancer DB
      userId: existingAuth.dancerId,
    };
  }

  // Check if dancer exists with this email
  const existingDancer = await prisma.dancer.findUnique({
    where: { email },
    include: { auth: true },
  });

  if (existingDancer) {
    // Link Cognito auth to existing dancer
    if (existingDancer.auth) {
      // Already has auth with different Cognito ID - error
      throw new Error('This email is already linked to a different account');
    }

    await prisma.dancerAuth.create({
      data: {
        dancerId: existingDancer.id,
        cognitoUserId,
        provider: provider || undefined,
        lastLoginAt: new Date(),
      },
    });

    return {
      userType: 'dancer',
      cognitoUserId,
      email: existingDancer.email,
      name: existingDancer.fullName,
      provider: provider || undefined,
      isNewUser: false,
      needsProfileCompletion: !existingDancer.country,
      userId: existingDancer.id,
    };
  }

  // New dancer - create dancer and auth
  const fullName = name || email.split('@')[0];
  const dancer = await prisma.dancer.create({
    data: {
      email,
      fullName,
      auth: {
        create: {
          cognitoUserId,
          provider: provider || undefined,
          lastLoginAt: new Date(),
        },
      },
    },
  });

  return {
    userType: 'dancer',
    cognitoUserId,
    email,
    name: fullName,
    provider: provider || undefined,
    isNewUser: true,
    needsProfileCompletion: true, // New dancers need to complete profile
    userId: dancer.id,
  };
}

// Sign in organizer with email and password (using Cognito)
export async function signInOrganizerWithPassword(
  email: string,
  password: string
): Promise<CognitoTokens> {
  const config = getCognitoConfig();

  // Use the InitiateAuth API
  const response = await fetch(
    `https://cognito-idp.${config.region}.amazonaws.com/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
      },
      body: JSON.stringify({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: config.clientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      }),
    }
  );

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Authentication failed: ${text || response.statusText}`);
  }

  if (!response.ok) {
    if (data.__type === 'NotAuthorizedException') {
      throw new Error('Invalid email or password');
    }
    if (data.__type === 'UserNotFoundException') {
      throw new Error('User not found');
    }
    if (data.__type === 'UserNotConfirmedException') {
      throw new Error('Please verify your email first');
    }
    throw new Error(data.message || 'Authentication failed');
  }

  const result = data.AuthenticationResult;

  return {
    accessToken: result.AccessToken,
    idToken: result.IdToken,
    refreshToken: result.RefreshToken,
    expiresIn: result.ExpiresIn,
    tokenType: result.TokenType,
  };
}

// Sign up organizer with email and password
export async function signUpOrganizerWithPassword(
  email: string,
  password: string,
  fullName: string,
  organizationName?: string
): Promise<{ userSub: string; confirmed: boolean }> {
  const config = getCognitoConfig();

  const response = await fetch(
    `https://cognito-idp.${config.region}.amazonaws.com/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.SignUp',
      },
      body: JSON.stringify({
        ClientId: config.clientId,
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'name', Value: fullName },
          { Name: 'custom:userType', Value: 'organizer' },
          { Name: 'custom:organizerId', Value: organizationName || fullName },
        ],
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    let error;
    try {
      error = JSON.parse(text);
    } catch {
      throw new Error(`Sign up failed: ${text || response.statusText}`);
    }
    if (error.__type === 'UsernameExistsException') {
      throw new Error('An account with this email already exists');
    }
    if (error.__type === 'InvalidPasswordException') {
      throw new Error('Password does not meet requirements');
    }
    throw new Error(error.message || 'Sign up failed');
  }

  const data = await response.json();

  return {
    userSub: data.UserSub,
    confirmed: data.UserConfirmed,
  };
}

// Confirm sign up with verification code
export async function confirmSignUp(
  email: string,
  confirmationCode: string
): Promise<void> {
  const config = getCognitoConfig();

  const response = await fetch(
    `https://cognito-idp.${config.region}.amazonaws.com/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.ConfirmSignUp',
      },
      body: JSON.stringify({
        ClientId: config.clientId,
        Username: email,
        ConfirmationCode: confirmationCode,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    let error;
    try {
      error = JSON.parse(text);
    } catch {
      throw new Error(`Confirmation failed: ${text || response.statusText}`);
    }
    if (error.__type === 'CodeMismatchException') {
      throw new Error('Invalid verification code');
    }
    if (error.__type === 'ExpiredCodeException') {
      throw new Error('Verification code has expired');
    }
    throw new Error(error.message || 'Confirmation failed');
  }
}

// Resend confirmation code
export async function resendConfirmationCode(email: string): Promise<void> {
  const config = getCognitoConfig();

  const response = await fetch(
    `https://cognito-idp.${config.region}.amazonaws.com/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.ResendConfirmationCode',
      },
      body: JSON.stringify({
        ClientId: config.clientId,
        Username: email,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to resend code');
  }
}

// Forgot password - initiate password reset
export async function forgotPassword(email: string): Promise<void> {
  const config = getCognitoConfig();

  const response = await fetch(
    `https://cognito-idp.${config.region}.amazonaws.com/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.ForgotPassword',
      },
      body: JSON.stringify({
        ClientId: config.clientId,
        Username: email,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    // Don't reveal if user exists
    if (error.__type === 'UserNotFoundException') {
      return; // Silent success
    }
    throw new Error(error.message || 'Failed to initiate password reset');
  }
}

// Confirm forgot password with code
export async function confirmForgotPassword(
  email: string,
  confirmationCode: string,
  newPassword: string
): Promise<void> {
  const config = getCognitoConfig();

  const response = await fetch(
    `https://cognito-idp.${config.region}.amazonaws.com/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.ConfirmForgotPassword',
      },
      body: JSON.stringify({
        ClientId: config.clientId,
        Username: email,
        ConfirmationCode: confirmationCode,
        Password: newPassword,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    if (error.__type === 'CodeMismatchException') {
      throw new Error('Invalid verification code');
    }
    if (error.__type === 'ExpiredCodeException') {
      throw new Error('Verification code has expired');
    }
    if (error.__type === 'InvalidPasswordException') {
      throw new Error('Password does not meet requirements');
    }
    throw new Error(error.message || 'Failed to reset password');
  }
}

// Create a session from Cognito auth result
export async function createSessionFromCognitoAuth(
  authResult: CognitoAuthResult
): Promise<string> {
  const crypto = await import('crypto');
  const sessionToken = crypto.randomBytes(32).toString('hex');

  await prisma.session.create({
    data: {
      userId: authResult.userId,
      userType: authResult.userType,
      token: sessionToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  return sessionToken;
}

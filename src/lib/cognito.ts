// AWS Cognito configuration and client setup

export interface CognitoConfig {
  userPoolId: string;
  clientId: string;
  region: string;
  domain: string;
}

// Get Cognito configuration from environment variables
export function getCognitoConfig(): CognitoConfig {
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.COGNITO_CLIENT_ID;
  const region = process.env.COGNITO_REGION || process.env.AWS_REGION || 'eu-west-1';
  const domain = process.env.COGNITO_DOMAIN || `https://4tango-${process.env.NODE_ENV === 'production' ? 'prod' : 'dev'}.auth.${region}.amazoncognito.com`;

  if (!userPoolId || !clientId) {
    throw new Error('Missing required Cognito environment variables (COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID)');
  }

  return {
    userPoolId,
    clientId,
    region,
    domain,
  };
}

// Get the base URL for the application
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
}

// Get the Cognito hosted UI URLs
export function getCognitoUrls(config: CognitoConfig) {
  const appUrl = getAppUrl();
  const callbackUrl = `${appUrl}/api/auth/cognito/callback`;
  const logoutUrl = `${appUrl}/login`;

  return {
    // Authorization endpoint for social login
    authorize: `${config.domain}/oauth2/authorize`,
    // Token endpoint for exchanging authorization code
    token: `${config.domain}/oauth2/token`,
    // User info endpoint
    userInfo: `${config.domain}/oauth2/userInfo`,
    // Logout endpoint
    logout: `${config.domain}/logout`,
    // Callback URL after authentication
    callback: callbackUrl,
    // URL after logout
    logoutRedirect: logoutUrl,
  };
}

// Build the authorization URL for social login
export function buildAuthorizationUrl(
  provider: 'Google' | 'SignInWithApple' | 'Facebook',
  state?: string
): string {
  const config = getCognitoConfig();
  const urls = getCognitoUrls(config);
  const appUrl = getAppUrl();

  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    scope: 'email openid profile',
    redirect_uri: `${appUrl}/api/auth/cognito/callback`,
    identity_provider: provider,
  });

  if (state) {
    params.set('state', state);
  }

  return `${urls.authorize}?${params.toString()}`;
}

// Build URLs for each social provider
export function getSocialLoginUrls() {
  return {
    google: buildAuthorizationUrl('Google'),
    apple: buildAuthorizationUrl('SignInWithApple'),
    facebook: buildAuthorizationUrl('Facebook'),
  };
}

// PKCE (Proof Key for Code Exchange) utilities for public clients
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}

function base64UrlEncode(array: Uint8Array): string {
  const base64 = Buffer.from(array).toString('base64');
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Token types
export interface CognitoTokens {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
}

// Decoded ID token payload
export interface CognitoIdTokenPayload {
  sub: string; // Cognito user ID
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string; // Profile picture URL from OAuth provider
  'cognito:username': string;
  'cognito:groups'?: string[];
  'custom:organizerId'?: string;
  'custom:userType'?: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  identities?: {
    userId: string;
    providerName: string;
    providerType: string;
    issuer: string | null;
    primary: string;
    dateCreated: string;
  }[];
}

// Decode JWT without verification (for extracting claims)
// Note: In production, you should verify the token signature
export function decodeIdToken(idToken: string): CognitoIdTokenPayload {
  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const payload = parts[1];
  const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
  return JSON.parse(decoded);
}

// Get the provider from the identity info
export function getProviderFromToken(payload: CognitoIdTokenPayload): string | null {
  if (payload.identities && payload.identities.length > 0) {
    const identity = payload.identities[0];
    return identity.providerName.toLowerCase();
  }
  return null;
}

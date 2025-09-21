import { authConfig } from './config';
import { OAuthResponse, AuthError, OAuthCallbackRequest } from './types';

function generateState(): string {
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('oauth_state', state);
  }
  return state;
}

export function generateGitHubUrl(): string {
  const params = new URLSearchParams({
    client_id: authConfig.providers.github.clientId,
    redirect_uri: authConfig.providers.github.redirectUri,
    scope: 'user:email',
    response_type: 'code',
    state: generateState()
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export function generateGoogleUrl(): string {
  const params = new URLSearchParams({
    client_id: authConfig.providers.google.clientId,
    redirect_uri: authConfig.providers.google.redirectUri,
    scope: 'openid email profile',
    response_type: 'code',
    state: generateState()
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function validateState(receivedState: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const storedState = sessionStorage.getItem('oauth_state');
  sessionStorage.removeItem('oauth_state');
  
  return storedState === receivedState;
}

export async function exchangeCodeForToken(
  provider: 'github' | 'google', 
  code: string
): Promise<OAuthResponse> {
  const redirectUri = provider === 'github' 
    ? authConfig.providers.github.redirectUri 
    : authConfig.providers.google.redirectUri;

  const requestBody: OAuthCallbackRequest = {
    code,
    redirect_uri: redirectUri,
  };

  const baseUrl = process.env.NEXT_PUBLIC_RUST_BACKEND_URL || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${baseUrl}/api/auth/oauth/${provider}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorMessage = `OAuth exchange failed: ${response.status} ${response.statusText}`;
      
      try {
        const errorData: AuthError = await response.json();
        errorMessage = errorData.error || errorMessage;
        if (errorData.details) {
          errorMessage += ` - ${errorData.details}`;
        }
      } catch {
        // If we can't parse the error response, use the default message
      }
      
      throw new Error(errorMessage);
    }

    const data: OAuthResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('OAuth exchange failed due to network error');
  }
}
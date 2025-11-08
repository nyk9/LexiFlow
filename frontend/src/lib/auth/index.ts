import { User, AuthSession } from './types';
import { getSession, setSession, removeSession } from './storage';
import { generateGitHubUrl, generateGoogleUrl, validateState, exchangeCodeForToken } from './providers';

export function signIn(provider: 'github' | 'google'): void {
  if (typeof window === 'undefined') return;

  const url = provider === 'github' ? generateGitHubUrl() : generateGoogleUrl();
  window.location.href = url;
}

export function signOut(): void {
  removeSession();
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

export function getCurrentUser(): User | null {
  const session = getSession();
  return session?.user || null;
}

export function getAccessToken(): string | null {
  const session = getSession();
  return session?.accessToken || null;
}

export async function handleOAuthCallback(
  provider: 'github' | 'google',
  code: string,
  state: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate state parameter
    if (!validateState(state)) {
      return { success: false, error: 'Invalid state parameter' };
    }

    // Exchange code for token
    const oauthResponse = await exchangeCodeForToken(provider, code);
    
    // Create session
    const session: AuthSession = {
      user: oauthResponse.user,
      accessToken: oauthResponse.access_token,
      provider,
      expiresAt: Date.now() + (oauthResponse.expires_in * 1000)
    };

    setSession(session);
    return { success: true };
  } catch (error) {
    console.error('OAuth callback error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Authentication failed' 
    };
  }
}

export { getSession, isSessionValid } from './storage';
export type { User, AuthSession } from './types';
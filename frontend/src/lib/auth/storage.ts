import { AuthSession } from './types';

const SESSION_KEY = 'lexiflow_auth_session';

export function setSession(session: AuthSession): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    
    // Server Action用にcookieにもアクセストークンを保存
    const expiryDate = new Date(session.expiresAt);
    document.cookie = `lexiflow_access_token=${session.accessToken}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  }
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;

    const session: AuthSession = JSON.parse(stored);
    
    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      removeSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error parsing stored session:', error);
    removeSession();
    return null;
  }
}

export function removeSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
    
    // cookieからもアクセストークンを削除
    document.cookie = 'lexiflow_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
}

export function isSessionValid(): boolean {
  const session = getSession();
  return session !== null && Date.now() < session.expiresAt;
}
import { getAccessToken } from './index';
import { User, AuthError } from './types';

const baseUrl = process.env.NEXT_PUBLIC_RUST_BACKEND_URL || 'http://localhost:8000';

export async function getCurrentUser(): Promise<User | null> {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token is invalid or expired
        return null;
      }
      
      let errorMessage = `Failed to get user info: ${response.status} ${response.statusText}`;
      
      try {
        const errorData: AuthError = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If we can't parse the error response, use the default message
      }
      
      throw new Error(errorMessage);
    }

    const user: User = await response.json();
    return user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

export async function makeAuthenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication failed - please log in again');
    }
    
    let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
    
    try {
      const errorData: AuthError = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If we can't parse the error response, use the default message
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
}
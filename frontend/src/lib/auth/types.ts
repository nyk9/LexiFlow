export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  provider: string;
  expiresAt: number;
}

export interface AuthConfig {
  providers: {
    github: {
      clientId: string;
      redirectUri: string;
    };
    google: {
      clientId: string;
      redirectUri: string;
    };
  };
}

// Rust backend response types
export interface OAuthResponse {
  user: User;
  access_token: string;
  expires_in: number;
}

export interface AuthError {
  error: string;
  details?: string;
}

export interface OAuthCallbackRequest {
  code: string;
  redirect_uri: string;
}
const API_BASE_URL =
  process.env.NEXT_PUBLIC_RUST_BACKEND_URL || "http://localhost:8000";

export interface OAuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
  };
  access_token: string;
  expires_in: number;
}

export interface OAuthRequest {
  code: string;
  redirect_uri: string;
}

export class AuthAPI {
  static async githubOAuth(request: OAuthRequest): Promise<OAuthResponse> {
    console.log("GitHub OAuth request:", request);

    const response = await fetch(`${API_BASE_URL}/api/auth/oauth/github`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    console.log("GitHub OAuth response status:", response.status);
    console.log("GitHub OAuth response headers:", response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GitHub OAuth error response:", errorText);
      throw new Error(
        `GitHub OAuth failed: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const result = await response.json();
    console.log("GitHub OAuth success response:", result);
    return result;
  }

  static async googleOAuth(request: OAuthRequest): Promise<OAuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/oauth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Google OAuth failed: ${response.statusText}`);
    }

    return response.json();
  }

  static getGitHubAuthUrl(redirectUri: string): string {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_ID;
    if (!clientId) {
      throw new Error("GitHub client ID not configured");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "user:email",
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  static getGoogleAuthUrl(redirectUri: string): string {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_ID;
    if (!clientId) {
      throw new Error("Google client ID not configured");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }
}

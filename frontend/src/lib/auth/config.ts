import { AuthConfig } from "./types";

function getRedirectUri(provider: "github" | "google"): string {
  // Check if running in Tauri
  // const isTauri = typeof window !== 'undefined' && window.__TAURI__;

  // if (isTauri) {
  //   return 'lexiflow://oauth/callback';
  // }

  // Web environment
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/callback/${provider}`;
  }

  // Server-side rendering
  return `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/auth/callback/${provider}`;
}

export const authConfig: AuthConfig = {
  providers: {
    github: {
      clientId:
        process.env.NEXT_PUBLIC_GITHUB_ID ||
        process.env.AUTH_GITHUB_ID ||
        "",
      redirectUri: getRedirectUri("github"),
    },
    google: {
      clientId:
        process.env.NEXT_PUBLIC_GOOGLE_ID ||
        process.env.AUTH_GOOGLE_ID ||
        "",
      redirectUri: getRedirectUri("google"),
    },
  },
};

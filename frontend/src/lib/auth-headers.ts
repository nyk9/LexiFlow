import { getAccessToken } from "@/lib/auth/index";

/**
 * Get authentication headers for Rust backend API calls
 * Works in both client and server environments
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const accessToken = getAccessToken();
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return headers;
}

/**
 * Server-side version for compatibility
 * @deprecated Use getAuthHeaders() instead
 */
export async function getAuthHeadersAsync(): Promise<Record<string, string>> {
  return getAuthHeaders();
}
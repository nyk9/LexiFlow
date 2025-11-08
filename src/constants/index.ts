// Base URL for API calls (without /api suffix)
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 
  (typeof window === "undefined" 
    ? process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000"
    : "");

// Full API base URL
export const BASE_API_URL = `${BASE_URL}/api`;

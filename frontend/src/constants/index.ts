// Rust backend URL configuration
export const RUST_BACKEND_URL = process.env.NEXT_PUBLIC_RUST_BACKEND_URL || "http://127.0.0.1:8000";

// Legacy Next.js API URL (for fallback)
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 
  (typeof window === "undefined" 
    ? process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000"
    : "");

// Use Rust backend for API calls
export const BASE_API_URL = `${RUST_BACKEND_URL}/api`;

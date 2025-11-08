"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthAPI } from "@/lib/auth/auth-api";
import { handleOAuthCallback } from "@/lib/auth";

export default function GitHubCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processCallback = async () => {
      // Prevent multiple executions
      if (isProcessing) return;
      setIsProcessing(true);

      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const state = searchParams.get("state") || "";

        console.log("GitHub callback params:", { code, error, state });

        if (error) {
          setError(`OAuth error: ${error}`);
          return;
        }

        if (!code) {
          setError("No authorization code received");
          return;
        }

        // Use the auth library's OAuth handler
        const result = await handleOAuthCallback('github', code, state);

        if (result.success) {
          console.log("OAuth success, redirecting to home");
          router.push("/");
        } else {
          setError(result.error || "Authentication failed");
        }
      } catch (err) {
        console.error("GitHub OAuth error:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      }
    };

    processCallback();
  }, [searchParams, router, isProcessing]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push("/auth/signin")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Authenticating...</h2>
        <p className="text-gray-600">Please wait while we sign you in.</p>
      </div>
    </div>
  );
}

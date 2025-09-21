"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthAPI } from "@/lib/auth/auth-api";
import { useAuth } from "@/components/auth/auth-provider";

export default function GitHubCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const state = searchParams.get("state");

        console.log("GitHub callback params:", { code, error, state });
        console.log("Current URL:", window.location.href);

        if (error) {
          setError(`OAuth error: ${error}`);
          return;
        }

        if (!code) {
          setError("No authorization code received");
          return;
        }

        const redirectUri = `${window.location.origin}/auth/callback/github`;
        console.log("Using redirect URI:", redirectUri);

        const requestData = { code, redirect_uri: redirectUri };
        console.log("Sending request to backend:", requestData);

        const response = await AuthAPI.githubOAuth(requestData);

        await login(response.access_token);
        router.push("/");
      } catch (err) {
        console.error("GitHub OAuth error:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      }
    };

    handleCallback();
  }, [searchParams, login, router]);

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

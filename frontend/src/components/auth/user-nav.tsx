"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "./auth-provider";

export function UserNav() {
  const { user, loading, logout, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="px-4 py-2">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Button asChild size="sm">
        <Link href="/auth/signin">Sign In</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">{user?.email}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          logout();
          window.location.href = "/"; // ホームにリダイレクト
        }}
      >
        Sign Out
      </Button>
    </div>
  );
}

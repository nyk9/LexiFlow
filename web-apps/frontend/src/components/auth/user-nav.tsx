"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function UserNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="px-4 py-2">Loading...</div>;
  }

  if (!session) {
    return (
      <Button asChild size="sm">
        <Link href="/auth/signin">Sign In</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">
        {session.user?.email}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Sign Out
      </Button>
    </div>
  );
}

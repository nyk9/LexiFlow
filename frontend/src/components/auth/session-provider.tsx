"use client";

import { AuthProvider } from "./auth-provider";

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}

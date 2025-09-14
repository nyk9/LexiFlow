import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;

  // Allow access to auth pages
  if (nextUrl.pathname.startsWith("/auth/")) {
    return NextResponse.next();
  }

  // Allow access to public API routes
  if (nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Protect other routes
  if (!req.auth && !nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/auth/signin", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};

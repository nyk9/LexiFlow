import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 認証が不要なパス
  const publicPaths = [
    "/auth/signin",
    "/auth/callback",
    "/",
  ];

  // 静的ファイルやAPI routesはスキップ
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // パブリックパスはスキップ
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 実際の認証チェックはクライアントサイドで行う
  // ここでは基本的なルーティング制御のみ
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/auth/login"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_ROUTES.some((publicPath) =>
    pathname.startsWith(publicPath)
  );

  // 🚫 Redirect unauthenticated users trying to access private pages
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // ✅ Prevent logged-in users from seeing login page again
  if (token && pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Apply middleware to selected routes
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)", // ✅ include auth/login & signup now
  ],
};

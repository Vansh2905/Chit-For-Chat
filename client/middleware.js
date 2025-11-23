import { NextResponse } from "next/server";

export function middleware(req) {
  const token =
    req.cookies.get("token")?.value || req.headers.get("authorization");

  const protectedRoutes = ["/chat", "/profile"];

  // Redirect user if trying to access a protected route without a token
  if (protectedRoutes.some((path) => req.nextUrl.pathname.startsWith(path))) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Apply middleware only to these routes
export const config = {
  matcher: ["/chat/:path*", "/profile/:path*"],
};

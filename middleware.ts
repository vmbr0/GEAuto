import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    const res = NextResponse.next();

    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-XSS-Protection", "1; mode=block");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // Protect /admin routes - ADMIN only
    if (path.startsWith("/admin")) {
      if (token?.role !== UserRole.ADMIN) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return res;
    }

    // Protect /dashboard and /account - USER and ADMIN
    if (path.startsWith("/dashboard") || path.startsWith("/account")) {
      if (!token || (token.role !== UserRole.USER && token.role !== UserRole.ADMIN)) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
    }

    return res;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Public routes
        if (
          path.startsWith("/auth") ||
          path === "/" ||
          path.startsWith("/services") ||
          path.startsWith("/request") ||
          path.startsWith("/forgot-password") ||
          path.startsWith("/reset-password")
        ) {
          return true;
        }

        // Protected routes require authentication
        if (path.startsWith("/dashboard") || path.startsWith("/admin") || path.startsWith("/account")) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/account/:path*",
  ],
};

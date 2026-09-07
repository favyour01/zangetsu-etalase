import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (!token) return NextResponse.next();

    const role = token.role as string;

    // Superadmin can access everything
    if (role === "SUPERADMIN") return NextResponse.next();

    // Affiliator routes - only affiliator can access (superadmin already handled above)
    if (pathname.startsWith("/affiliator") && role !== "AFFILIATOR") {
      return NextResponse.redirect(new URL("/member", req.url));
    }

    // Member routes - member and affiliator can access (superadmin already handled above)
    if (pathname.startsWith("/member") && role !== "MEMBER" && role !== "AFFILIATOR") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/member/:path*", "/affiliator/:path*", "/superadmin/:path*"],
};

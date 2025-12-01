import { NextRequest } from "next/server";

import { getCurrentUser } from "@/modules/auth";

export async function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/auth/logout")
  ) {
    const user = await getCurrentUser();
    if (user) {
      return Response.redirect(new URL("/profile", request.url));
    }
  }

  if (request.nextUrl.pathname.startsWith("/profile")) {
    const user = await getCurrentUser();
    if (!user) {
      return Response.redirect(new URL("/auth/login", request.url));
    }
  }
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/auth/:path*",
    "/profile/:path*",
  ],
};

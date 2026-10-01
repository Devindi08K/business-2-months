import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ACCESS_COOKIE = "access_token";

function getSecret() {
  const value = process.env.JWT_ACCESS_SECRET;
  if (!value) return null;
  return new TextEncoder().encode(value);
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isAdminPage =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  const isAdminApi =
    pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/auth/login") &&
    !pathname.startsWith("/api/auth/csrf");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  // Auth API login/refresh/csrf/logout handled in routes; protect /api/admin/*
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const secret = getSecret();

  if (!token || !secret) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.typ !== "access" || !payload.sub) {
      throw new Error("Invalid token");
    }

    const response = NextResponse.next();
    response.headers.set("x-user-id", String(payload.sub));
    response.headers.set("x-user-role", String(payload.role || "editor"));
    return response;
  } catch {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

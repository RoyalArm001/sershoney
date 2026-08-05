import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { isLang } from "@/lib/i18n";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);

  const maybeLang = pathname.split("/").filter(Boolean)[0];
  const lang = isLang(maybeLang || "") ? maybeLang : "hy";
  requestHeaders.set("x-lang", lang);

  // Allow admin PWA assets without a session cookie.
  if (
    pathname === "/sw.js" ||
    pathname === "/sw-admin.js" ||
    pathname === "/admin-manifest.webmanifest"
  ) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Protect admin routes
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("session")?.value;
    const verified = token ? await verifyToken(token) : null;

    if (!verified) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect admin API routes
  if (pathname.startsWith("/api/admin") && pathname !== "/api/admin/login") {
    const token = request.cookies.get("session")?.value;
    const verified = token ? await verifyToken(token) : null;

    if (!verified) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized access" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|sw\\.js|sw-admin\\.js|admin-manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$).*)",
  ],
};

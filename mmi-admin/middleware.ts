import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const adminAuth = req.cookies.get("admin-auth")?.value || null;
  const { pathname } = req.nextUrl; 

  const publicSignaturePath = "/admin/erp/contracts/signatures/";

  if (pathname.startsWith(publicSignaturePath)) {
    return NextResponse.next();
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  if (isAdminRoute && !isLoginPage && !adminAuth) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (isLoginPage && adminAuth) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
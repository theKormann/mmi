import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const adminAuth = req.cookies.get("admin-auth")?.value || null;

  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = req.nextUrl.pathname === "/admin/login";

  // Se tentar acessar /admin sem estar logado → redireciona para login
  if (isAdminRoute && !isLoginPage && !adminAuth) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Se já estiver logado e tentar ir para login → redireciona para dashboard
  if (isLoginPage && adminAuth) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass static files, public assets, and media files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/public") ||
    pathname.startsWith("/display") ||
    (pathname === "/api/saran" && request.method === "POST") ||
    pathname === "/favicon.ico" ||
    /\.(?:png|jpg|jpeg|gif|webp|svg|ico|mp3|wav|ogg)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Read session token from cookie
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // 3. Handle /login page (Portal Publik Masjid)
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // 4. If unauthenticated -> redirect to /login
  if (!session) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Role-Based Access Control (RBAC)
  const role = session.role;

  // Route: /pengaturan/pengguna, /pengaturan/backup, /api/users, /api/backup -> SUPER_ADMIN only
  if (
    pathname.startsWith("/pengaturan/pengguna") ||
    pathname.startsWith("/pengaturan/backup") ||
    pathname.startsWith("/api/users") ||
    pathname.startsWith("/api/backup")
  ) {
    if (role !== "SUPER_ADMIN") {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Forbidden. Khusus Super Admin." }, { status: 403 });
      }
      if (role === "ADMIN_IBADAH") {
        return NextResponse.redirect(new URL("/kegiatan", request.url));
      }
      if (role === "ADMIN_KEUANGAN") {
        return NextResponse.redirect(new URL("/keuangan", request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Route: /keuangan & /api/keuangan -> SUPER_ADMIN or ADMIN_KEUANGAN
  if (pathname.startsWith("/keuangan") || pathname.startsWith("/api/keuangan")) {
    if (role !== "SUPER_ADMIN" && role !== "ADMIN_KEUANGAN") {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Forbidden. Anda tidak memiliki akses ke Keuangan." }, { status: 403 });
      }
      if (role === "ADMIN_IBADAH") {
        return NextResponse.redirect(new URL("/kegiatan", request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Route: Surat (/surat-keluar, /surat-masuk, /pengurus) -> SUPER_ADMIN or ADMIN_SURAT
  if (
    pathname.startsWith("/surat-keluar") ||
    pathname.startsWith("/surat-masuk") ||
    pathname.startsWith("/pengurus") ||
    pathname.startsWith("/fasilitas") ||
    pathname.startsWith("/api/surat-keluar") ||
    pathname.startsWith("/api/surat-masuk") ||
    pathname.startsWith("/api/pengurus") ||
    pathname.startsWith("/api/fasilitas") ||
    pathname.startsWith("/api/pengaturan/running-text")
  ) {
    if (role !== "SUPER_ADMIN" && role !== "ADMIN_SURAT") {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Forbidden. Anda tidak memiliki akses ke Modul Surat." }, { status: 403 });
      }
      if (role === "ADMIN_IBADAH") {
        return NextResponse.redirect(new URL("/kegiatan", request.url));
      }
      return NextResponse.redirect(new URL("/keuangan", request.url));
    }
  }

  // Route: Kegiatan Masjid (/kegiatan, /api/kegiatan) -> SUPER_ADMIN or ADMIN_IBADAH
  if (pathname.startsWith("/kegiatan") || pathname.startsWith("/api/kegiatan")) {
    if (role !== "SUPER_ADMIN" && role !== "ADMIN_IBADAH" && role !== "ADMIN_SURAT") {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Forbidden. Anda tidak memiliki akses ke Modul Kegiatan." }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/keuangan", request.url));
    }
  }

  // Root route "/" redirection for ADMIN_KEUANGAN and ADMIN_IBADAH
  if (pathname === "/") {
    if (role === "ADMIN_KEUANGAN") {
      return NextResponse.redirect(new URL("/keuangan", request.url));
    }
    if (role === "ADMIN_IBADAH") {
      return NextResponse.redirect(new URL("/kegiatan", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

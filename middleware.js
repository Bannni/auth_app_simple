import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

/**
 * Middleware Auth & Authorization
 * - 401: belum login
 * - 403: salah role
 */
export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1️⃣ Lewatin route NextAuth (WAJIB)
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 2️⃣ Ambil token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 3️⃣ BELUM LOGIN → UNAUTHORIZED
  if (!token && pathname.startsWith("/dashboard")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 4️⃣ SUDAH LOGIN TAPI SALAH ROLE → FORBIDDEN
  if (token) {
    if (pathname.startsWith("/dashboard/admin") && token.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (pathname.startsWith("/dashboard/user") && token.role !== "user") {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  // 5️⃣ LOLOS SEMUA CEK
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";

type RoleObject = { name?: string; slug?: string; role?: string };
type RoleShape = string | RoleObject;
type TokenWithRoles = JWT & { roles?: RoleShape[] };

// Fungsi untuk mengarahkan ke halaman login Admin/General
function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/auth/login";
  url.searchParams.set(
    "callbackUrl",
    req.nextUrl.pathname + req.nextUrl.search
  );
  return NextResponse.redirect(url);
}

// Fungsi untuk mengarahkan ke halaman login Customer (untuk rute /me atau /cart)
function redirectCustomer(req: NextRequest) {
  const url = req.nextUrl.clone();
  // Mengarahkan ke login front-end
  url.pathname = "/login";
  url.searchParams.set(
    "callbackUrl",
    req.nextUrl.pathname + req.nextUrl.search
  );
  return NextResponse.redirect(url);
}

const roleName = (r: RoleShape): string =>
  typeof r === "string" ? r : r.name ?? r.slug ?? r.role ?? "";

const isSuperadmin = (roles?: RoleShape[]): boolean =>
  Array.isArray(roles) &&
  roles.some((r) => roleName(r).toLowerCase() === "superadmin");

const isAdmin = (roles?: RoleShape[]): boolean =>
  Array.isArray(roles) &&
  roles.some((r) => ["superadmin", "admin"].includes(roleName(r).toLowerCase())); // ✅ Perluas isAdmin untuk memasukkan Superadmin

// Fungsi untuk memeriksa apakah user memiliki role admin atau superadmin
const isAdminOrSuperadmin = (roles?: RoleShape[]): boolean =>
  isSuperadmin(roles) || isAdmin(roles); // Menggunakan fungsi isAdmin yang diperluas

export async function middleware(req: NextRequest) {
  const token = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as TokenWithRoles | null;

  const pathname = req.nextUrl.pathname;

  // --- Logika Akses /me dan /cart (Customer) ---
  if (pathname === "/me" || pathname === "/cart") {
    // Customer harus memiliki token
    if (!token) {
      return redirectCustomer(req);
    }
    // Lanjutkan jika token ada (Asumsi: token non-admin/superadmin diperbolehkan)
    return NextResponse.next();
  }

  // --- Logika Akses /admin/:path* (Admin & Superadmin) ---
  if (pathname.startsWith("/admin")) {
    if (!token) {
      // Jika mencoba akses /admin tanpa token, arahkan ke login admin
      return redirectToLogin(req);
    }

    // ⛔️ Perbaikan: Batasi akses hanya jika BUKAN admin atau superadmin
    if (!isAdminOrSuperadmin(token.roles)) {
      // Jika token ada tapi role bukan admin/superadmin, blokir akses
      // dan arahkan ke login admin/general (atau halaman 403 jika Anda punya)
      return redirectToLogin(req);
    }
    
    // Jika token ada DAN role adalah Admin atau Superadmin, lanjutkan
    return NextResponse.next();
  }

  // Lanjutkan untuk rute lain yang diizinkan (jika ada)
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/me", "/cart"],
};
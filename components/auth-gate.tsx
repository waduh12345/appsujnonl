"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getSession } from "next-auth/react";

// Daftar route publik yang boleh tanpa login
const PUBLIC_ALLOW: string[] = [
  "/auth/login",
  "/siswa/login",
  "/siswa/register",
  "/cek-validasi",
  "/api",
  "/_next",
  "/icons",
  "/images",
  "/favicon.ico",
  "/manifest.json",
  "/apple-touch-icon.png",
  "/digital-kta-logo.png",
];

function isPublicPath(pathname: string) {
  return PUBLIC_ALLOW.some((p) => pathname === p || pathname.startsWith(p));
}

export default function AuthGate() {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    // Lewatkan route publik & aset supaya tidak loop
    if (isPublicPath(pathname)) return;

    (async () => {
      const session = await getSession();
      if (cancelled) return;

      // Jika session kosong => paksa login siswa
      if (!session) {
        const qs = searchParams?.toString();
        const callbackUrl = qs ? `${pathname}?${qs}` : pathname;
        router.replace(
          `/siswa/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, searchParams, router]);

  return null;
}
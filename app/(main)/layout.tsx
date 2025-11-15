"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideBottomNav = pathname?.startsWith("/cek-validasi") ?? false;

  return (
    <div
      className={`min-h-screen bg-background ${
        hideBottomNav ? "pb-0" : "pb-20"
      }`}
    >
      <main className="max-w-lg mx-auto">{children}</main>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
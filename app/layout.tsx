import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SwRegister from "@/components/SwRegister";
import ReduxProvider from "@/providers/redux";
import { Suspense } from "react"; // ➕
import AuthGate from "@/components/auth-gate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digital KTA",
  description:
    "Aplikasi keanggotaan digital untuk mengelola data anggota, status keanggotaan, dan berbagai layanan koperasi secara online.",
  icons: {
    icon: "/digital-kta-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ff3b30" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="mask-icon"
          href="/icons/android-chrome-192x192.png"
          color="#ff3b30"
        />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          {/* 🔐 Blokir semua halaman saat session kosong, kecuali route publik */}
          <Suspense fallback={null}>
            <AuthGate />
          </Suspense>

          {children}
          <SwRegister />
        </ReduxProvider>
      </body>
    </html>
  );
}
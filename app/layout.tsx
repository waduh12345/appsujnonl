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
  title: "Ujian Online - Masbettet",
  description: "Aplikasi ujian online untuk sekolah",
  icons: {
    icon: "/masbettet-logo.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#30cfffff" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="mask-icon"
          href="/icons/android-chrome-192x192.png"
          color="#30cfffff"
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

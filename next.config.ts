/** @type {import('next').NextConfig} */
import type { NextConfig } from "next";

// 1. Import withPWA
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  // 💡 Hapus opsi 'disable' di production (jika ada)
  // disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  // ... konfigurasi yang sudah ada
  images: {
    unoptimized: true,
    domains: [
      "lyzj3ipx9y.ufs.sh",
      "api-cuti.naditechno.id",
      "api-jasa.naditechno.id",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api-cuti.naditechno.id",
        port: "",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "api-jasa.naditechno.id",
        port: "",
        pathname: "/storage/**",
      },
      { protocol: "https", hostname: "api.qrserver.com" },
    ],
  },
  // Pastikan agar konfigurasi PWA tidak memengaruhi
  // pengalaman development.
  // Jika di development, PWA akan dinonaktifkan.
  // Ini opsional, tapi disarankan.
  // pwa: {
  //   disable: process.env.NODE_ENV === 'development',
  //   dest: 'public',
  //   register: true,
  //   skipWaiting: true,
  // },
};

// 2. Export konfigurasi yang sudah dibungkus
export default withPWA(nextConfig);
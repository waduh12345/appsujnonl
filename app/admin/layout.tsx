"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardCheck,
  Megaphone,
  Settings,
  MapPin,
  Network,
  UserCog,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import Header from "@/components/admin-components/header";
import Sidebar from "@/components/admin-components/sidebar";
import { AdminLayoutProps, MenuItem } from "@/types";
import { useSession } from "next-auth/react";
import type { User } from "@/types/user";
import ClientAuthGuard from "@/components/client-guards";

// Fungsi pembantu untuk cek role (memperhatikan struktur roles[0].name)
const userHasRole = (user: User | undefined, roleName: string): boolean => {
  if (!user || !user.roles || user.roles.length === 0) {
    return false;
  }
  // Cek apakah role pertama (asumsi role utama) sesuai, atau cek seluruh array roles jika perlu
  return user.roles[0].name?.toLowerCase() === roleName.toLowerCase();
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user as User | undefined;
  
  // Menutup sidebar saat ukuran layar berubah ke desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Definisi menu untuk superadmin (SEMUA MENU)
  const superadminMenuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/admin/dashboard",
    },
    {
      id: "keanggotaan",
      label: "Keanggotaan",
      icon: <Users className="h-5 w-5" />,
      href: "/admin/keanggotaan",
    },
    {
      id: "kantor",
      label: "Kantor",
      icon: <Building2 className="h-5 w-5" />,
      href: "/admin/kantor",
    },
    // {
    //   id: "wallet",
    //   label: "Wallet",
    //   icon: <Wallet className="h-5 w-5" />,
    //   href: "/admin/wallet",
    // },
    {
      id: "task",
      label: "Tugas",
      icon: <ClipboardCheck className="h-5 w-5" />,
      href: "/admin/tugas",
      // ... (children task)
    },
    {
      id: "pengumuman",
      label: "Pengumuman",
      icon: <Megaphone className="h-5 w-5" />,
      href: "/admin/pengumuman",
    },
    {
      id: "konfigurasi",
      label: "Konfigurasi",
      icon: <Settings className="h-5 w-5" />,
      href: "#",
      children: [
        {
          id: "konfigurasi/provinsi",
          label: "Provinsi",
          icon: <MapPin className="h-4 w-4" />,
          href: "/admin/master/provinsi",
        },
        {
          id: "konfigurasi/kota",
          label: "Kota",
          icon: <MapPin className="h-4 w-4" />,
          href: "/admin/master/kota",
        },
        {
          id: "konfigurasi/kecamatan",
          label: "Kecamatan",
          icon: <MapPin className="h-4 w-4" />,
          href: "/admin/master/kecamatan",
        },
        {
          id: "konfigurasi/kelurahan",
          label: "Kelurahan",
          icon: <MapPin className="h-4 w-4" />,
          href: "/admin/master/kelurahan",
        },
        {
          id: "konfigurasi/level",
          label: "Struktur Partai",
          icon: <Network className="h-4 w-4" />,
          href: "/admin/master/level",
        },
        {
          id: "konfigurasi/kategori-tugas",
          label: "Kategori Tugas",
          icon: <Network className="h-4 w-4" />,
          href: "/admin/master/kategori-tugas",
        },
        {
          id: "konfigurasi/jenis-kantor",
          label: "Jenis Kantor",
          icon: <Network className="h-4 w-4" />,
          href: "/admin/master/jenis-kantor",
        },
        {
          id: "konfigurasi/pengelola",
          label: "Data Pengguna",
          icon: <UserCog className="h-4 w-4" />,
          href: "/admin/pengelola",
        },
        {
          id: "konfigurasi/role",
          label: "Role",
          icon: <ShieldCheck className="h-4 w-4" />,
          href: "/admin/role",
        },
      ],
    },
  ];

  // ✅ DEFINISI MENU KHUSUS UNTUK ADMIN
  const adminMenuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/admin/dashboard",
    },
    {
      id: "keanggotaan",
      label: "Keanggotaan",
      icon: <Users className="h-5 w-5" />,
      href: "/admin/keanggotaan",
    },
    {
      id: "kantor",
      label: "Kantor",
      icon: <Building2 className="h-5 w-5" />,
      href: "/admin/kantor",
    },
    {
      id: "task",
      label: "Tugas",
      icon: <ClipboardCheck className="h-5 w-5" />,
      href: "/admin/tugas",
      // Jika Anda ingin Admin melihat submenu tugas, tambahkan children di sini:
      // children: [ ... ]
    },
  ];

  // ✅ Tentukan menu items berdasarkan role pengguna
  let menuItems: MenuItem[] = [];
  
  if (user) {
    if (userHasRole(user, "superadmin")) {
      menuItems = superadminMenuItems;
    } else if (userHasRole(user, "admin")) {
      menuItems = adminMenuItems;
    }
  }

  // Jika tidak ada user atau role tidak dikenali, menu akan kosong (sesuai let menuItems = [])
  // Ini membantu mencegah akses ke menu jika otentikasi belum selesai.
  
  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        menuItems={menuItems}
      />

      {/* Konten Utama */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />

        {/* Konten Halaman */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-2">
            <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-2">
              <ClientAuthGuard
                excludedRoutes={["/auth", "/auth/login", "/public", "/"]}
                excludedFetchPrefixes={["/api/auth/", "/auth/"]}
                loginPath="/auth/login"
              />
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
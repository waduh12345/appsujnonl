"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Folders, Trophy } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/lms", label: "LMS", icon: Folders },
  { href: "/tryout", label: "Tryout", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    // Mengubah: Latar belakang putih (bg-white) dan bayangan lebih tegas

    <nav className="fixed bottom-0 left-0 right-0 bg-[#D1E8FC] border-t border-gray-200 safe-area-bottom z-50 no-print shadow-xl">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <div
              key={item.href}
              className={`
                flex flex-col items-center justify-center gap-0.5 w-20 h-14 p-1 
                transition-all duration-300 ease-in-out rounded-lg
                ${
                  isActive
                    ? // Status aktif: Teks Sky Blue (text-sky-500), Latar belakang Sky Blue yang lembut (bg-sky-500/10)
                      "text-white"
                    : // Status tidak aktif: Teks abu-abu gelap (text-gray-500), Efek hover yang halus
                      "text-gray-500 hover:bg-gray-100/50 hover:text-gray-700"
                }
              `}
            >
              <Link
                href={item.href}
                className={`
                flex flex-col items-center justify-center gap-0.5 w-14 p-4 
                transition-all duration-300 ease-in-out rounded-full
                ${
                  isActive
                    ? // Status aktif: Teks Sky Blue (text-sky-500), Latar belakang Sky Blue yang lembut (bg-sky-500/10)
                      "text-white bg-sky-500 border-2 **border-white ring-4 ring-sky-500** rounded-full shadow-md translate-y-[-30px]"
                    : // Status tidak aktif: Teks abu-abu gelap (text-gray-500), Efek hover yang halus
                      "text-gray-500 hover:bg-gray-100/50 hover:text-gray-700"
                }
              `}
              >
                {/* Ikon dan Teks */}
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
              </Link>
              {isActive && (
                <span
                  className={`
                  text-[12px] font-medium mt-0.5
                  ${
                    isActive
                      ? "text-sky-500 translate-y-[-20px]"
                      : "text-gray-500"
                  }
                `}
                >
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

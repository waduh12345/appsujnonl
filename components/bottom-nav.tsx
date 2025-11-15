"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Bell, User } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/task", label: "Task", icon: ClipboardList },
  { href: "/pengumuman", label: "Pengumuman", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom z-50 no-print">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


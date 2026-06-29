"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  History,
  LayoutDashboard,
  Settings,
  UserRound,
} from "lucide-react";
import { cn } from "@/utils/cn";

const navItems = [
  { href: "/matches", label: "Matches", icon: LayoutDashboard },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/history", label: "History", icon: History },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/90 px-2 py-2 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/90 md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex transform-gpu flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-medium transition-[transform,color,background-color] hover:scale-[1.03] active:scale-95",
                isActive
                  ? "bg-coral-500/10 text-coral-600 dark:text-coral-200"
                  : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10",
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

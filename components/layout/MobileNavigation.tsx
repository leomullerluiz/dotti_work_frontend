"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Bookmark,
  History,
  LayoutDashboard,
  Settings,
  Trophy,
  UserRound,
} from "lucide-react";
import { useBadges } from "@/hooks/useBadges";
import { useSavedProjects } from "@/hooks/useSavedProjects";
import { cn } from "@/utils/cn";

const navItems = [
  { href: "/matches", label: "Matches", icon: LayoutDashboard },
  { href: "/top-repositories", label: "Top", icon: Trophy },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/history", label: "History", icon: History },
  { href: "/badges", label: "Badges", icon: Award },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNavigation() {
  const pathname = usePathname();
  const { unseenAwardedCount } = useBadges();
  const { savedProjects } = useSavedProjects();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/90 px-2 py-2 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/90 md:hidden">
      <div className="grid grid-cols-7 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const count =
            item.href === "/saved"
              ? savedProjects.length
              : item.href === "/badges"
                ? unseenAwardedCount
                : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex transform-gpu flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium transition-[transform,color,background-color] hover:scale-[1.03] active:scale-95",
                isActive
                  ? "bg-coral-500/10 text-coral-600 dark:text-coral-200"
                  : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10",
              )}
            >
              <Icon size={18} />
              {count > 0 ? (
                <span className="absolute right-2 top-1 min-w-4 rounded-full bg-coral-500 px-1 text-center text-[10px] leading-4 text-white">
                  {count > 99 ? "99+" : count}
                </span>
              ) : null}
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

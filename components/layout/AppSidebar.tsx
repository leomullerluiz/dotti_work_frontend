"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Bookmark,
  History,
  LayoutDashboard,
  RotateCcw,
  Settings,
  Trophy,
  UserRound,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { buttonClasses } from "@/components/ui/Button";
import { useBadges } from "@/hooks/useBadges";
import { useSavedProjects } from "@/hooks/useSavedProjects";
import { cn } from "@/utils/cn";
import { Logo } from "./Logo";
import { ProfileSummaryCard } from "./ProfileSummaryCard";

const navItems = [
  { href: "/matches", label: "Matches", icon: LayoutDashboard },
  { href: "/top-repositories", label: "Top repositories", icon: Trophy },
  { href: "/saved", label: "Saved projects", icon: Bookmark },
  { href: "/history", label: "History", icon: History },
  { href: "/badges", label: "Achievements", icon: Award },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { unseenAwardedCount } = useBadges();
  const { savedProjects } = useSavedProjects();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-zinc-200 bg-white/85 px-4 py-5 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/85 md:flex md:flex-col">
      <Logo />
      <nav className="mt-8 space-y-1">
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
                "flex transform-gpu items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-[transform,color,background-color] hover:scale-[1.01] active:scale-[0.99]",
                isActive
                  ? "bg-coral-500/10 text-coral-700 dark:text-coral-200"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white",
              )}
            >
              <span className="flex items-center gap-3">
                <Icon size={18} />
                {item.label}
              </span>
              {count > 0 ? (
                <span className="rounded-full bg-coral-500 px-2 py-0.5 text-[11px] text-white">
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-4">
        <ProfileSummaryCard />
        <Link
          href="/onboarding"
          className={buttonClasses({
            variant: "outline",
            className: "w-full",
          })}
        >
          <RotateCcw size={16} />
          Redo onboarding
        </Link>
        <LogoutButton className="w-full" />
      </div>
    </aside>
  );
}

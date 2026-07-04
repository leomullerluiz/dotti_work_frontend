import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { buttonClasses } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Logo } from "./Logo";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 -mx-4 border-b border-zinc-200 bg-app/85 px-4 py-3 backdrop-blur-xl dark:border-white/10 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="md:hidden">
          <Logo />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/onboarding"
            className={buttonClasses({
              variant: "outline",
              size: "sm",
              className: "hidden sm:inline-flex",
            })}
          >
            <RotateCcw size={15} />
            Redo onboarding
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { MobileNavigation } from "./MobileNavigation";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-app text-zinc-950 dark:text-white">
      <AppSidebar />
      <div className="min-h-screen md:pl-72">
        <AppHeader />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}

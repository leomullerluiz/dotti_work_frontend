"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import {
  Button,
  type ButtonSize,
  type ButtonVariant,
} from "@/components/ui/Button";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/hooks/useAuth";
import { normalizeReturnTo } from "@/services/dotti/client";

export function LogoutButton({
  className,
  label = "Sign out",
  size = "sm",
  variant = "outline",
}: {
  className?: string;
  label?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, logout } = useAuth();
  const { showToast } = useToast();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);

    try {
      await logout();
      showToast("Signed out", "info");

      const returnTo = normalizeReturnTo(pathname, "/matches");
      router.replace(`/login?return_to=${encodeURIComponent(returnTo)}`);
    } catch {
      setIsPending(false);
      showToast("Could not sign out. Please try again.", "error");
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={isPending || status === "checking"}
    >
      {isPending ? <Loader2 className="animate-spin" size={16} /> : <LogOut size={16} />}
      {label}
    </Button>
  );
}

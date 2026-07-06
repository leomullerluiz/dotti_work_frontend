"use client";

import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { getOptionalAuthenticatedUser } from "@/services/dotti/auth";

type AuthState = "checking" | "authenticated" | "unauthenticated";

export function LandingAuthActions() {
  const [state, setState] = useState<AuthState>("checking");

  useEffect(() => {
    let isCurrent = true;

    getOptionalAuthenticatedUser()
      .then((session) => {
        if (isCurrent) {
          setState(session ? "authenticated" : "unauthenticated");
        }
      })
      .catch(() => {
        if (isCurrent) {
          setState("unauthenticated");
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  if (state === "authenticated") {
    return (
      <a href="/matches" className={buttonClasses({ size: "sm" })}>
        <UserRound size={15} />
        My Profile
      </a>
    );
  }

  return (
    <>
      <a href="/login">Login</a>
      <a
        href="/onboarding"
        className={buttonClasses({
          size: "sm",
          className: state === "checking" ? "opacity-80" : undefined,
        })}
      >
        Start
      </a>
    </>
  );
}

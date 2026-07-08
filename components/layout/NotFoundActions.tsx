"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { getOptionalAuthenticatedUser } from "@/services/dotti/auth";

type SessionState = "checking" | "authenticated" | "unauthenticated";

export function NotFoundActions() {
  const [sessionState, setSessionState] = useState<SessionState>("checking");

  useEffect(() => {
    let isMounted = true;

    getOptionalAuthenticatedUser()
      .then((session) => {
        if (!isMounted) {
          return;
        }

        setSessionState(session ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setSessionState("unauthenticated");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (sessionState === "checking") {
    return (
      <span
        className={buttonClasses({
          className: "mt-6 pointer-events-none opacity-70",
        })}
      >
        Checking session...
      </span>
    );
  }

  const isAuthenticated = sessionState === "authenticated";

  return (
    <Link
      href={isAuthenticated ? "/matches" : "/"}
      className={buttonClasses({ className: "mt-6" })}
    >
      {isAuthenticated ? "Go to matches" : "Go home"}
    </Link>
  );
}

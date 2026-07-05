"use client";

import { useEffect } from "react";
import { cleanupLocalStorage } from "@/services/dotti/localStorageStrategy";
import { useAuth } from "./AuthContext";

export function LocalStorageMaintenance() {
  const { status } = useAuth();

  useEffect(() => {
    if (status === "checking") {
      return;
    }

    cleanupLocalStorage({
      storage: window.localStorage,
      isAuthenticated: status === "authenticated",
    });
  }, [status]);

  return null;
}

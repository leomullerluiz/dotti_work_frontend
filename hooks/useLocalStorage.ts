"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

const localStorageEventName = "dotti-local-storage";

function parseSnapshot<T>(snapshot: string | null, fallback: T) {
  if (!snapshot) {
    return fallback;
  }

  try {
    return JSON.parse(snapshot) as T;
  } catch {
    return fallback;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [fallback] = useState(initialValue);
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const onStorage = (event: StorageEvent) => {
        if (event.key === key) {
          onStoreChange();
        }
      };

      const onLocalStorage = (event: Event) => {
        if (event instanceof CustomEvent && event.detail?.key === key) {
          onStoreChange();
        }
      };

      window.addEventListener("storage", onStorage);
      window.addEventListener(localStorageEventName, onLocalStorage);

      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(localStorageEventName, onLocalStorage);
      };
    },
    [key],
  );

  const getSnapshot = useCallback(() => window.localStorage.getItem(key), [key]);
  const getServerSnapshot = useCallback(() => null, []);
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const value = useMemo(
    () => parseSnapshot(snapshot, fallback),
    [fallback, snapshot],
  );

  const setValue = useCallback(
    (nextValue: T | ((currentValue: T) => T)) => {
      const currentValue = parseSnapshot(window.localStorage.getItem(key), fallback);
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (currentValue: T) => T)(currentValue)
          : nextValue;

      window.localStorage.setItem(key, JSON.stringify(resolvedValue));
      window.dispatchEvent(
        new CustomEvent(localStorageEventName, { detail: { key } }),
      );
    },
    [fallback, key],
  );

  return [value, setValue, true] as const;
}

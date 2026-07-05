"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { parseProjectDetailPath, projectDetailHref } from "@/utils/projectRoutes";

export function ProjectPathRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const parsed = parseProjectDetailPath(pathname);

    if (parsed) {
      router.replace(projectDetailHref(parsed.owner, parsed.repo));
    }
  }, [pathname, router]);

  return null;
}

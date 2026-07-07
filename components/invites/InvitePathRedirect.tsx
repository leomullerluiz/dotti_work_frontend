"use client";

import { useEffect } from "react";
import { inviteFallbackHref, parseInvitePath } from "@/utils/inviteRoutes";

export function InvitePathRedirect() {
  useEffect(() => {
    const parsed = parseInvitePath(window.location.pathname);
    if (!parsed || parsed.code === "_") {
      return;
    }

    window.location.replace(inviteFallbackHref(parsed.code));
  }, []);

  return null;
}

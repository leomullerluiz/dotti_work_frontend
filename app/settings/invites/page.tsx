import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { InviteSettingsPage } from "@/components/invites/InviteSettingsPage";

export const metadata: Metadata = {
  title: "Invites - dotti.work",
};

export default function SettingsInvitesRoute() {
  return (
    <RequireAuth>
      <InviteSettingsPage />
    </RequireAuth>
  );
}

import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { InviteSettingsPage } from "@/components/invites/InviteSettingsPage";
import { AppProviders } from "@/contexts/AppProviders";

export const metadata: Metadata = {
  title: "Invites - dotti.work",
};

export default function SettingsInvitesRoute() {
  return (
    <AppProviders>
      <RequireAuth>
        <InviteSettingsPage />
      </RequireAuth>
    </AppProviders>
  );
}

import type { Metadata } from "next";
import { PublicInvitePage } from "@/components/invites/PublicInvitePage";
import { AppProviders } from "@/contexts/AppProviders";

export const metadata: Metadata = {
  title: "Invite - dotti.work",
};

export default function InviteRoute() {
  return (
    <AppProviders>
      <PublicInvitePage />
    </AppProviders>
  );
}

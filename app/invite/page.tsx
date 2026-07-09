import type { Metadata } from "next";
import { PublicInvitePage } from "@/components/invites/PublicInvitePage";

export const metadata: Metadata = {
  title: "Invite - dotti.work",
};

export default function InviteRoute() {
  return <PublicInvitePage />;
}

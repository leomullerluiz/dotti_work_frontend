import type { Metadata } from "next";
import { PublicInvitePage } from "@/components/invites/PublicInvitePage";
import { AppProviders } from "@/contexts/AppProviders";

export const metadata: Metadata = {
  title: "Invite - dotti.work",
};

export function generateStaticParams() {
  return [
    {
      code: "_",
    },
  ];
}

export default async function InviteRoute({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <AppProviders>
      <PublicInvitePage code={code} />
    </AppProviders>
  );
}

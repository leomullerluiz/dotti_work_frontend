import { Suspense } from "react";
import type { Metadata } from "next";
import { PublicUserProfilePage } from "@/components/public-profile/PublicUserProfilePage";

export const metadata: Metadata = {
  title: "Public profile - dotti.work",
  description: "Public dotti.work profile.",
  twitter: {
    card: "summary",
  },
};

export default function PublicProfileRoute() {
  return (
    <Suspense fallback={null}>
      <PublicUserProfilePage />
    </Suspense>
  );
}

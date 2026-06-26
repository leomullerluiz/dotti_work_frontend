import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "dotti.work - Open source project matching",
  description:
    "Discover open source repositories matched to your stack, seniority, and contribution goals.",
};

export default function Home() {
  return <LandingPage />;
}

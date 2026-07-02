import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/LoginPage";

export const metadata: Metadata = {
  title: "Login - dotti.work",
};

export default async function LoginRoute({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string | string[] }>;
}) {
  const params = await searchParams;
  const returnTo = Array.isArray(params.return_to)
    ? params.return_to[0]
    : params.return_to;

  return <LoginPage returnTo={returnTo} />;
}

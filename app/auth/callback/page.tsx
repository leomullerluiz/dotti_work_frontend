import type { Metadata } from "next";
import { AuthCallbackPage } from "@/components/auth/AuthCallbackPage";

export const metadata: Metadata = {
  title: "GitHub callback - dotti.work",
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AuthCallbackRoute({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string | string[];
    reason?: string | string[];
    return_to?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const status = firstParam(params.status);
  const reason = firstParam(params.reason);
  const returnTo = firstParam(params.return_to);

  if (status === "error") {
    console.log("[dotti.auth.callback] GitHub OAuth returned an error", {
      status,
      reason,
      returnTo,
      raw: params,
    });
  }

  return (
    <AuthCallbackPage
      status={status}
      reason={reason}
      returnTo={returnTo}
    />
  );
}

import { MultiStepOnboarding } from "@/components/onboarding/MultiStepOnboarding";
import { AppProviders } from "@/contexts/AppProviders";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ complete?: string | string[] }>;
}) {
  const params = await searchParams;
  const complete =
    (Array.isArray(params.complete) ? params.complete[0] : params.complete) === "1";

  return (
    <AppProviders>
      <MultiStepOnboarding completeAfterOAuth={complete} />
    </AppProviders>
  );
}

import { Suspense } from "react";
import { MultiStepOnboarding } from "@/components/onboarding/MultiStepOnboarding";
import { AppProviders } from "@/contexts/AppProviders";

export default function OnboardingPage() {
  return (
    <AppProviders>
      <Suspense fallback={null}>
        <MultiStepOnboarding />
      </Suspense>
    </AppProviders>
  );
}

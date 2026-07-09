import { Suspense } from "react";
import { MultiStepOnboarding } from "@/components/onboarding/MultiStepOnboarding";

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <MultiStepOnboarding />
    </Suspense>
  );
}

import { MultiStepOnboarding } from "@/components/onboarding/MultiStepOnboarding";
import { AppProviders } from "@/contexts/AppProviders";

export default function OnboardingPage() {
  return (
    <AppProviders>
      <MultiStepOnboarding />
    </AppProviders>
  );
}

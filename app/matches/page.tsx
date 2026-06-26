import { MatchesPage } from "@/components/projects/MatchesPage";
import { AppProviders } from "@/contexts/AppProviders";

export default function MatchesRoute() {
  return (
    <AppProviders>
      <MatchesPage />
    </AppProviders>
  );
}

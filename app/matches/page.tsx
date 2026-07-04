import { MatchesPage } from "@/components/projects/MatchesPage";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppProviders } from "@/contexts/AppProviders";

export default function MatchesRoute() {
  return (
    <AppProviders>
      <RequireAuth>
        <MatchesPage />
      </RequireAuth>
    </AppProviders>
  );
}

import { SavedProjectsPage } from "@/components/projects/SavedProjectsPage";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppProviders } from "@/contexts/AppProviders";

export default function SavedRoute() {
  return (
    <AppProviders>
      <RequireAuth>
        <SavedProjectsPage />
      </RequireAuth>
    </AppProviders>
  );
}

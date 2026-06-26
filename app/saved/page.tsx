import { SavedProjectsPage } from "@/components/projects/SavedProjectsPage";
import { AppProviders } from "@/contexts/AppProviders";

export default function SavedRoute() {
  return (
    <AppProviders>
      <SavedProjectsPage />
    </AppProviders>
  );
}

import { SavedProjectsPage } from "@/components/projects/SavedProjectsPage";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function SavedRoute() {
  return (
    <RequireAuth>
      <SavedProjectsPage />
    </RequireAuth>
  );
}

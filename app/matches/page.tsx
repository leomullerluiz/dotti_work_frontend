import { MatchesPage } from "@/components/projects/MatchesPage";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function MatchesRoute() {
  return (
    <RequireAuth>
      <MatchesPage />
    </RequireAuth>
  );
}

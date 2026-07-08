import { BadgesPage } from "@/components/badges/BadgesPage";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppProviders } from "@/contexts/AppProviders";

export default function BadgesRoute() {
  return (
    <AppProviders>
      <RequireAuth>
        <BadgesPage />
      </RequireAuth>
    </AppProviders>
  );
}

import { BadgesPage } from "@/components/badges/BadgesPage";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function BadgesRoute() {
  return (
    <RequireAuth>
      <BadgesPage />
    </RequireAuth>
  );
}

import { ProfilePage } from "@/components/profile/ProfilePage";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppProviders } from "@/contexts/AppProviders";

export default function ProfileRoute() {
  return (
    <AppProviders>
      <RequireAuth>
        <ProfilePage />
      </RequireAuth>
    </AppProviders>
  );
}

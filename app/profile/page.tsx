import { ProfilePage } from "@/components/profile/ProfilePage";
import { AppProviders } from "@/contexts/AppProviders";

export default function ProfileRoute() {
  return (
    <AppProviders>
      <ProfilePage />
    </AppProviders>
  );
}

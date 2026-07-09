import { ProfilePage } from "@/components/profile/ProfilePage";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function ProfileRoute() {
  return (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  );
}

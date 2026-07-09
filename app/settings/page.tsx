import { SettingsPage } from "@/components/settings/SettingsPage";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function SettingsRoute() {
  return (
    <RequireAuth>
      <SettingsPage />
    </RequireAuth>
  );
}

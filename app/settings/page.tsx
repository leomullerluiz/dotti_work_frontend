import { SettingsPage } from "@/components/settings/SettingsPage";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppProviders } from "@/contexts/AppProviders";

export default function SettingsRoute() {
  return (
    <AppProviders>
      <RequireAuth>
        <SettingsPage />
      </RequireAuth>
    </AppProviders>
  );
}

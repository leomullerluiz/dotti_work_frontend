import { SettingsPage } from "@/components/settings/SettingsPage";
import { AppProviders } from "@/contexts/AppProviders";

export default function SettingsRoute() {
  return (
    <AppProviders>
      <SettingsPage />
    </AppProviders>
  );
}

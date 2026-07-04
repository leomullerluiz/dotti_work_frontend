import { HistoryPage } from "@/components/history/HistoryPage";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppProviders } from "@/contexts/AppProviders";

export default function HistoryRoute() {
  return (
    <AppProviders>
      <RequireAuth>
        <HistoryPage />
      </RequireAuth>
    </AppProviders>
  );
}

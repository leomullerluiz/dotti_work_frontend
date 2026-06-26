import { HistoryPage } from "@/components/history/HistoryPage";
import { AppProviders } from "@/contexts/AppProviders";

export default function HistoryRoute() {
  return (
    <AppProviders>
      <HistoryPage />
    </AppProviders>
  );
}

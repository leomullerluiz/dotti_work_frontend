import { HistoryPage } from "@/components/history/HistoryPage";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function HistoryRoute() {
  return (
    <RequireAuth>
      <HistoryPage />
    </RequireAuth>
  );
}

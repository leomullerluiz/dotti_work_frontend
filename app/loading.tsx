import { LoadingState } from "@/components/ui/LoadingState";

export default function Loading() {
  return (
    <div className="min-h-screen bg-app p-6">
      <LoadingState label="Loading dotti.work..." />
    </div>
  );
}

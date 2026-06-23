import { Badge } from "@/components/ui/Badge";

export function StackBadge({ children }: { children: string }) {
  return <Badge tone="blue">{children}</Badge>;
}

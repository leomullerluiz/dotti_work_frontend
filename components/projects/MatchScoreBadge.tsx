import { Badge } from "@/components/ui/Badge";

export function MatchScoreBadge({ score }: { score: number }) {
  return <Badge tone={score >= 88 ? "success" : "accent"}>{score}% Match</Badge>;
}
